import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import type { HourlyUsage, DailyUsage } from '../mockData';
import { Calendar, Clock, BarChart3, Info, TrendingUp } from 'lucide-react';

interface UsageChartProps {
  hourlyData: HourlyUsage[];
  weeklyData: DailyUsage[];
}

// ── Custom Tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, isHourly }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-slate-950/95 border border-white/10 rounded-xl p-3.5 shadow-2xl text-xs min-w-[180px]">
      <p className="font-extrabold text-emerald-400 mb-2">
        {isHourly ? `🕐 ${label}` : `📅 ${label}`}
      </p>
      {isHourly ? (
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Consumo Real</span>
            <span className="font-extrabold text-emerald-400">{d?.kwh?.toFixed(3)} kWh</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Meta Eficiente</span>
            <span className="font-bold text-slate-300">{d?.baseline?.toFixed(3)} kWh</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Climatización</span>
            <span className="font-bold text-rose-400">{d?.hvac?.toFixed(3)} kWh</span>
          </div>
          {d?.wasteEstimate > 0.05 && (
            <div className="mt-1 pt-1 border-t border-white/5 flex justify-between gap-4">
              <span className="text-rose-400 font-bold">⚠ Desperdicio</span>
              <span className="font-extrabold text-rose-400">{d?.wasteEstimate?.toFixed(3)} kWh</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Consumo</span>
            <span className="font-extrabold text-emerald-400">{d?.kwh?.toFixed(1)} kWh</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Costo</span>
            <span className="font-bold text-teal-400">${d?.cost?.toFixed(2)} USD</span>
          </div>
          <div className={`font-bold mt-1 ${d?.wasteDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
            {d?.wasteDetected ? '⚠ Derroche detectado' : '✓ Consumo óptimo'}
          </div>
        </div>
      )}
    </div>
  );
};

export default function UsageChart({ hourlyData, weeklyData }: UsageChartProps) {
  const [viewMode, setViewMode]       = useState<'hourly' | 'weekly'>('hourly');
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'waste'>('total');

  const isHourly = viewMode === 'hourly';

  // Recharts needs plain-key objects; HourlyUsage already is one.
  // For weekly we map dayName → name so XAxis works uniformly.
  const weeklyChartData = weeklyData.map(d => ({ ...d, name: d.dayName }));

  // avg baseline for reference line
  const avgBaseline = isHourly
    ? parseFloat((hourlyData.reduce((s, h) => s + h.baseline, 0) / hourlyData.length).toFixed(3))
    : 0;

  return (
    <div className="glass-panel-glow rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col h-full">
      {/* Background glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-emerald-400 h-5 w-5" />
            Monitoreo de Energía
          </h2>
          <p className="text-xs text-slate-400">Visualiza patrones de consumo y áreas de optimización</p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 self-stretch sm:self-auto">
          <button
            onClick={() => setViewMode('hourly')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isHourly ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Clock size={13} /><span>Por Horas</span>
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              !isHourly ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Calendar size={13} /><span>Historial</span>
          </button>
        </div>
      </div>

      {/* Metric filters (hourly only) */}
      {isHourly && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedMetric('total')}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              selectedMetric === 'total'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-transparent text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-300'
            }`}
          >
            <TrendingUp size={11} className="inline mr-1" />Consumo Real vs Meta
          </button>
          <button
            onClick={() => setSelectedMetric('waste')}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              selectedMetric === 'waste'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-transparent text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-300'
            }`}
          >
            ⚠ Puntos de Desperdicio
          </button>
        </div>
      )}

      {/* ── Chart Body ────────────────────────────────────────────── */}
      <div className="flex-1 min-h-[260px]">
        {isHourly ? (
          /* HOURLY AREA CHART */
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gradKwh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.40} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}    />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#475569"
                fontSize={10}
                tick={{ fill: '#64748b' }}
                interval={3}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tick={{ fill: '#64748b' }}
                tickFormatter={(v) => `${v}`}
                unit=" kWh"
                width={52}
              />
              <Tooltip
                content={<CustomTooltip isHourly />}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
              />

              {selectedMetric === 'total' && (
                <>
                  {/* baseline reference line */}
                  <ReferenceLine
                    y={avgBaseline}
                    stroke="#64748b"
                    strokeDasharray="4 4"
                    label={{ value: `Meta ${avgBaseline} kWh`, fill: '#64748b', fontSize: 9, position: 'insideTopRight' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kwh"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#gradKwh)"
                    name="Consumo Real (kWh)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#34d399', stroke: '#070b13', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="#475569"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="transparent"
                    name="Meta Eficiente"
                    dot={false}
                  />
                </>
              )}

              {selectedMetric === 'waste' && (
                <Area
                  type="monotone"
                  dataKey="wasteEstimate"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fill="url(#gradWaste)"
                  name="Desperdicio Estimado (kWh)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#fb7185', stroke: '#070b13', strokeWidth: 2 }}
                />
              )}

              <Legend
                wrapperStyle={{ fontSize: '10px', color: '#64748b', paddingTop: '8px' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          /* WEEKLY BAR CHART */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }} barSize={22}>
              <defs>
                <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#065f46" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="gradBarWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#f43f5e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#9f1239" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={10} tick={{ fill: '#64748b' }} />
              <YAxis stroke="#475569" fontSize={10} tick={{ fill: '#64748b' }} unit=" kWh" width={52} />
              <Tooltip
                content={<CustomTooltip isHourly={false} />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar
                dataKey="kwh"
                radius={[4, 4, 0, 0]}
                name="Consumo Semanal (kWh)"
                fill="url(#gradBar)"
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#64748b', paddingTop: '8px' }} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Info notice ──────────────────────────────────────────── */}
      <div className="mt-4 p-3 bg-slate-900/40 rounded-xl border border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
        <Info size={14} className="text-emerald-400 shrink-0 mt-0.5" />
        <p>
          {isHourly
            ? 'Pasa el cursor sobre las curvas para ver consumo por hora, climatización y desperdicios en detalle.'
            : 'Historial de consumo de los últimos 7 días escalado según tu configuración actual.'}
        </p>
      </div>
    </div>
  );
}
