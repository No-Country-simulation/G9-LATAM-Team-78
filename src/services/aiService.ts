import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializamos la IA con la llave de entorno de Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const isDemoMode = !apiKey || apiKey === 'tu_llave_secreta_aqui' || apiKey.trim() === '';

const genAI = !isDemoMode ? new GoogleGenerativeAI(apiKey) : null;

const ENERGIAI_SYSTEM_PROMPT = `
Eres EnergiAI, un asistente experto en eficiencia energética y ahorro de electricidad en el hogar.
Tu objetivo es analizar el consumo de energía del usuario, clasificar su perfil de uso, detectar desperdicios y recomendar acciones claras.

Reglas de comportamiento:
1. Sé amable, empático y motivador.
2. Da respuestas cortas, directas y fáciles de entender en español.
3. Usa viñetas (•) para listar los consejos de ahorro de forma muy limpia.
4. Si el usuario te da datos de consumo altos, prioriza soluciones de bajo costo primero (ej. apagar luces, cambiar horarios de uso, regular el termostato).
5. Mantén un tono optimista y enfocado en el ahorro financiero y ecológico.
`;

export async function enviarMensajeAlAgente(
  historial: { role: 'user' | 'model'; parts: string }[],
  nuevoMensaje: string,
  contextoConsumo?: string
): Promise<string> {
  // Modo Demostración sin API Key
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 1200)); // Latencia simulada
    const lowerMessage = nuevoMensaje.toLowerCase();

    if (contextoConsumo && (lowerMessage.includes('analizar') || lowerMessage.includes('diagnóstico') || lowerMessage.includes('consumo') || lowerMessage.includes('diagnostico'))) {
      return `¡Hola! He analizado los datos de consumo de tu hogar. ⚡

Aquí tienes mi diagnóstico inicial del desperdicio:
• **Climatización (42%):** Tienes picos de consumo muy elevados al mediodía (13:00 - 15:00) alcanzando hasta 1.48 kWh. Te sugiero ajustar tu aire a **24°C** constante y usar persianas para bloquear el sol directo. Ahorrarías hasta un 18%.
• **Iluminación (6%):** Tienes un patrón inusual de luces encendidas de 18:00 a 21:00 en habitaciones inactivas. El cambio a luces LED inteligentes de 9W y el apagado automático te ahorrarían $5 USD al mes.
• **Consumo Vampiro (1%):** Dispositivos en modo de espera (consolas de videojuegos, televisores, cargadores) consumen energía constantemente. Desconéctalos usando regletas con interruptor.

¿Te gustaría consejos detallados de bajo costo para alguno de estos electrodomésticos?`;
    }

    if (lowerMessage.includes('nevera') || lowerMessage.includes('refrigerador')) {
      return `La nevera representa el **16% de tu consumo diario**. Al estar activa 24h, pequeños detalles marcan la diferencia:
• **Ajuste de Temperatura:** Mantén el refrigerador a 4°C y el congelador a -18°C. Grados más bajos aumentan tu consumo un 6% por grado.
• **Gomas del sello:** Asegúrate de que las puertas sellen al 100%. Limpia los empaques con agua tibia.
• **Ventilación trasera:** Deja 10-15 cm de separación con la pared para que el condensador disipe el calor de manera eficiente.`;
    }

    if (lowerMessage.includes('aire') || lowerMessage.includes('ac') || lowerMessage.includes('temperatura') || lowerMessage.includes('climatización') || lowerMessage.includes('climatizacion')) {
      return `La climatización es tu mayor oportunidad de ahorro, siendo el **42% del gasto**:
• **La regla de oro:** Cada grado por debajo de 24°C aumenta el consumo del aire un 8%.
• **Mantenimiento:** Limpia los filtros cada mes. Un filtro tapado reduce la eficiencia del flujo de aire y exige más energía del motor.
• **Enfriamiento inteligente:** Usa el modo "Sleep" (Noche) para que aumente 1°C automáticamente a media noche, adaptándose a la temperatura de tu cuerpo.`;
    }

    return `¡Hola! Soy EnergiAI. Estoy listo para ayudarte a auditar tu consumo de energía y reducir tu recibo de luz.

*Nota: Estás ejecutando el asistente en modo demostración. Para desbloquear el análisis dinámico completo en vivo con la IA de Gemini, ingresa tu clave API en el archivo \`.env\`.*

¿De qué electrodoméstico o hábito de consumo te gustaría recibir consejos prácticos hoy?`;
  }

  // Llamada real al SDK de Gemini
  try {
    const model = genAI!.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: ENERGIAI_SYSTEM_PROMPT,
    });

    // Formatear historial al esquema requerido por el SDK
    // El SDK de Gemini exige que el primer mensaje del historial sea del usuario.
    // Eliminamos los mensajes iniciales del modelo (ej. el saludo de bienvenida) antes de enviar.
    const rawHistory = historial.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts }],
    }));

    // Eliminar mensajes del modelo al inicio (hasta encontrar el primer 'user')
    let firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
    const history = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

    // Siempre inyectar contexto al inicio del mensaje si está disponible
    let mensajeEnviar = nuevoMensaje;
    if (contextoConsumo) {
      mensajeEnviar = `Analiza estos datos de mi consumo energético y responde a mi consulta:\n\n${contextoConsumo}\n\nConsulta: ${nuevoMensaje}`;
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(mensajeEnviar);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error en la conexión con EnergiAI (Gemini):", error);
    return "Lo siento, experimenté un error al comunicarme con EnergiAI. Por favor verifica que tu clave API sea válida y tengas conexión de red.";
  }
}

/**
 * analizarConsumoConAgente
 * Envía el contexto dinámico completo del perfil del usuario a Gemini y solicita
 * un diagnóstico estructurado en 3 partes: picos de consumo, dispositivos críticos
 * y 2 consejos inmediatos de ahorro de bajo costo.
 */
export async function analizarConsumoConAgente(contextoDinamico: string): Promise<string> {
  // Modo Demo
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 1800));
    return `📊 **Diagnóstico Completo de tu Consumo Eléctrico**

**1. Análisis de Picos de Consumo:**
• Los mayores picos de energía ocurren entre las **13:00 y 15:00** (climatización al máximo solar) y entre las **18:00 y 21:00** (retorno al hogar, iluminación + cocina activa).
• Tu perfil de consumo nocturno sugiere que el mayor gasto se concentra al final del día.

**2. Dispositivos en Estado Crítico o Alerta:**
• 🔴 **Climatización (CRÍTICO):** Representa el mayor gasto y supera el umbral de eficiencia recomendado para tu tipo de inmueble. Requiere acción inmediata.
• 🟡 **Iluminación (ALERTA):** Detectadas luces activas en horarios de baja ocupación. Ajuste con sensores de movimiento recomendado.

**3. Tus 2 Consejos de Ahorro Prioritarios:**
• 💡 **Ajusta el termostato a 24°C:** Cada grado menos incrementa el consumo un 8%. Subir 2°C el aire acondicionado puede reducir tu factura mensual entre $8–$15 USD.
• ⏱️ **Cambia el horario de lavadora y horno:** Usar estos aparatos entre las 10:00 y 12:00 (fuera de pico) reduce el costo real de la energía consumida.

¿Deseas un plan detallado de ahorro semana a semana?`;
  }

  // Llamada real a Gemini
  try {
    const model = genAI!.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: ENERGIAI_SYSTEM_PROMPT,
    });

    const promptDiagnostico = `
${contextoDinamico}

POR FAVOR REALIZA LO SIGUIENTE EN TU RESPUESTA:
1. **Análisis de Picos:** Identifica en qué horas del día se registra el mayor gasto eléctrico basándote en las horas de alto consumo y el perfil horario configurado. Sé específico con los intervalos de tiempo.
2. **Dispositivos Críticos o en Alerta:** Revisa la lista de equipos y menciona específicamente cuál o cuáles tienen estado 'wasteful' o 'normal con alto consumo', explicando brevemente por qué representan un riesgo en la factura.
3. **2 Consejos Imediatos de Bajo Costo:** Da exactamente 2 recomendaciones prácticas, baratas y fáciles de aplicar HOY MISMO para reducir la próxima factura, basadas en el tipo de inmueble, la cantidad de equipos y el horario de alto consumo del usuario.

Usa formato claro con emojis y negritas **así** para resaltar los puntos clave. Dirígete al usuario por su nombre si está disponible en los datos.
    `;

    const result = await model.generateContent(promptDiagnostico);
    return result.response.text();
  } catch (error) {
    console.error("Error al analizar datos con el Agente:", error);
    return "No pude leer los datos del medidor en este momento. Por favor, verifica tu conexión e intenta de nuevo.";
  }
}
