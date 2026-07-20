import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UsageChart from './components/UsageChart';
import ChatAgent from './components/ChatAgent';
import EnergyForm from './components/EnergyForm';
import JsonOutputPanel from './components/JsonOutputPanel';
import { HistorialPanel } from './components/HistorialPanel';
import { realizarAnalisisApi, getTasasMoneda } from './services/backendService';
import type { AnalisisOutput } from './services/backendService';
import { 
  getDynamicSummary, 
  getDynamicHourly, 
  getDynamicWeekly, 
  getDynamicContext, 
  mockApplianceBreakdown
} from './mockData';
import type { ApplianceBreakdown } from './mockData';
import { 
  Zap, 
  DollarSign, 
  AlertTriangle, 
  TrendingDown, 
  Wind, 
  Lightbulb, 
  Tv, 
  Activity, 
  Sparkles,
  HelpCircle,
  PiggyBank,
  Server
} from 'lucide-react';

export default function App() {
  // ── Appliance & tariff state ──────────────────────────────────
  const [appliances, setAppliances] = useState<ApplianceBreakdown[]>(mockApplianceBreakdown);
  const [tariff, setTariff] = useState<number>(0.75);

  // ── Consumer profile state (the 6 variables) ──────────────────
  const [consumerName, setConsumerName]                       = useState<string>('Usuario');
  const [propertyType, setPropertyType]                       = useState<'casa'|'apto'|'oficina'|'comercio'>('casa');
  const [deviceQuantity, setDeviceQuantity]                   = useState<number>(12);
  const [previousBillKwh, setPreviousBillKwh]                 = useState<number>(650);
  const [peakConsumptionLevel, setPeakConsumptionLevel]       = useState<'low'|'medium'|'high'>('medium');
  const [highConsumptionTime, setHighConsumptionTime]         = useState<'tarde'|'noche'|'dia'>('noche');

  // ── API REST Result State ─────────────────────────────────────
  const [apiResult, setApiResult] = useState<AnalisisOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // ── Currency State ────────────────────────────────────────────
  const [moneda, setMoneda] = useState<string>('USD');
  const [tasas, setTasas] = useState<Record<string, number>>({});

  useEffect(() => {
    getTasasMoneda().then(data => {
      if (data) setTasas(data.tasas);
    });
  }, []);

  // ── Dynamic local calculations ────────────────────────────────
  const summary = getDynamicSummary(appliances, tariff, propertyType, deviceQuantity, previousBillKwh, moneda);
  const hourlyData = getDynamicHourly(appliances, highConsumptionTime, peakConsumptionLevel, propertyType, deviceQuantity);
  const weeklyData = getDynamicWeekly(summary.totalKwh, tariff);
  const contextString = getDynamicContext(
    appliances, summary, tariff,
    consumerName, propertyType, deviceQuantity,
    previousBillKwh, peakConsumptionLevel, highConsumptionTime
  );

  // ── Trigger API REST / Fallback Analysis on changes ───────────
  useEffect(() => {
    let active = true;
    
    const triggerAnalysis = async () => {
      setIsAnalyzing(true);
      const input = {
        consumidor: consumerName,
        consumo_kwh: summary.monthlyProjectionKwh,
        uso_horario_pico: peakConsumptionLevel === 'high',
        cantidad_equipos: deviceQuantity,
        tipo_inmueble: propertyType === 'apto' ? 'Apartamento' : propertyType === 'oficina' ? 'Oficina' : propertyType === 'comercio' ? 'Comercio' : 'Casa',
        horas_alto_consumo: highConsumptionTime === 'tarde' ? 4 : highConsumptionTime === 'dia' ? 8 : 4,
        moneda_region: moneda
      };

      const result = await realizarAnalisisApi(input, appliances, tariff);
      if (active) {
        setApiResult(result);
        setIsAnalyzing(false);
      }
    };

    triggerAnalysis();

    return () => {
      active = false;
    };
  }, [
    consumerName, 
    propertyType, 
    deviceQuantity, 
    previousBillKwh, 
    peakConsumptionLevel, 
    highConsumptionTime, 
    appliances, 
    tariff
  ]);

  // ── Helpers ───────────────────────────────────────────────────
  const getApplianceIcon = (id: string) => {
    switch (id) {
      case 'hvac':        return <Wind      className="text-rose-400"   size={18} />;
      case 'lighting':    return <Lightbulb className="text-cyan-400"   size={18} />;
      case 'fridge':      return <Activity  className="text-emerald-400" size={18} />;
      case 'appliances':  return <PiggyBank className="text-amber-400"  size={18} />;
      default:            return <Tv        className="text-violet-400" size={18} />;
    }
  };

  const statusLabel = {
    efficient: { text: 'Eficiente',       style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    normal:    { text: 'Normal',           style: 'bg-amber-500/10  text-amber-400  border-amber-500/20'  },
    wasteful:  { text: 'Alto Desperdicio', style: 'bg-rose-500/10   text-rose-400   border-rose-500/20 animate-pulse' },
  };

  // Determine actual values (either from API REST model or Local summary)
  const activeProfile = apiResult ? apiResult.categoria : summary.profile;
  const activeCostoMensual = apiResult ? apiResult.estimacion_financiera.costo_estimado_mensual : summary.costoEstimadoMensual;
  const activeProbabilidad = apiResult ? apiResult.probabilidad : 0.81;

  const tasaActual = tasas[moneda] || 1;
  const costoConvertido = (activeCostoMensual * tasaActual).toFixed(2);

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="text-emerald-400 animate-pulse" size={18} />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Calculadora de Consumo Activo
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Optimiza Tu Consumo Eléctrico
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {consumerName !== 'Usuario' ? `Bienvenido/a, ${consumerName}. ` : ''}
            EnergiAI analiza las lecturas de tus electrodomésticos y te brinda planes de ahorro prácticos.
          </p>
        </div>

        {/* API connection state badge */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          {/* API REST State */}
          <div className="glass-panel px-3.5 py-2.5 rounded-2xl flex items-center gap-2 border border-white/5 shadow-lg">
            <Server size={14} className={apiResult?.isFallback ? 'text-amber-400' : 'text-emerald-400 animate-pulse'} />
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">API REST Estado</span>
              <span className="text-xs font-extrabold text-slate-350">
                {isAnalyzing ? 'Procesando...' : apiResult?.isFallback ? 'Simulación Local' : 'Modelo RF (FastAPI)'}
              </span>
            </div>
          </div>

          {/* Energy Score Badge */}
          <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-white/5 shadow-lg">
            <div className={`w-3.5 h-3.5 rounded-full ${
              activeProfile === 'Eficiente' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
              : activeProfile === 'Moderado' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
              : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
            }`} />
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Perfil Clasificado</span>
              <span className="text-xs font-extrabold text-slate-200">
                {activeProfile} ({(activeProbabilidad * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Body ───────────────────────────────────────────── */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex-1 flex flex-col gap-6">

        {/* 1. Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Consumo Diario</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20"><Zap size={16} /></div>
            </div>
            <span className="text-2xl font-extrabold text-slate-100">{summary.totalKwh} kWh</span>
            <p className="text-[10px] text-slate-400 mt-1">Meta ideal: <span className="font-semibold text-emerald-400">{summary.baselineKwh} kWh</span></p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-teal-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-teal-500/5 blur-2xl group-hover:bg-teal-500/10 transition-all duration-300" />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tarifa Estándar</span>
              <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20"><DollarSign size={16} /></div>
            </div>
            <span className="text-2xl font-extrabold text-slate-100">${tariff.toFixed(2)} USD</span>
            <p className="text-[10px] text-slate-400 mt-1">Ref. Estándar: <span className="font-semibold text-teal-400">$0.75/kWh</span></p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-rose-500/5 blur-2xl group-hover:bg-rose-500/10 transition-all duration-300" />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Fugas y Desperdicio</span>
              <div className={`p-2 rounded-xl border ${summary.totalWaste > 1.5 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <span className={`text-2xl font-extrabold ${summary.totalWaste > 1.5 ? 'text-rose-400' : 'text-slate-100'}`}>{summary.totalWaste} kWh</span>
            <p className="text-[10px] text-slate-400 mt-1">Pérdida: <span className="font-semibold text-rose-400">${summary.potentialSavings} USD/día</span></p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Proyección Mensual</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20"><TrendingDown size={16} /></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-emerald-400">
                ${costoConvertido}
              </span>
              <select 
                value={moneda} 
                onChange={(e) => setMoneda(e.target.value)}
                className="bg-slate-900 border border-emerald-500/30 rounded px-2 py-1 text-[10px] text-emerald-400 font-bold outline-none cursor-pointer"
              >
                <option value="USD">USD</option>
                {Object.keys(tasas).filter(k => k !== 'USD').map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Ref. mensual: <span className="font-semibold text-slate-300">{summary.monthlyProjectionKwh} kWh</span>
            </p>
          </div>

        </section>

        {/* 2. Three-Panel Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-stretch">

          {/* Panel 1: Consumer Form */}
          <div className="lg:col-span-2 flex flex-col">
            <EnergyForm
              appliances={appliances}
              tariff={tariff}
              onUpdateAppliances={setAppliances}
              onUpdateTariff={setTariff}
              consumerName={consumerName}
              onChangeConsumerName={setConsumerName}
              propertyType={propertyType}
              onChangePropertyType={setPropertyType}
              deviceQuantity={deviceQuantity}
              onChangeDeviceQuantity={setDeviceQuantity}
              previousBillKwh={previousBillKwh}
              onChangePreviousBillKwh={setPreviousBillKwh}
              peakConsumptionLevel={peakConsumptionLevel}
              onChangePeakConsumptionLevel={setPeakConsumptionLevel}
              highConsumptionTime={highConsumptionTime}
              onChangeHighConsumptionTime={setHighConsumptionTime}
            />
          </div>

          {/* Panel 2: Chart */}
          <div className="lg:col-span-3 flex flex-col">
            <UsageChart
              hourlyData={hourlyData}
              weeklyData={weeklyData}
            />
          </div>

          {/* Panel 3: Chat Agent */}
          <div className="lg:col-span-2 flex flex-col">
            <ChatAgent contextString={contextString} />
          </div>

        </section>

        {/* 3. JSON Output Panel — API REST Output */}
        <section>
          <JsonOutputPanel
            summary={{
              ...summary,
              profile: activeProfile
            }}
            appliances={appliances}
            tariff={tariff}
            consumerName={consumerName}
            propertyType={propertyType}
            deviceQuantity={deviceQuantity}
            previousBillKwh={previousBillKwh}
            peakConsumptionLevel={peakConsumptionLevel}
            highConsumptionTime={highConsumptionTime}
          />
        </section>

        {/* 4. CRUD Historial Panel */}
        <section>
          <HistorialPanel />
        </section>

        {/* 5. Appliance Audit */}
        <section className="glass-panel-glow rounded-2xl border border-white/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle size={18} className="text-emerald-400" />
                Auditoría Energética por Dispositivo
              </h2>
              <p className="text-xs text-slate-400">
                Diagnóstico basado en el perfil de <span className="text-emerald-400 font-bold">{consumerName}</span>
                {' '}· {propertyType === 'casa' ? 'Casa' : propertyType === 'apto' ? 'Apartamento' : propertyType === 'oficina' ? 'Oficina' : 'Comercio'}
                {' '}· {deviceQuantity} equipos
              </p>
            </div>
            <div className="hidden sm:block text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 font-medium">
              Total: <span className="font-extrabold text-emerald-400">{summary.totalKwh} kWh</span>
              {' '}·{' '}
              Proyección: <span className="font-extrabold text-teal-400">{summary.monthlyProjectionKwh} kWh/mes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {appliances.map((app) => {
              const status = statusLabel[app.status];
              return (
                <div key={app.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-[260px]">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-white/5 group-hover:scale-105 transition-transform">
                      {getApplianceIcon(app.id)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">{app.name}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Potencia: {app.powerRating}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Uso Mensual</span>
                      <span className="text-xs font-extrabold text-slate-200">{(app.kwh * 30).toFixed(1)} kWh ({app.percentage}%)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Costo Mensual</span>
                      <span className="text-xs font-extrabold text-slate-200">${(app.kwh * 30 * tariff * tasaActual).toFixed(2)} {moneda}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Estado</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider block text-center ${status.style}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 md:max-w-md lg:max-w-lg bg-slate-900/50 p-2.5 rounded-lg border border-white/5 text-[11px] text-slate-300">
                    <span className="font-extrabold text-emerald-400 block mb-0.5">Acción Recomendada:</span>
                    <span>{app.recommendation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="w-full py-6 mt-12 bg-slate-950/80 border-t border-white/5 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} EnergiAI Dashboard · Hackatón ONE</p>
          <div className="flex gap-4">
            <a href="https://vite.dev" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">Vite + React</a>
            <span className="text-slate-700">•</span>
            <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">Google Gemini API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
