# ⚡ Guía de Estructura y Funcionamiento de EnergiAI

Este documento detalla la arquitectura completa del proyecto **EnergiAI**, las instrucciones paso a paso para recrearlo desde cero y el funcionamiento técnico de cada uno de sus componentes.

---

## 🏗️ 1. Estructura de Directorios

El proyecto está organizado bajo la estructura estándar de React (Vite + TypeScript) con un enfoque en componentes modulares y limpios:

```text
energiai/
├── src/
│   ├── assets/                 # Logotipos y recursos visuales de la aplicación
│   ├── components/             # Componentes visuales de la interfaz (UI)
│   │   ├── Navbar.tsx          # Encabezado glassmorphic y estados de conexión
│   │   ├── UsageChart.tsx      # Gráfico SVG interactivo (Consumo real vs Meta)
│   │   └── ChatAgent.tsx       # Asistente virtual (Chat de IA con chips de sugerencias)
│   ├── services/               # Conexiones con APIs externas
│   │   └── aiService.ts        # Adaptador del SDK de Google Gemini con fallback offline
│   ├── mockData.ts             # Base de datos simulada y utilidades de cálculo de consumo
│   ├── index.css               # Estilos globales de Tailwind CSS v4 y glassmorphism
│   ├── App.css                 # Archivo vacío (para evitar conflictos de estilos)
│   ├── App.tsx                 # Contenedor principal del Dashboard
│   └── main.tsx                # Punto de entrada de React y renderizado
├── backend/                    # Motor principal de IA y API en Python (FastAPI)
│   ├── main.py                 # Lógica de ML y endpoints SAPI
│   └── modelo/                 # Modelos serializados (Random Forest)
├── springboot-backend/         # API Gateway corporativo en Java (Spring Boot)
│   └── src/main/java/...       # Controladores, Servicios y DTOs (proxy hacia Python)
├── docs/                       # Documentación adicional
│   └── api_contract.md         # Copia del contrato de API
├── SAPI_Endpoint.md            # Definición formal del contrato API (SAPI)
├── .env                        # Variables de entorno (Llave secreta de Gemini)
├── index.html                  # Plantilla HTML base y configuración SEO
├── package.json                # Gestión de dependencias y scripts del proyecto
└── vite.config.ts              # Configuración de Vite y plugin de Tailwind CSS v4
```

---

## 🛠️ 2. Guía de Instalación y Configuración Inicial

Si necesitas recrear este proyecto desde cero en una carpeta vacía, sigue estos pasos secuenciales:

### Paso 1: Crear el proyecto con Vite
Ejecuta la inicialización especificando la plantilla de React con TypeScript en modo no interactivo:
```bash
npx -y create-vite@latest . --template react-ts --no-interactive
```

### Paso 2: Instalar las dependencias del proyecto
Instala las librerías para la conexión con el modelo de lenguaje de Google, iconografía y los paquetes de compilación de Tailwind CSS v4:
```bash
# Dependencias principales
npm install @google/generative-ai lucide-react

# Dependencias de diseño (Tailwind CSS v4)
npm install tailwindcss @tailwindcss/vite
```

### Paso 3: Configurar el compilador de Tailwind en Vite
Edita el archivo `vite.config.ts` para importar y registrar el plugin de Tailwind CSS v4:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### Paso 4: Cargar los estilos y la tipografía en `src/index.css`
Abre `src/index.css`, importa las tipografías premium desde Google Fonts (`Outfit` para títulos y `Plus Jakarta Sans` para cuerpo de texto), llama a la directiva de Tailwind y define los tokens de color globales:
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
@import "tailwindcss";

@theme {
  --color-brand-emerald: #10b981;
  --color-brand-dark: #0f172a;
}

:root {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background-color: #090d16;
  color: #f8fafc;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Outfit', sans-serif;
}

/* Clases de utilidad para Glassmorphism */
.glass-panel {
  background: rgba(13, 20, 35, 0.55);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-panel-glow {
  background: rgba(13, 20, 35, 0.65);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 30px -5px rgba(16, 185, 129, 0.12);
}

.glass-input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 15px -3px rgba(16, 185, 129, 0.25);
  outline: none;
}
```

### Paso 5: Configurar variables de entorno `.env`
Crea un archivo `.env` en la raíz para definir tu clave secreta de Gemini:
```env
VITE_GEMINI_API_KEY=tu_llave_secreta_aqui
```

---

## 🤖 3. Funcionamiento de los Módulos del Proyecto

### A. Base de Datos de Consumo (`src/mockData.ts`)
Este archivo actúa como nuestro almacén de telemetría energética simulada y provee algoritmos dinámicos de escalamiento:
* **`mockHourlyUsage`** y **`mockWeeklyUsage`**: Arreglos de referencia base con datos por horas y días.
* **`getDynamicSummary(appliances, tariff)`**: Calcula agregados diarios como costo diario en tiempo real (en base a la tarifa variable configurada), desperdicio total (diferencia por encima del límite target eficiente), ahorro potencial y puntaje de eficiencia energética.
* **`getDynamicHourly(appliances)`**: Escala lineal y proporcionalmente la curva de 24 horas del gráfico SVG para que se adapte instantáneamente a los aumentos o reducciones hechos en el formulario.
* **`getDynamicWeekly(totalKwh, tariff)`**: Adapta los históricos semanales para que guarden relación con el promedio diario ingresado.
* **`getDynamicContext(appliances, summary, tariff)`**: Compila un informe del estado actual configurado por el usuario en texto plano estructurado. Este informe es el que se le envía a Gemini cuando el usuario solicita una auditoría, garantizando diagnósticos reales y 100% personalizados.

### B. Servicio de Inteligencia Artificial (`src/services/aiService.ts`)
Administra la comunicación con la API de Google Gemini utilizando el modelo **`gemini-1.5-flash`** para obtener respuestas rápidas.
* **Modo Offline/Simulador**: Si la clave `VITE_GEMINI_API_KEY` no está configurada o contiene el marcador de posición por defecto, la aplicación **no se rompe**. Ejecuta un algoritmo inteligente local en base a reglas de texto. Si el usuario pregunta por la "nevera", el "aire" o hace clic en "Analizar mi consumo", el simulador devuelve diagnósticos realistas detallados de forma instantánea.
* **Modo Live (Gemini Activo)**: Si la llave API es válida, inicializa la clase `GoogleGenerativeAI`, inyecta el `systemInstruction` (System Prompt) para moldear la personalidad de EnergiAI como experto en ahorro y eficiencia en español, inicializa el chat enviando el historial de la conversación formateado y devuelve la respuesta del modelo de lenguaje.

### C. Barra de Navegación (`src/components/Navbar.tsx`)
Presenta el logotipo del proyecto con una animación de pulso y muestra badges dinámicos del estado de ejecución de la aplicación:
* Muestra el perfil actual del usuario ("Consumo Eficiente", "Consumo Moderado", "Desperdicio Crítico").
* Informa de dónde provienen los diagnósticos del asistente virtual ("Simulador" en gris si es local, o "Gemini Activo" en verde brillante si lee la clave de API).

### D. Gráfico de Consumo SVG (`src/components/UsageChart.tsx`)
Dibuja curvas dinámicas directamente en la pantalla usando elementos **SVG nativos** reactivos a props:
* **Interactividad**: Escucha el evento `onMouseMove` sobre el gráfico SVG para calcular dinámicamente cuál de los 24 puntos del arreglo está más cerca del cursor, actualizando un tooltip detallado flotante con el consumo de clima, la meta y el dinero desperdiciado de esa hora.
* **Filtros**: Permite alternar la vista entre el consumo por horas de hoy o el historial semanal, y superponer el área de desperdicio estimado sobre la curva del consumo.
* **Rendimiento**: Dibuja líneas bezier continuas (`stroke-width`) y rellenos difuminados (`linearGradient`) fluidos acelerados por hardware.

### E. Configurador de Consumo (`src/components/EnergyForm.tsx`)
Provee la interfaz interactiva para manipular los datos en tiempo real:
* **Sliders Interactivos**: Permite ajustar los kWh de Aire Acondicionado, Lavadora, Nevera, Luces y Consumo Vampiro.
* **Tarifa variable**: Configura el valor por kWh en dólares (ej. $0.05 a $0.60) para emular recibos de diferentes regiones o países.
* **Presets de un Clic**: Botones rápidos para cargar perfiles ("Ecológico" para bajo consumo, "Promedio" como línea base simulada, y "Crítico" para simular derroche severo) y comparar el comportamiento del panel instantáneamente.

### F. Agente de Chat (`src/components/ChatAgent.tsx`)
Controla la conversación interactiva con EnergiAI:
* **Sugerencias de un toque (Chips)**: Tarjetas rápidas al inicio que permiten preguntar cosas comunes sin necesidad de escribir.
* **Auditoría Dinámica**: Contiene el botón **"Analizar mi consumo actual"**. Al hacer clic, envía un prompt invisible junto con el texto generado dinámicamente por `getDynamicContext()`, lo que permite al chatbot de IA inspeccionar los datos exactos que el usuario configuró en el formulario y detallar los puntos de derroche en segundos.
* **Fórmulas de Visualización**: Convierte los formatos planos de texto que devuelve la IA (tales como viñetas de puntos y negritas con asteriscos `**`) a elementos HTML reales (`<li>`, `<strong>`) para una lectura limpia y amigable.

### G. Dashboard Integrado (`src/App.tsx`)
El punto de anclaje de todos los módulos anteriores.
* Mantiene los estados compartidos (`appliances`, `tariff`) usando React Hooks y los distribuye a los componentes hijos.
* Organiza las tarjetas de resumen superior (kWh gastados, Costo acumulado, Desperdicios evitables y Ahorro proyectado a fin de mes) recalculados dinámicamente.
* Distribuye el diseño en un grid de 3 paneles principales (Formulario, Gráfico, Asistente) para un flujo de trabajo intuitivo de izquierda a derecha.
* Renderiza una **tabla de auditoría detallada** para cada electrodoméstico, mostrando su potencia nominal, consumo en kWh, costo parcial correspondiente y la acción sugerida inmediata de mitigación de gasto en tiempo real.

---

## 🚀 4. Cómo Correr y Validar el Proyecto

Una vez que tengas el proyecto en tu máquina local:

1. **Instalar paquetes locales**:
   ```bash
   npm install
   ```
2. **Levantar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
3. Abre tu navegador web en la dirección indicada por la consola (normalmente `http://localhost:5173`).
4. Haz pruebas en el chat presionando los botones de sugerencia y el botón de **"Analizar mi consumo actual"**.
5. Para conectarte en vivo con la IA de Google:
   - Ve a [Google AI Studio](https://aistudio.google.com/) y genera una clave API gratuita.
   - Pégala en el archivo `.env` en la raíz del proyecto.
   - Recarga la pestaña del navegador y verás que el estado cambia a **Gemini Activo**.
