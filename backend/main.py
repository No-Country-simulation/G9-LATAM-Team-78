"""
EnergiAI - Backend API REST
===========================
API REST para análisis de consumo energético del Hackathón ONE.
Endpoint: POST /analisis-energetico
Framework: FastAPI (Python)
Modelo: Random Forest serializado con joblib

Instalación:
    pip install fastapi uvicorn scikit-learn pandas numpy joblib

Ejecución:
    uvicorn main:app --reload --port 8000

Documentación automática:
    http://localhost:8000/docs  (Swagger UI)
    http://localhost:8000/redoc (ReDoc)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import joblib
import numpy as np
import json
import os
import uuid
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

# Cargar variables de entorno (busca el .env automáticamente)
load_dotenv()

# Configurar Gemini
gemini_api_key = os.getenv("VITE_GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
else:
    print("[WARNING] VITE_GEMINI_API_KEY no encontrada en .env")

# ── Inicialización de la app ────────────────────────────────────────
app = FastAPI(
    title="EnergiAI API",
    description="API REST para análisis de perfiles de consumo energético - Hackathón ONE",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Habilitar CORS para conexión con el frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tarifa de referencia estándar del hackathón: $0.75 USD/kWh (base global)
TARIFA_REFERENCIA_USD_KWH = 0.75

# ── Configuración por Región/País ───────────────────────────────────
# factor_clima: ajusta el consumo base según temperatura/hábitos.
# tarifa_usd: tarifa promedio estimada por kWh en dólares para esa región.
REGIONES_CONFIG = {
    "USD": {"tarifa_usd": 0.75, "factor_clima": 1.0},
    "MXN": {"tarifa_usd": 0.08, "factor_clima": 1.15},  # Más calor, uso AC
    "COP": {"tarifa_usd": 0.20, "factor_clima": 1.05},
    "ARS": {"tarifa_usd": 0.04, "factor_clima": 1.10},
    "CLP": {"tarifa_usd": 0.16, "factor_clima": 0.90},  # Clima más templado
    "PEN": {"tarifa_usd": 0.18, "factor_clima": 0.95},
    "BRL": {"tarifa_usd": 0.14, "factor_clima": 1.20},  # Cálido y tropical
}

# Historial de análisis en memoria (en producción sería OCI DB o Object Storage)
historial_analisis = {}

# ── Carga del modelo serializado ────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "modelo", "energiai_model.joblib")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "modelo", "label_encoder.joblib")

model = None
label_encoder = None

try:
    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    print(f"[OK] Modelo cargado desde: {MODEL_PATH}")
except FileNotFoundError:
    print("[WARNING] Modelo no encontrado. Usando clasificacion por reglas como fallback.")


# ── Modelos Pydantic (Entrada/Salida) ───────────────────────────────

class EntradaConsumo(BaseModel):
    """
    Datos de entrada para el análisis energético.
    Corresponde a las variables del formulario de usuario.
    """
    consumidor: Optional[str] = Field(default="Usuario", description="Nombre del consumidor")
    consumo_kwh: float = Field(..., ge=0, le=10000, description="Consumo mensual en kWh (de la factura anterior)")
    uso_horario_pico: bool = Field(..., description="True si el mayor consumo es en horario pico (18:00-22:00)")
    cantidad_equipos: int = Field(..., ge=1, le=100, description="Cantidad de equipos eléctricos activos")
    tipo_inmueble: str = Field(..., description="Tipo de inmueble: Casa, Apartamento, Oficina, Comercio")
    horas_alto_consumo: int = Field(..., ge=1, le=24, description="Horas de alto consumo por día")
    moneda_region: str = Field(default="USD", description="Código de región/moneda para métricas locales")

    @validator("tipo_inmueble")
    def validate_tipo_inmueble(cls, v):
        allowed = ["Casa", "Apartamento", "Oficina", "Comercio"]
        if v not in allowed:
            raise ValueError(f"tipo_inmueble debe ser uno de: {allowed}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "consumidor": "María García",
                "consumo_kwh": 420,
                "uso_horario_pico": True,
                "cantidad_equipos": 10,
                "tipo_inmueble": "Casa",
                "horas_alto_consumo": 8,
                "moneda_region": "USD"
            }
        }


class EntradaConsumoUpdate(BaseModel):
    """Modelo para actualizar un análisis existente. Todos los campos son opcionales."""
    consumidor: Optional[str] = None
    consumo_kwh: Optional[float] = Field(None, ge=0, le=10000)
    uso_horario_pico: Optional[bool] = None
    cantidad_equipos: Optional[int] = Field(None, ge=1, le=100)
    tipo_inmueble: Optional[str] = None
    horas_alto_consumo: Optional[int] = Field(None, ge=1, le=24)
    moneda_region: Optional[str] = None


class EstimacionFinanciera(BaseModel):
    consumo_mensual_kwh: float
    tarifa_referencia_usd_kwh: float = TARIFA_REFERENCIA_USD_KWH
    costo_estimado_mensual: float
    ahorro_potencial_mensual: float


class SalidaAnalisis(BaseModel):
    id_analisis: str
    timestamp: str
    consumidor: str
    categoria: str
    probabilidad: float
    recomendaciones: List[str]
    estimacion_financiera: EstimacionFinanciera
    perfil_detalle: dict


# ── Lógica de clasificación ──────────────────────────────────────────

def clasificar_por_reglas(entrada: EntradaConsumo) -> tuple[str, float]:
    """
    Clasificación por reglas de negocio (fallback si no hay modelo).
    Basada en umbrales de consumo por tipo de inmueble y cantidad de equipos.
    """
    # Consumo esperado por tipo de inmueble (kWh/mes)
    baseline_por_tipo = {
        "Casa": 350,
        "Apartamento": 220,
        "Oficina": 500,
        "Comercio": 700,
    }
    # Ajuste por cantidad de equipos
    baseline = baseline_por_tipo.get(entrada.tipo_inmueble, 350)
    baseline += entrada.cantidad_equipos * 8  # ~8 kWh/mes por equipo adicional

    # Ajuste por región/clima
    region = REGIONES_CONFIG.get(entrada.moneda_region, REGIONES_CONFIG["USD"])
    baseline *= region["factor_clima"]

    ratio = entrada.consumo_kwh / max(baseline, 1)

    # Penalización por uso pico y horas de alto consumo
    if entrada.uso_horario_pico:
        ratio *= 1.15
    if entrada.horas_alto_consumo > 8:
        ratio *= 1.10

    if ratio > 1.35:
        return "Ineficiente", round(min(0.99, 0.60 + (ratio - 1.35) * 0.3), 2)
    elif ratio > 1.05:
        return "Moderado", round(0.50 + (ratio - 1.05) * 0.7, 2)
    else:
        return "Eficiente", round(max(0.60, 1.0 - ratio * 0.35), 2)


def clasificar_con_modelo(entrada: EntradaConsumo) -> tuple[str, float]:
    """
    Clasificación usando el modelo Random Forest entrenado.
    """
    tipo_map = {"Casa": 0, "Apartamento": 1, "Oficina": 2, "Comercio": 3}
    features = np.array([[
        entrada.consumo_kwh,
        int(entrada.uso_horario_pico),
        entrada.cantidad_equipos,
        tipo_map.get(entrada.tipo_inmueble, 0),
        entrada.horas_alto_consumo,
    ]])
    categoria_encoded = model.predict(features)[0]
    probas = model.predict_proba(features)[0]
    probabilidad = float(max(probas))
    categoria = label_encoder.inverse_transform([categoria_encoded])[0]
    return categoria, round(probabilidad, 2)


def generar_recomendaciones(entrada: EntradaConsumo, categoria: str) -> List[str]:
    """
    Genera recomendaciones utilizando el modelo Gemini 1.5 Flash.
    Si la API falla, usa recomendaciones de fallback.
    """
    try:
        if not os.getenv("VITE_GEMINI_API_KEY"):
            raise ValueError("No API Key")

        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Actúa como un Experto en Eficiencia Energética de nivel mundial.
        Analiza el siguiente perfil de un consumidor y proporciona exactamente 5 recomendaciones prácticas y personalizadas para reducir su factura de luz.
        Las recomendaciones deben ser oraciones concisas y directas (sin introducción ni conclusión).
        No uses viñetas (como asteriscos o guiones), simplemente proporciona el texto de cada recomendación en una línea nueva.
        
        Perfil del Consumidor:
        - Consumo Mensual: {entrada.consumo_kwh} kWh
        - Uso en Horario Pico: {"Sí" if entrada.uso_horario_pico else "No"}
        - Cantidad de Equipos: {entrada.cantidad_equipos}
        - Tipo de Inmueble: {entrada.tipo_inmueble}
        - Horas de Alto Consumo al día: {entrada.horas_alto_consumo}
        - Clasificación del Modelo de IA: {categoria}
        """
        
        response = model.generate_content(prompt)
        # Dividir por líneas y limpiar
        lineas = response.text.strip().split('\n')
        recs = [linea.strip('- *').strip() for linea in lineas if linea.strip()]
        
        # Limitar a 5 recomendaciones
        return recs[:5] if len(recs) >= 5 else recs + ["Realice un seguimiento mensual comparando su consumo."] * (5 - len(recs))
        
    except Exception as e:
        print(f"[ERROR GEMINI] Falló la generación de recomendaciones: {e}")
        # Fallback estático
        return [
            "Redistribuya el uso de electrodomésticos fuera del horario pico para ahorrar hasta 20%.",
            f"Tiene {entrada.cantidad_equipos} equipos activos, revise cuáles consumen energía en espera (modo vampiro).",
            "Considere reemplazar equipos antiguos por modelos con certificación de ahorro energético.",
            "Utilice iluminación LED en las áreas de mayor uso.",
            "Realice un seguimiento mensual comparando su consumo con el período anterior."
        ]


# ── Endpoints ───────────────────────────────────────────────────────

@app.get("/", tags=["Estado"])
def raiz():
    """Endpoint de verificación de estado del servicio."""
    return {
        "servicio": "EnergiAI API",
        "version": "1.0.0",
        "estado": "activo",
        "endpoints": ["/analisis-energetico", "/resultados/{id}", "/ejemplos", "/docs"]
    }


@app.post("/analisis-energetico", response_model=SalidaAnalisis, tags=["Análisis"])
def analizar_consumo(entrada: EntradaConsumo):
    """
    **Análisis del perfil energético**

    Recibe los datos de consumo del usuario y devuelve:
    - Clasificación del perfil (Eficiente / Moderado / Ineficiente)
    - Probabilidad de la clasificación
    - Recomendaciones personalizadas
    - Estimación financiera con tarifa de referencia $0.75/kWh

    **Ejemplo de uso:**
    ```json
    POST /analisis-energetico
    {
      "consumo_kwh": 420,
      "uso_horario_pico": true,
      "cantidad_equipos": 10,
      "tipo_inmueble": "Casa",
      "horas_alto_consumo": 8
    }
    ```
    """
    try:
        # Clasificar (con modelo ML o con reglas)
        if model is not None and label_encoder is not None:
            categoria, probabilidad = clasificar_con_modelo(entrada)
        else:
            categoria, probabilidad = clasificar_por_reglas(entrada)

        # Generar recomendaciones
        recomendaciones = generar_recomendaciones(entrada, categoria)

        # Estimación financiera según región
        region = REGIONES_CONFIG.get(entrada.moneda_region, REGIONES_CONFIG["USD"])
        tarifa_aplicada = region["tarifa_usd"]
        
        costo_estimado = round(entrada.consumo_kwh * tarifa_aplicada, 2)
        ahorro_potencial = round(costo_estimado * 0.15, 2) if categoria != "Eficiente" else 0.0

        estimacion = EstimacionFinanciera(
            consumo_mensual_kwh=entrada.consumo_kwh,
            tarifa_referencia_usd_kwh=tarifa_aplicada,
            costo_estimado_mensual=costo_estimado,
            ahorro_potencial_mensual=ahorro_potencial,
        )

        # Construir respuesta
        id_analisis = str(uuid.uuid4())[:8]
        resultado = SalidaAnalisis(
            id_analisis=id_analisis,
            timestamp=datetime.now().isoformat(),
            consumidor=entrada.consumidor,
            categoria=categoria,
            probabilidad=probabilidad,
            recomendaciones=recomendaciones,
            estimacion_financiera=estimacion,
            perfil_detalle={
                "consumo_mensual_kwh": entrada.consumo_kwh,
                "tipo_inmueble": entrada.tipo_inmueble,
                "cantidad_equipos": entrada.cantidad_equipos,
                "uso_horario_pico": entrada.uso_horario_pico,
                "horas_alto_consumo": entrada.horas_alto_consumo,
                "moneda_region": entrada.moneda_region,
            }
        )

        # Guardar en historial (en producción: OCI Object Storage)
        historial_analisis[id_analisis] = resultado.dict()

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el análisis: {str(e)}")


@app.get("/resultados/{id_analisis}", tags=["Resultados"])
def consultar_resultado(id_analisis: str):
    """
    **Consulta de resultados por ID**

    Recupera el resultado de un análisis previo por su ID único.
    En producción, los datos se recuperarían desde OCI Object Storage.
    """
    if id_analisis not in historial_analisis:
        raise HTTPException(status_code=404, detail=f"Análisis '{id_analisis}' no encontrado.")
    return historial_analisis[id_analisis]


@app.get("/resultados", tags=["Resultados"])
def listar_resultados():
    """Lista todos los análisis realizados en la sesión actual."""
    return {
        "total": len(historial_analisis),
        "analisis": list(historial_analisis.values())
    }


@app.put("/resultados/{id_analisis}", response_model=SalidaAnalisis, tags=["Resultados"])
def actualizar_resultado(id_analisis: str, actualizacion: EntradaConsumoUpdate):
    """
    **Actualización de análisis (UPDATE)**
    """
    if id_analisis not in historial_analisis:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
        
    resultado_actual = historial_analisis[id_analisis]
    perfil_actual = resultado_actual["perfil_detalle"]
    
    # Reconstruir la entrada completa (usando las claves correctas para EntradaConsumo y el perfil)
    entrada_dict = {
        "consumidor": actualizacion.consumidor if actualizacion.consumidor is not None else resultado_actual["consumidor"],
        "consumo_kwh": actualizacion.consumo_kwh if actualizacion.consumo_kwh is not None else perfil_actual["consumo_mensual_kwh"],
        "uso_horario_pico": actualizacion.uso_horario_pico if actualizacion.uso_horario_pico is not None else perfil_actual["uso_horario_pico"],
        "cantidad_equipos": actualizacion.cantidad_equipos if actualizacion.cantidad_equipos is not None else perfil_actual["cantidad_equipos"],
        "tipo_inmueble": actualizacion.tipo_inmueble if actualizacion.tipo_inmueble is not None else perfil_actual["tipo_inmueble"],
        "horas_alto_consumo": actualizacion.horas_alto_consumo if actualizacion.horas_alto_consumo is not None else perfil_actual["horas_alto_consumo"],
        "moneda_region": actualizacion.moneda_region if actualizacion.moneda_region is not None else perfil_actual.get("moneda_region", "USD"),
    }
    
    nueva_entrada = EntradaConsumo(**entrada_dict)
    
    if model is not None and label_encoder is not None:
        categoria, probabilidad = clasificar_con_modelo(nueva_entrada)
    else:
        categoria, probabilidad = clasificar_por_reglas(nueva_entrada)
        
    recomendaciones = generar_recomendaciones(nueva_entrada, categoria)
    
    region = REGIONES_CONFIG.get(nueva_entrada.moneda_region, REGIONES_CONFIG["USD"])
    tarifa_aplicada = region["tarifa_usd"]
    
    costo_estimado = round(nueva_entrada.consumo_kwh * tarifa_aplicada, 2)
    ahorro_potencial = round(costo_estimado * 0.15, 2) if categoria != "Eficiente" else 0.0
    
    estimacion = EstimacionFinanciera(
        consumo_mensual_kwh=nueva_entrada.consumo_kwh,
        tarifa_referencia_usd_kwh=tarifa_aplicada,
        costo_estimado_mensual=costo_estimado,
        ahorro_potencial_mensual=ahorro_potencial,
    )
    
    nuevo_perfil_detalle = entrada_dict.copy()
    nuevo_perfil_detalle["consumo_mensual_kwh"] = nuevo_perfil_detalle.pop("consumo_kwh")
    
    nuevo_resultado = SalidaAnalisis(
        id_analisis=id_analisis,
        timestamp=datetime.now().isoformat(),
        consumidor=nueva_entrada.consumidor,
        categoria=categoria,
        probabilidad=probabilidad,
        recomendaciones=recomendaciones,
        estimacion_financiera=estimacion,
        perfil_detalle=nuevo_perfil_detalle
    )
    
    historial_analisis[id_analisis] = nuevo_resultado.model_dump() if hasattr(nuevo_resultado, "model_dump") else nuevo_resultado.dict()
    return nuevo_resultado


@app.delete("/resultados/{id_analisis}", tags=["Resultados"])
def eliminar_resultado(id_analisis: str):
    """
    **Eliminación de análisis (DELETE)**
    """
    if id_analisis not in historial_analisis:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
        
    del historial_analisis[id_analisis]
    return {"mensaje": f"Análisis {id_analisis} eliminado exitosamente."}


@app.get("/convertir-moneda", tags=["Moneda"])
def convertir_moneda():
    """
    **Obtiene tasas de cambio actualizadas**
    
    Consume una API externa (exchangerate-api.com) para convertir 
    los costos de USD a monedas de LATAM.
    """
    import urllib.request
    try:
        url = "https://api.exchangerate-api.com/v4/latest/USD"
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
        
        monedas_latam = ["MXN", "COP", "ARS", "CLP", "PEN", "BRL", "USD"]
        tasas = {k: v for k, v in data["rates"].items() if k in monedas_latam}
        
        return {
            "base": "USD",
            "tasas": tasas,
            "ultima_actualizacion": data.get("date", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error conectando con API de moneda: {str(e)}")


@app.get("/ejemplos", tags=["Documentación"])
def ejemplos_uso():
    """
    **Ejemplos de uso del endpoint**

    Devuelve 3 ejemplos simulados de perfiles energéticos
    (requisito mínimo del hackathón).
    """
    return {
        "descripcion": "Ejemplos de perfiles de consumo energético - EnergiAI Hackathón ONE",
        "tarifa_referencia_usd_kwh": TARIFA_REFERENCIA_USD_KWH,
        "ejemplos": [
            {
                "id": 1,
                "perfil": "Eficiente",
                "entrada": {
                    "consumidor": "Ana Martínez",
                    "consumo_kwh": 180,
                    "uso_horario_pico": False,
                    "cantidad_equipos": 6,
                    "tipo_inmueble": "Apartamento",
                    "horas_alto_consumo": 4
                },
                "salida_esperada": {
                    "categoria": "Eficiente",
                    "probabilidad": 0.88,
                    "costo_estimado_mensual": 135.00,
                    "recomendaciones": ["Mantener hábitos actuales", "Considerar paneles solares"]
                }
            },
            {
                "id": 2,
                "perfil": "Moderado",
                "entrada": {
                    "consumidor": "Carlos López",
                    "consumo_kwh": 420,
                    "uso_horario_pico": True,
                    "cantidad_equipos": 10,
                    "tipo_inmueble": "Casa",
                    "horas_alto_consumo": 8
                },
                "salida_esperada": {
                    "categoria": "Moderado",
                    "probabilidad": 0.74,
                    "costo_estimado_mensual": 315.00,
                    "recomendaciones": ["Reducir uso en horario pico", "Programar electrodomésticos en horario valle"]
                }
            },
            {
                "id": 3,
                "perfil": "Ineficiente",
                "entrada": {
                    "consumidor": "Roberto Silva",
                    "consumo_kwh": 980,
                    "uso_horario_pico": True,
                    "cantidad_equipos": 25,
                    "tipo_inmueble": "Casa",
                    "horas_alto_consumo": 14
                },
                "salida_esperada": {
                    "categoria": "Ineficiente",
                    "probabilidad": 0.91,
                    "costo_estimado_mensual": 735.00,
                    "recomendaciones": [
                        "Renovar equipos antiguos por modelos eficientes",
                        "Instalar medidor inteligente",
                        "Reducir uso en horario pico"
                    ]
            }
        ]
    }


class EvaluacionPerfilRequest(BaseModel):
    nombre_consumidor: str = Field(..., description="Nombre o identificador del usuario final")
    tipo_inmueble: str = Field(..., description="casa, apto, oficina, comercio")
    moneda_region: str = Field(..., description="USD, MXN, COP, ARS, CLP, PEN, BRL")
    cantidad_equipos: int
    uso_horario_pico: str = Field(..., description="low, medium, high")
    horas_alto_consumo: str = Field(..., description="tarde, noche, dia")
    consumo_kwh: float

    class Config:
        json_schema_extra = {
            "example": {
                "nombre_consumidor": "Juan Pérez",
                "tipo_inmueble": "casa",
                "moneda_region": "COP",
                "cantidad_equipos": 12,
                "uso_horario_pico": "medium",
                "horas_alto_consumo": "noche",
                "consumo_kwh": 650.0
            }
        }

@app.post("/api/v1/evaluar-perfil", tags=["Evaluación de Perfil"])
def evaluar_perfil(req: EvaluacionPerfilRequest):
    # Lógica base similar a getDynamicSummary en mockData.ts
    
    # Baseline base
    if req.tipo_inmueble == "apto":
        baseline_kwh = 10.0
    elif req.tipo_inmueble in ["oficina", "comercio"]:
        baseline_kwh = 19.5
    else:
        # casa
        baseline_kwh = 16.9

    baseline_kwh += max(0.05, req.cantidad_equipos * 0.01)

    region = REGIONES_CONFIG.get(req.moneda_region, REGIONES_CONFIG["USD"])
    factor_clima = region["factor_clima"]
    tarifa = region["tarifa_usd"]
    
    baseline_kwh *= factor_clima

    # Estimar consumo diario (simplificación para el endpoint)
    # Suponemos que el consumo mensual / 30 es el actual diario
    consumo_diario = req.consumo_kwh / 30.0

    ratio = consumo_diario / max(baseline_kwh, 1.0)
    
    # Penalizaciones
    if req.uso_horario_pico == "high":
        ratio *= 1.2
    elif req.uso_horario_pico == "medium":
        ratio *= 1.05

    if ratio > 1.3:
        perfil = "Ineficiente"
        alerta = "Se detectó derroche crítico. Reduzca el uso en horas pico."
    elif ratio > 1.05:
        perfil = "Moderado"
        alerta = f"Se detectaron picos regulares en la franja {req.horas_alto_consumo}."
    else:
        perfil = "Eficiente"
        alerta = "¡Excelente manejo de la energía!"

    proyeccion_mensual = consumo_diario * 30
    costo_estimado = round(proyeccion_mensual * tarifa, 2)
    ahorro = max(0.0, round((consumo_diario - baseline_kwh) * 30 * tarifa, 2))
    pct_ahorro = round((ahorro / costo_estimado) * 100, 1) if costo_estimado > 0 else 0.0

    return {
        "estado": "success",
        "codigo_http": 200,
        "data": {
            "perfil_energetico": perfil,
            "detalles_evaluacion": {
                "consumo_diario_estimado": round(consumo_diario, 1),
                "proyeccion_mensual_kwh": round(proyeccion_mensual, 1),
                "costo_estimado_mensual": costo_estimado,
                "porcentaje_ahorro": pct_ahorro,
                "alerta_habitos": alerta
            }
        }
    }

