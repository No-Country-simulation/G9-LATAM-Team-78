

# G9-LATAM-Team-78

# ⚡ EnergiAI - Arquitectura y Agentes de IA (React + Vite)

**EnergiAI** es una plataforma interactiva que ayuda a los usuarios a monitorizar su consumo eléctrico, identificar derroches ("consumo vampiro") y recibir recomendaciones personalizadas a través de un modelo de IA. 

Inicialmente construida como un monolito Frontend-Backend, la arquitectura ha evolucionado a un ecosistema robusto de **Microservicios** contenerizados con Docker, listo para ser desplegado en la nube.

---

## 🏗️ Arquitectura del Sistema

El proyecto consta de tres piezas fundamentales orquestadas bajo la misma red virtual:

1.  **Frontend (React + Vite)**: 
    *   Interfaz con diseño "Glassmorphism" responsivo.
    *   Gráficos interactivos SVG nativos.
    *   Chatbot impulsado por **Google Gemini API**.
2.  **API Gateway (Spring Boot / Java 17)**:
    *   Punto de entrada seguro para todas las transacciones.
    *   Intercepta las peticiones de React y las enruta transparentemente.
    *   Preparado para futuras implementaciones de bases de datos relacionales y JWT.
3.  **Microservicio IA (FastAPI / Python)**:
    *   Dedicado 100% al procesamiento de Ciencia de Datos y Machine Learning.
    *   Carga modelos locales generados por Scikit-Learn (`.joblib`).
    *   Calcula probabilidades, predicciones y categorías de eficiencia.

---

## 🚀 Despliegue con Docker (Recomendado)

Si tienes **Docker Desktop** o el motor de Docker instalado en tu sistema, la forma más profesional y rápida de levantar todo el ecosistema es utilizar Docker Compose.

1.  **Construir y levantar los contenedores**:
    ```bash
    docker compose up --build
    ```
2.  **Acceso a los Servicios**:
    *   **Frontend (Aplicación Web):** [http://localhost:3000](http://localhost:3000)
    *   **Backend Java (Gateway):** `http://localhost:8080/api`
    *   **Documentación API (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Ejecución Local para Desarrollo (Sin Docker)

Si prefieres desarrollar de forma tradicional, necesitas levantar los 3 servidores manualmente en terminales diferentes:

### 1. Iniciar Microservicio IA (Python)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Iniciar API Gateway (Java)
```bash
cd springboot-backend
mvn clean spring-boot:run
```
*(Opcional: Si usas un IDE como IntelliJ o Eclipse, simplemente ejecuta la clase `EnergiaiApplication.java`)*.

### 3. Iniciar Frontend (Node)
Abre otra terminal en la raíz del proyecto:
```bash
npm install
npm run dev
```
La aplicación web estará disponible en [http://localhost:5173](http://localhost:5173).

---

## 🔑 Configuración IA Gemini (Opcional)

Para que el asistente de chat integrado responda usando inteligencia real, crea o edita el archivo `.env` en la raíz del proyecto e introduce tu clave de API:

```env
VITE_GEMINI_API_KEY=tu_llave_secreta_de_gemini
```
*(Si no configuras la llave, el chatbot funcionará en modo "Simulador" para permitirte probar la interfaz de todas formas).*
