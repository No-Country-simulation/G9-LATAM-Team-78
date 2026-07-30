# EnergiAI - Arquitectura OCI (Oracle Cloud Infrastructure)

## Diagrama de Arquitectura

```
                    ┌─────────────────────────────────────────────┐
                    │            USUARIO FINAL                     │
                    │   Navegador Web (React + Vite Frontend)      │
                    └──────────────────┬──────────────────────────┘
                                       │ HTTPS
                    ┌──────────────────▼──────────────────────────┐
                    │         OCI LOAD BALANCER                    │
                    │   (Distribución de tráfico / SSL Termination)│
                    └──────────────────┬──────────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                         │
┌─────────────▼──────────┐  ┌─────────▼──────────┐  ┌─────────▼──────────┐
│    OCI COMPUTE (VM)     │  │   OCI OBJECT        │  │  OCI FUNCTIONS     │
│   FastAPI Backend       │  │   STORAGE           │  │  (Procesamiento    │
│   POST /analisis-       │  │                     │  │   por lotes CSV)   │
│   energetico            │  │  • energiai_model   │  │                    │
│                         │  │    .joblib          │  │  Trigger: HTTP     │
│  Python 3.11 + uvicorn  │◄─┤  • label_encoder   │  │  Runtime: Python   │
│  scikit-learn           │  │    .joblib          │  └────────────────────┘
│  RandomForest + LR      │  │  • metadata.json    │
│                         │  │  • dataset.csv      │
└─────────────────────────┘  │  • resultados/      │
                             │    {id_analisis}.   │
                             │    json             │
                             └─────────────────────┘
```

## Servicio OCI Utilizado: Object Storage

### ¿Por qué Object Storage?
- **Almacenamiento del modelo serializado** (`energiai_model.joblib`) para que la API lo cargue en arranque
- **Persistencia de resultados** en formato JSON por análisis (historial)
- **Dataset CSV** para análisis por lotes
- **Sin costo de base de datos** — 
- **Alta disponibilidad** y durabilidad (99.99999%)

### Integración en el código

```python
import oci

# Configuración del cliente OCI
config = oci.config.from_file()  # ~/.oci/config
object_storage = oci.object_storage.ObjectStorageClient(config)

NAMESPACE = "tu_namespace_oci"
BUCKET_NAME = "energiai-bucket"

# Descargar modelo al inicio de la API
def cargar_modelo_desde_oci():
    response = object_storage.get_object(
        namespace_name=NAMESPACE,
        bucket_name=BUCKET_NAME,
        object_name="modelos/energiai_model.joblib"
    )
    with open("/tmp/energiai_model.joblib", "wb") as f:
        f.write(response.data.content)
    return joblib.load("/tmp/energiai_model.joblib")

# Guardar resultado de análisis en OCI
def guardar_resultado_oci(id_analisis: str, resultado: dict):
    json_bytes = json.dumps(resultado, ensure_ascii=False, indent=2).encode()
    object_storage.put_object(
        namespace_name=NAMESPACE,
        bucket_name=BUCKET_NAME,
        object_name=f"resultados/{id_analisis}.json",
        put_object_body=json_bytes,
        content_type="application/json"
    )
```

## Variables de Entorno Requeridas

```bash
# .env (OCI)
OCI_NAMESPACE=tu_namespace
OCI_BUCKET=energiai-bucket
OCI_REGION=sa-saopaulo-1
OCI_CONFIG_PATH=~/.oci/config

# API
TARIFA_REFERENCIA=0.75
MODELO_PATH=/app/modelo/energiai_model.joblib
```

## Despliegue en OCI Compute

```bash
# 1. Conectar a la VM OCI
ssh -i ~/.ssh/oci_key opc@<IP_PUBLICA_OCI>

# 2. Instalar dependencias
sudo dnf install python3.11 python3.11-pip -y
pip3.11 install -r requirements.txt

# 3. Descargar modelo desde OCI Object Storage
python3 -c "from main import cargar_modelo_desde_oci; cargar_modelo_desde_oci()"

# 4. Iniciar API (producción)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2

# 5. Configurar como servicio systemd
sudo systemctl enable energiai-api
sudo systemctl start energiai-api
```

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Estado del servicio |
| POST | `/analisis-energetico` | Análisis del perfil energético |
| GET | `/resultados/{id}` | Consultar resultado por ID |
| GET | `/resultados` | Listar todos los análisis |
| GET | `/ejemplos` | 3 ejemplos de uso (requisito MVP) |
| GET | `/docs` | Documentación Swagger UI |

## Estimación de Costos OCI (Free Tier)

| Servicio | Plan | Incluido en Free Tier |
|----------|------|----------------------|
| OCI Compute (VM.Standard.E2.1.Micro) | Always Free | ✅ 2 instancias |
| OCI Object Storage | Always Free | ✅ 20 GB |
| OCI Load Balancer | Always Free | ✅ 1 instancia 10 Mbps |

> ✅ La arquitectura completa de EnergiAI puede desplegarse **sin costo** usando el **OCI Always Free Tier**.
