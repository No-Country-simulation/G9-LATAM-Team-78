# Especificación del Contrato de la API REST
**A cargo del:** Tech Lead
**Versión:** 1.0.0
**Descripción:** Contrato de comunicación entre el Frontend (React) y el API Gateway (Spring Boot) para el sistema EnergiAI.

---

## 1. Configuración Base
- **Base URL:** `http://localhost:8080/api`
- **Content-Type:** `application/json`
- **Documentación Interactiva (Swagger):** `http://localhost:8080/swagger-ui.html`

---

## 2. Endpoints

### 2.1 Generar Análisis Energético
- **Método:** `POST`
- **Ruta:** `/analisis-energetico`
- **Descripción:** Recibe el perfil del consumidor, lo valida estrictamente y delega el análisis predictivo y las recomendaciones al motor de IA (Gemini/FastAPI).

#### Request Body (Ejemplo)
```json
{
  "consumidor": "María García",
  "consumo_kwh": 350.5,
  "uso_horario_pico": true,
  "cantidad_equipos": 8,
  "tipo_inmueble": "Casa",
  "horas_alto_consumo": 5,
  "moneda_region": "USD"
}
```

#### Reglas de Validación de Entrada (DTO)
| Campo | Tipo | Reglas |
|---|---|---|
| `consumidor` | String | Obligatorio, no vacío |
| `consumo_kwh` | Double | Obligatorio, ≥ 0 |
| `uso_horario_pico` | Boolean | Obligatorio |
| `cantidad_equipos` | Integer | Obligatorio, entre 1 y 100 |
| `tipo_inmueble` | String | Obligatorio, solo: Casa, Apartamento, Oficina, Comercio |
| `horas_alto_consumo` | Integer | Obligatorio, entre 1 y 24 |

#### Response (Éxito: `200 OK`)
```json
{
  "id_analisis": "uuid-1234",
  "timestamp": "2026-07-20T10:00:00Z",
  "consumidor": "María García",
  "categoria": "Ineficiente",
  "probabilidad": 0.88,
  "recomendaciones": [
    "Redistribuya el uso de electrodomésticos fuera del horario pico.",
    "Utilice iluminación LED en las áreas de mayor uso."
  ],
  "estimacion_financiera": {
    "consumo_mensual_kwh": 350.5,
    "tarifa_referencia_usd_kwh": 0.75,
    "costo_estimado_mensual": 262.87,
    "ahorro_potencial_mensual": 45.50
  },
  "perfil_detalle": {
    "consumo_mensual_kwh": 350.5,
    "tipo_inmueble": "Casa",
    "cantidad_equipos": 8,
    "uso_horario_pico": true,
    "horas_alto_consumo": 5,
    "moneda_region": "USD"
  }
}
```

#### Response (Error de Validación: `400 Bad Request`)
Se devuelve cuando la petición no cumple las reglas estrictas del DTO.
```json
{
  "timestamp": "2026-07-20T10:05:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='analisisRequestDTO'. Error count: 1",
  "errors": [
    {
      "field": "consumo_kwh",
      "defaultMessage": "El consumo no puede ser negativo"
    }
  ]
}
```

---

### 2.2 Listar Historial de Análisis
- **Método:** `GET`
- **Ruta:** `/resultados`
- **Descripción:** Obtiene todos los resultados analizados en la sesión actual.

#### Response (`200 OK`)
```json
{
  "total": 1,
  "analisis": [
    {
      "id_analisis": "uuid-1234",
      "categoria": "Ineficiente"
    }
  ]
}
```

---

### 2.3 Convertir Moneda (Tasas LATAM)
- **Método:** `GET`
- **Ruta:** `/convertir-moneda`
- **Descripción:** Obtiene las tasas de conversión vigentes desde USD hacia monedas latinoamericanas (MXN, COP, ARS, etc.).

#### Response (`200 OK`)
```json
{
  "base": "USD",
  "tasas": {
    "MXN": 17.50,
    "COP": 4100.00,
    "ARS": 950.00
  },
  "ultima_actualizacion": "Tue, 21 Jul 2026 00:00:01 +0000"
}
```

---

## 3. Manejo de Errores Estándar
| Código HTTP | Descripción | Causa Común |
|---|---|---|
| **200** | `OK` | Operación procesada exitosamente. |
| **400** | `Bad Request` | Faltan campos obligatorios o tipos de datos incorrectos en el DTO. |
| **404** | `Not Found` | ID de resultado no encontrado. |
| **500** | `Internal Server Error` | Fallo de conexión entre el API Gateway (Spring Boot) y el Motor de IA (FastAPI). |
