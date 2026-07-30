Este documento define el **acuerdo formal de integración (Contrato de API)**.

---

#  Acuerdo de Formato de Datos (API Endpoint Contracto)

**Proyecto:** EnergiAI

**Módulo:** Evaluación de Perfil Energético en Tiempo Real

**Método HTTP:** `POST`

**Ruta sugerida:** `/api/v1/evaluar-perfil`

---

## 1. Estructura de Entrada (Request Body - JSON)

El servidor backend debe enviar un objeto JSON con los siguientes campos y tipos de datos correspondientes al modelo de simulación y el motor de IA de EnergiAI:

```json
{
  "nombre_consumidor": "Juan Pérez",
  "tipo_inmueble": "casa",
  "moneda_region": "COP",
  "cantidad_equipos": 12,
  "uso_horario_pico": "medium",
  "horas_alto_consumo": "noche",
  "consumo_kwh": 650.0
}
```

### Detalle de validación de campos (Request):

* `nombre_consumidor` (String): Nombre o identificador del usuario final.
* `tipo_inmueble` (String): Debe ser estrictamente uno de los siguientes valores: `"casa"`, `"apto"`, `"oficina"`, `"comercio"`.
* `moneda_region` (String): Código de región/moneda para factores climáticos y tarifas: `"USD"`, `"MXN"`, `"COP"`, `"ARS"`, `"CLP"`, `"PEN"`, `"BRL"`.
* `cantidad_equipos` (Integer): Número de dispositivos eléctricos conectados en el inmueble (ej. `12`).
* `uso_horario_pico` (String): Intensidad del consumo en horas pico. Valores permitidos: `"low"`, `"medium"`, `"high"`.
* `horas_alto_consumo` (String): Franja horaria de mayor demanda. Valores permitidos: `"tarde"`, `"noche"`, `"dia"`.
* `consumo_kwh` (Float): Referencia de consumo de la factura mensual anterior en kWh (ej. `650.0`).

---

## 2. Estructura de Salida (Response Body - JSON)

Una vez procesada la lógica (a través del simulador local o la API de Gemini), la API devolverá la respuesta estructurada con los cálculos de eficiencia para el dashboard del frontend:

```json
{
  "estado": "success",
  "codigo_http": 200,
  "data": {
    "perfil_energetico": "Moderado",
    "detalles_evaluacion": {
      "consumo_diario_estimado": 19.5,
      "proyeccion_mensual_kwh": 585.0,
      "costo_estimado_mensual": 117.00,
      "porcentaje_ahorro": 10.0,
      "alerta_habitos": "Se detectaron picos regulares en la franja nocturna."
    }
  }
}
```

---
