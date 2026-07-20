import { useState, useRef, useEffect } from 'react';
import { enviarMensajeAlAgente, analizarConsumoConAgente } from '../services/aiService';
import { Send, Bot, User, Sparkles, BrainCircuit, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: string;
}

const SUGGESTIONS = [
  { text: '❄️ Ahorrar en aire acondicionado', prompt: '¿Cómo puedo reducir el gasto de mi aire acondicionado de forma efectiva y sin perder comodidad?' },
  { text: '🥬 Eficiencia de la nevera', prompt: 'Dame consejos específicos para que mi refrigerador gaste menos electricidad en casa.' },
  { text: '🔌 ¿Qué es el consumo vampiro?', prompt: '¿Qué es el consumo vampiro y cómo puedo combatirlo para bajar mi factura?' }
];

interface ChatAgentProps {
  contextString: string;
}

export default function ChatAgent({ contextString }: ChatAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: '¡Hola! Soy **EnergiAI**, tu asesor energético inteligente. ⚡\n\nAnalizo tus hábitos de consumo para ayudarte a reducir tu factura eléctrica y tu huella de carbono.\n\n¿Quieres que hagamos un análisis detallado? Haz clic en el botón **"Analizar mi consumo actual"** o hazme cualquier pregunta.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string, includeContext = false) => {
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    const userMessage = textToSend;
    
    // Add user message to screen
    const newHistory: Message[] = [...messages, { role: 'user', parts: userMessage }];
    setMessages(newHistory);
    setInput('');

    // Fetch context if requested
    const context = includeContext ? contextString : undefined;

    // Send history (excluding the current user message) to the agent
    const previousHistory = messages;
    const responseText = await enviarMensajeAlAgente(previousHistory, userMessage, context);

    // Add agent response
    setMessages([...newHistory, { role: 'model', parts: responseText }]);
    setLoading(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleAnalyzeCurrentData = async () => {
    if (loading) return;
    setLoading(true);

    // Mostrar el mensaje de solicitud en el historial del chat
    const userTriggerMsg = '📊 [Diagnóstico Automático]: Analiza todos los datos de mi consumo eléctrico actual.';
    const newHistory: Message[] = [...messages, { role: 'user', parts: userTriggerMsg }];
    setMessages(newHistory);
    setInput('');

    // Llamar a la función especializada de diagnóstico con el contexto dinámico
    const diagnosisText = await analizarConsumoConAgente(contextString);
    setMessages([...newHistory, { role: 'model', parts: diagnosisText }]);
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        parts: 'Historial de chat borrado. ¿En qué te puedo asesorar ahora?'
      }
    ]);
  };

  // Helper to render basic bold and list markdown formatting
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Handle list items
      const isListItem = line.trim().startsWith('•') || line.trim().startsWith('*');
      const cleanLine = isListItem ? line.replace(/^[•*]\s*/, '') : line;
      
      // Parse bold **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedText = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isListItem) {
        return (
          <li key={idx} className="ml-5 list-disc pl-1 text-slate-300 leading-relaxed my-1">
            {renderedText}
          </li>
        );
      }

      return (
        <p key={idx} className="leading-relaxed text-slate-200 min-h-[1rem]">
          {renderedText}
        </p>
      );
    });
  };

  return (
    <div className="glass-panel-glow rounded-2xl border border-white/5 flex flex-col h-[580px] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="p-4 bg-emerald-950/45 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Bot size={20} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_#10b981]" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 flex items-center gap-1.5">
              Asistente EnergiAI
              <Sparkles size={13} className="text-yellow-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">Experto de Eficiencia en Línea</p>
          </div>
        </div>

        <button 
          onClick={clearChat}
          title="Borrar chat"
          className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Main Diagnostic Button Trigger */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-white/5 flex items-center justify-between gap-3 shrink-0">
        <span className="text-[11px] text-slate-400 font-medium">¿Listo para auditar tu base de datos?</span>
        <button
          onClick={handleAnalyzeCurrentData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 disabled:cursor-not-allowed text-xs font-bold text-slate-950 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
        >
          <BrainCircuit size={13} className={loading ? 'animate-pulse' : ''} />
          <span>{loading ? 'Analizando métricas...' : 'Analizar mi consumo actual'}</span>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-slate-950/20 scrollbar-thin">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
              {/* Icon avatar */}
              <div className={`p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 border ${
                isUser 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-slate-900 text-slate-300 border-white/5'
              }`}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Balloon Text */}
              <div className={`p-3.5 rounded-2xl text-xs space-y-1.5 border shadow-md leading-relaxed ${
                isUser 
                  ? 'bg-emerald-500/15 text-emerald-100 border-emerald-500/20 rounded-tr-none' 
                  : 'bg-slate-900/80 text-slate-200 border-white/5 rounded-tl-none'
              }`}>
                {isUser ? <p className="whitespace-pre-line">{msg.parts}</p> : <div>{renderMessageContent(msg.parts)}</div>}
              </div>
            </div>
          );
        })}
        
        {/* Loading Spinner */}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 bg-slate-900 border border-white/5 text-slate-400">
              <Bot size={16} />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-900/50 border border-white/5 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold italic animate-pulse">EnergiAI analizando kWh...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 shrink-0 bg-slate-950/20">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(s.prompt)}
              className="text-[10px] px-2.5 py-1 rounded-full border border-white/5 bg-slate-900/60 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
            >
              {s.text}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={onSubmit} className="p-3.5 bg-slate-950/60 border-t border-white/5 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre climatización, nevera, focos o di 'analizar'..."
          disabled={loading}
          className="flex-1 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 glass-input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] text-slate-950 cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
