import { Zap, Bot, Database, Activity } from 'lucide-react';
import { getEnergySummary } from '../mockData';

export default function Navbar() {
  const summary = getEnergySummary();
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isDemo = !apiKey || apiKey === 'tu_llave_secreta_aqui' || apiKey.trim() === '';

  // Get status color and labels for active profile
  const profileNames = {
    Eficiente: 'Eficiente (Bajo consumo en general)',
    Moderado: 'Consumo Moderado (Algunas fugas de energía)',
    Ineficiente: 'Consumo Crítico (Derroche severo registrado)',
  };

  const profileConfig = {
    Eficiente: { label: profileNames.Eficiente, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    Moderado: { label: profileNames.Moderado, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    Ineficiente: { label: profileNames.Ineficiente, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  };

  const status = profileConfig[summary.profile];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-md">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] animate-pulse">
          <Zap className="text-emerald-400 h-6 w-6" fill="currentColor" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              EnergiAI
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
              v1.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-wide font-medium">Hackatón ONE - Eficiencia Inteligente</p>
        </div>
      </div>

      {/* Profile & API Badges */}
      <div className="flex items-center gap-3">
        {/* Dynamic Energy Profile */}
        <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${status.color}`}>
          <Activity size={14} className="animate-pulse" />
          <span>{status.label}</span>
        </div>

        {/* API connection indicator */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
          isDemo 
            ? 'bg-slate-800/60 text-slate-400 border-slate-700/50' 
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          {isDemo ? (
            <>
              <Database size={13} className="text-slate-400" />
              <span>Simulador</span>
            </>
          ) : (
            <>
              <Bot size={13} className="text-emerald-400 animate-bounce" />
              <span>Gemini Activo</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
