
# G9-LATAM-Team-78

# ⚡ EnergiAI - Plataforma de Eficiencia Energética con IA

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://g9-latam-team-78-qpen.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)](http://147.15.27.26:8000/docs)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Java-6DB33F?style=for-the-badge&logo=springboot)](http://147.15.27.26:8080/swagger-ui/index.html)
[![GitHub](https://img.shields.io/badge/Repo-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/No-Country-simulation/G9-LATAM-Team-78)

**EnergiAI** es una plataforma interactiva que ayuda a los usuarios a monitorizar su consumo eléctrico, identificar derroches ("consumo vampiro") y recibir recomendaciones personalizadas a través de un modelo de IA.

---

## 🌐 Demo en Producción

| Servicio | URL |
|----------|-----|
| 🌐 **Frontend (Vercel)** | [https://g9-latam-team-78-qpen.vercel.app](https://g9-latam-team-78-qpen.vercel.app) |
| 🐍 **FastAPI Swagger (OCI)** | [http://147.15.27.26:8000/docs](http://147.15.27.26:8000/docs) |
| ☕ **Spring Boot Swagger (OCI)** | [http://147.15.27.26:8080/swagger-ui/index.html](http://147.15.27.26:8080/swagger-ui/index.html) |

---

## 🏗️ Arquitectura del Sistema

El proyecto consta de tres piezas fundamentales orquestadas bajo la misma red virtual:

1.  **Frontend (React + Vite)** — Desplegado en **Vercel**:
    *   Interfaz con diseño "Glassmorphism" responsivo.
    *   Gráficos interactivos SVG nativos.
    *   Conversor de monedas LATAM en tiempo real (MXN, COP, ARS, CLP, PEN, BRL).
    *   Chatbot impulsado por **Google Gemini 2.0 Flash API**.
2.  **API Gateway (Spring Boot / Java 17)** — Desplegado en **Oracle OCI**:
    *   Punto de entrada seguro para todas las transacciones.
    *   Intercepta las peticiones de React y las enruta transparentemente.
    *   Documentación Swagger UI integrada.
3.  **Microservicio IA (FastAPI / Python)** — Desplegado en **Oracle OCI**:
    *   Dedicado 100% al procesamiento de Ciencia de Datos y Machine Learning.
    *   Carga modelos desde OCI Object Storage (`bucket-energiai-modelos`).
    *   Calcula probabilidades, predicciones y categorías de eficiencia.

---

## 🚀 Despliegue con Docker (Recomendado)

Si tienes **Docker Desktop** o el motor de Docker instalado en tu sistema, la forma más profesional y rápida de levantar todo el ecosistema es utilizar Docker Compose.

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/No-Country-simulation/G9-LATAM-Team-78.git
    cd G9-LATAM-Team-78
    ```
2.  **Configurar variables de entorno**:
    ```bash
    cp .env.example .env
    # Editar .env con tu clave de Gemini API
    ```
3.  **Construir y levantar los contenedores**:
    ```bash
    docker compose up --build
    ```
4.  **Acceso a los Servicios**:
    *   **Frontend (Aplicación Web):** [http://localhost:3000](http://localhost:3000)
    *   **Backend Java (Gateway):** `http://localhost:8080/api`
    *   **FastAPI Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
    *   **Spring Boot Swagger:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## 🛠️ Ejecución Local para Desarrollo (Sin Docker)

Si prefieres desarrollar de forma tradicional, necesitas levantar los 3 servidores manualmente:

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

### 3. Iniciar Frontend (Node)
```bash
npm install
npm run dev
```
La aplicación web estará disponible en [http://localhost:5173](http://localhost:5173).

---

## 🔑 Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
# Clave de API de Gemini (agente de IA)
VITE_GEMINI_API_KEY=tu_llave_secreta_de_gemini

# URL del backend (LOCAL o producción OCI)
VITE_BACKEND_URL=http://localhost:8080/api
```

Para Vercel, configura estas variables en **Settings → Environment Variables** en el panel de Vercel.

---

## 👥 Equipo G9-LATAM-Team-78 — Hackathón ONE

Proyecto desarrollado para la simulación No Country — LATAM 2026.
