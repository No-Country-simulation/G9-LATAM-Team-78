# G9-LATAM-Team-78
# ⚡ EnergiAI - Arquitectura y Agentes de IA (React + Vite)

**EnergiAI** es una aplicación web interactiva diseñada para el Hackatón de ONE. Ayuda a los usuarios a monitorizar su consumo eléctrico doméstico en tiempo real, identificar puntos de derroche ("consumo vampiro", picos del aire acondicionado) y recibir recomendaciones personalizadas a través de un chatbot inteligente impulsado por la API de Google Gemini.

---

## ✨ Características Principales

*   **Dashboard Glassmorphic Premium**: Interfaz moderna de alta fidelidad, con colores vibrantes, sombras difusas y soporte responsivo móvil/de escritorio.
*   **Gráficos Interactivos SVG Nativos**: Curvas de consumo por hora y semana, con superposición de metas eficientes y tooltip informativo flotante al pasar el mouse.
*   **Asistente Virtual EnergiAI**: Chat interactivo con el modelo `gemini-1.5-flash` personalizado como experto en ahorro de energía en el hogar.
*   **Modo Simulador Integrado**: Si no se dispone de una clave API activa, el asistente opera de forma autónoma simulando diagnósticos detallados en base al consumo del usuario.
*   **Auditoría de Electrodomésticos**: Desglose detallado del uso de climatización (HVAC), refrigeración, iluminación y electrónica con sus respectivos estados de eficiencia.

---

## 🛠️ Guía Rápida de Uso

1.  **Instalar Dependencias**:
    ```bash
    npm install
    ```
2.  **Iniciar Servidor de Desarrollo**:
    ```bash
    npm run dev
    ```
3.  **Configurar IA Gemini** *(Opcional)*:
    Crea o edita el archivo `.env` en la raíz e introduce tu clave de API:
    ```env
    VITE_GEMINI_API_KEY=tu_llave_secreta_de_gemini
    ```

---

## 📂 Más Información

Para conocer a fondo la estructura de carpetas, el paso a paso detallado de la instalación de dependencias de Tailwind CSS v4, el SDK de Gemini, y el funcionamiento interno del código, consulta la guía técnica:

👉 **[INSTRUCCIONES.md](file:///c:/Users/USUARIO/Downloads/ProjectsGoogle/EnergiAI/INSTRUCCIONES.md)**
