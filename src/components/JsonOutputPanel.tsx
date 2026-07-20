import { useState } from 'react';
import { Code2, Copy, CheckCheck, Download, ChevronDown, ChevronUp, Braces } from 'lucide-react';
import type { ApplianceBreakdown } from '../mockData';

interface JsonOutputPanelProps {
  summary: {
    totalKwh: number;
    baselineKwh: number;
    totalWaste: number;
    currentCost: number;
    potentialSavings: number;
    monthlyProjectionKwh: number;
    costoEstimadoMensual: number;
    savingsOverBillPercent: number;
    profile: 'Eficiente' | 'Moderado' | 'Ineficiente';
  };
  appliances: ApplianceBreakdown[];
  tariff: number;
  consumerName: string;
  propertyType: string;
  deviceQuantity: number;
  previousBillKwh: number;
  peakConsumptionLevel: string;
  highConsumptionTime: string;
}

// Build recommendations list from appliance states
function buildRecommendaciones(appliances: ApplianceBreakdown[]): string[] {
  const recs: string[] = [];
  appliances.forEach(app => {
    if (app.status === 'wasteful') {
      recs.push(app.recommendation);
    }
  });
  // Always add general recommendations
  recs.push('Distribuir las actividades de mayor consumo a lo largo del día');
  recs.push('Monitorear el consumo mensualmente y comparar con la factura anterior');
  return recs.slice(0, 5);
}

// Probability estimate based on ratio vs baseline
function estimarProbabilidad(profile: string, totalKwh: number, baselineKwh: number): number {
  const ratio = totalKwh / Math.max(baselineKwh, 0.1);
  if (profile === 'Ineficiente') return parseFloat(Math.min(0.99, 0.65 + (ratio - 1.3) * 0.3).toFixed(2));
  if (profile === 'Moderado') return parseFloat((0.55 + (ratio - 1.05) * 0.4).toFixed(2));
  return parseFloat(Math.max(0.60, 1 - ratio * 0.35).toFixed(2));
}

export default function JsonOutputPanel({
  summary,
  appliances,
  tariff,
  consumerName,
  propertyType,
  deviceQuantity,
  previousBillKwh,
  peakConsumptionLevel,
  highConsumptionTime,
}: JsonOutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');

  const probabilidad = estimarProbabilidad(summary.profile, summary.totalKwh, summary.baselineKwh);
  const recomendaciones = buildRecommendaciones(appliances);

  // ── API Input payload (POST /analisis-energetico) ──────────────
  const inputPayload = {
    consumidor: consumerName,
    consumo_kwh: previousBillKwh,
    uso_horario_pico: peakConsumptionLevel === 'high',
    cantidad_equipos: deviceQuantity,
    tipo_inmueble: propertyType === 'casa' ? 'Casa' : propertyType === 'apto' ? 'Apartamento' : propertyType === 'oficina' ? 'Oficina' : 'Comercio',
    horas_alto_consumo: highConsumptionTime === 'noche' ? 8 : highConsumptionTime === 'tarde' ? 6 : 9,
  };

  // ── API Output payload (response) ─────────────────────────────
  const outputPayload = {
    categoria: summary.profile,
    probabilidad,
    recomendaciones,
    estimacion_financiera: {
      consumo_mensual_kwh: summary.monthlyProjectionKwh,
      tarifa_referencia_usd_kwh: 0.75,
      costo_estimado_mensual: summary.costoEstimadoMensual,
      costo_con_tarifa_usuario: parseFloat((summary.monthlyProjectionKwh * tariff).toFixed(2)),
      ahorro_potencial_mensual: parseFloat((summary.totalWaste * 30 * 0.75).toFixed(2)),
    },
    perfil_detalle: {
      consumo_diario_kwh: summary.totalKwh,
      meta_eficiencia_kwh: summary.baselineKwh,
      desperdicio_diario_kwh: summary.totalWaste,
      comparativa_factura_anterior_pct: summary.savingsOverBillPercent,
    },
  };

  const activeJson = activeTab === 'input' ? inputPayload : outputPayload;
  const jsonString = JSON.stringify(activeJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energiai-${activeTab}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const profileColors = {
    Eficiente:   'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Moderado:    'text-amber-400   border-amber-500/30   bg-amber-500/10',
    Ineficiente: 'text-rose-400    border-rose-500/30    bg-rose-500/10',
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/60 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Braces size={16} className="text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Salida API REST</h3>
            <p className="text-[10px] text-slate-500 font-medium">
              <code className="text-emerald-400/80">POST /analisis-energetico</code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Profile badge */}
          <span className={`hidden sm:inline-flex px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded border ${profileColors[summary.profile]}`}>
            {summary.profile}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* ── Tabs ─────────────────────────────────────────────── */}
          <div className="flex bg-slate-950/40 border-b border-white/5">
            <button
              onClick={() => setActiveTab('output')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === 'output'
                  ? 'text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              📤 Respuesta (Output)
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === 'input'
                  ? 'text-teal-400 border-b-2 border-teal-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              📥 Entrada (Input)
            </button>
          </div>

          {/* ── Action bar ───────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/20 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Code2 size={11} />
              <span>application/json</span>
              <span className="text-slate-700">·</span>
              <span>{Object.keys(activeJson).length} campos</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-[10px] font-semibold transition-all"
              >
                {copied ? <CheckCheck size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-[10px] font-semibold transition-all"
              >
                <Download size={11} />
                .json
              </button>
            </div>
          </div>

          {/* ── JSON viewer ──────────────────────────────────────── */}
          <div className="overflow-x-auto bg-[#080c12] max-h-72 overflow-y-auto scrollbar-thin">
            <pre className="p-4 text-[11px] leading-relaxed font-mono">
              {jsonString.split('\n').map((line, i) => {
                // Colorize JSON keys, strings, numbers, booleans
                const colorized = line
                  .replace(/("[\w_]+"):/g, '<span style="color:#7dd3fc">$1</span>:')
                  .replace(/: (".*?")/g, ': <span style="color:#86efac">$1</span>')
                  .replace(/: ([\d.]+)/g, ': <span style="color:#fbbf24">$1</span>')
                  .replace(/: (true|false)/g, ': <span style="color:#c084fc">$1</span>');
                return (
                  <div key={i} className="flex">
                    <span className="select-none w-7 shrink-0 text-slate-700 text-right mr-3">{i + 1}</span>
                    <span dangerouslySetInnerHTML={{ __html: colorized }} className="text-slate-300" />
                  </div>
                );
              })}
            </pre>
          </div>

          {/* ── Summary chips ────────────────────────────────────── */}
          {activeTab === 'output' && (
            <div className="px-4 py-3 bg-slate-950/40 border-t border-white/5 flex flex-wrap gap-2">
              <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${profileColors[summary.profile]}`}>
                Categoría: {summary.profile}
              </div>
              <div className="px-2.5 py-1 rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-400 text-[10px] font-bold">
                Costo Mensual: ${summary.costoEstimadoMensual} USD
              </div>
              <div className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                Prob.: {(probabilidad * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
