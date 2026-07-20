import { useState } from 'react';
import type { ApplianceBreakdown } from '../mockData';
import { Settings, RefreshCw, Leaf, Home, AlertOctagon, User, Zap } from 'lucide-react';

interface EnergyFormProps {
  appliances: ApplianceBreakdown[];
  tariff: number;
  onUpdateAppliances: (data: ApplianceBreakdown[]) => void;
  onUpdateTariff: (rate: number) => void;
  
  // Consumer profile variables
  consumerName: string;
  onChangeConsumerName: (name: string) => void;
  propertyType: 'casa' | 'apto' | 'oficina' | 'comercio';
  onChangePropertyType: (type: 'casa' | 'apto' | 'oficina' | 'comercio') => void;
  deviceQuantity: number;
  onChangeDeviceQuantity: (qty: number) => void;
  previousBillKwh: number;
  onChangePreviousBillKwh: (kwh: number) => void;
  peakConsumptionLevel: 'low' | 'medium' | 'high';
  onChangePeakConsumptionLevel: (level: 'low' | 'medium' | 'high') => void;
  highConsumptionTime: 'tarde' | 'noche' | 'dia';
  onChangeHighConsumptionTime: (time: 'tarde' | 'noche' | 'dia') => void;
  
  // Currency parameters
  moneda: string;
  tasaActual: number;
}

export default function EnergyForm({
  appliances,
  tariff,
  onUpdateAppliances,
  onUpdateTariff,
  consumerName,
  onChangeConsumerName,
  propertyType,
  onChangePropertyType,
  deviceQuantity,
  onChangeDeviceQuantity,
  previousBillKwh,
  onChangePreviousBillKwh,
  peakConsumptionLevel,
  onChangePeakConsumptionLevel,
  highConsumptionTime,
  onChangeHighConsumptionTime,
  moneda,
  tasaActual,
}: EnergyFormProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'usage'>('profile');

  // Quick Presets helper
  const applyPreset = (presetType: 'eco' | 'average' | 'critical') => {
    let newKwhValues: Record<string, number> = {};
    let newTariff = 0.15;

    if (presetType === 'eco') {
      newKwhValues = { hvac: 5.5, appliances: 4.5, fridge: 2.8, lighting: 0.6, electronics: 0.05 };
      newTariff = 0.55;
      onChangePropertyType('apto');
      onChangeDeviceQuantity(8);
      onChangePreviousBillKwh(420);
      onChangePeakConsumptionLevel('low');
      onChangeHighConsumptionTime('tarde');
    } else if (presetType === 'average') {
      newKwhValues = { hvac: 9.3, appliances: 7.7, fridge: 3.6, lighting: 1.4, electronics: 0.2 };
      newTariff = 0.75;
      onChangePropertyType('casa');
      onChangeDeviceQuantity(12);
      onChangePreviousBillKwh(650);
      onChangePeakConsumptionLevel('medium');
      onChangeHighConsumptionTime('noche');
    } else {
      newKwhValues = { hvac: 16.5, appliances: 12.8, fridge: 5.2, lighting: 3.2, electronics: 1.5 };
      newTariff = 0.95;
      onChangePropertyType('casa');
      onChangeDeviceQuantity(25);
      onChangePreviousBillKwh(980);
      onChangePeakConsumptionLevel('high');
      onChangeHighConsumptionTime('noche');
    }

    const updated = appliances.map(app => {
      const kwh = newKwhValues[app.id] ?? app.kwh;
      
      // Classify status based on kwh vs baseline targets
      let status: 'efficient' | 'normal' | 'wasteful' = 'normal';
      if (app.id === 'hvac') {
        status = kwh > 12 ? 'wasteful' : kwh < 7 ? 'efficient' : 'normal';
      } else if (app.id === 'fridge') {
        status = kwh > 4.5 ? 'wasteful' : kwh < 3.2 ? 'efficient' : 'normal';
      } else if (app.id === 'lighting') {
        status = kwh > 2.0 ? 'wasteful' : kwh < 0.9 ? 'efficient' : 'normal';
      } else if (app.id === 'appliances') {
        status = kwh > 10.0 ? 'wasteful' : kwh < 6.0 ? 'efficient' : 'normal';
      } else if (app.id === 'electronics') {
        status = kwh > 0.8 ? 'wasteful' : kwh < 0.15 ? 'efficient' : 'normal';
      }

      return {
        ...app,
        kwh,
        status,
      };
    });

    // Recalculate percentages
    const total = updated.reduce((sum, a) => sum + a.kwh, 0);
    const finalized = updated.map(a => ({
      ...a,
      percentage: total > 0 ? Math.round((a.kwh / total) * 100) : 0,
    }));

    onUpdateAppliances(finalized);
    onUpdateTariff(newTariff);
  };

  const handleSliderChange = (id: string, value: number) => {
    const updated = appliances.map(app => {
      if (app.id === id) {
        let status: 'efficient' | 'normal' | 'wasteful' = 'normal';
        if (id === 'hvac') {
          status = value > 12 ? 'wasteful' : value < 7 ? 'efficient' : 'normal';
        } else if (id === 'fridge') {
          status = value > 4.5 ? 'wasteful' : value < 3.2 ? 'efficient' : 'normal';
        } else if (id === 'lighting') {
          status = value > 2.0 ? 'wasteful' : value < 0.9 ? 'efficient' : 'normal';
        } else if (id === 'appliances') {
          status = value > 10.0 ? 'wasteful' : value < 6.0 ? 'efficient' : 'normal';
        } else if (id === 'electronics') {
          status = value > 0.8 ? 'wasteful' : value < 0.15 ? 'efficient' : 'normal';
        }

        return {
          ...app,
          kwh: value,
          status,
        };
      }
      return app;
    });

    // Recalculate percentages
    const total = updated.reduce((sum, a) => sum + a.kwh, 0);
    const finalized = updated.map(a => ({
      ...a,
      percentage: total > 0 ? Math.round((a.kwh / total) * 100) : 0,
    }));

    onUpdateAppliances(finalized);
  };

  // Compute total dynamic sum
  const currentTotal = appliances.reduce((sum, a) => sum + a.kwh, 0);

  return (
    <div className="glass-panel-glow rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col h-full">
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Settings className="text-emerald-400 h-5 w-5" />
            Configurador de Consumo
          </h2>
          <p className="text-xs text-slate-400">Modifica las variables para simular tu factura real</p>
        </div>

        <button
          onClick={() => applyPreset('average')}
          title="Restablecer valores"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 mb-5 shrink-0">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'profile' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <User size={13} />
          <span>Perfil Consumidor</span>
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'usage' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Zap size={13} />
          <span>Consumo y Tarifas</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
        {activeTab === 'profile' ? (
          <div className="space-y-4">
            {/* Consumidor */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Consumidor (Nombre)</label>
              <input
                type="text"
                value={consumerName}
                onChange={(e) => onChangeConsumerName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-650 glass-input"
              />
            </div>

            {/* Tipo de Inmueble */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tipo de Inmueble (tipo_imovel)</label>
              <select
                value={propertyType}
                onChange={(e) => onChangePropertyType(e.target.value as any)}
                className="w-full rounded-xl px-3 py-2 text-xs text-slate-200 bg-slate-950/80 border border-white/5 focus:border-emerald-500/50 outline-none"
              >
                <option value="casa">Casa Residencial</option>
                <option value="apto">Apartamento</option>
                <option value="oficina">Oficina Comercial</option>
                <option value="comercio">Local Comercial</option>
              </select>
            </div>

            {/* Cantidad de Equipos */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                <span>Equipamientos (quantidade)</span>
                <span className="font-extrabold text-emerald-400">{deviceQuantity} equipos</span>
              </div>
              <input
                type="range"
                min="3"
                max="40"
                value={deviceQuantity}
                onChange={(e) => onChangeDeviceQuantity(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Consumo Anterior (consumo_kwh) */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Consumo Mes Anterior (consumo_kwh)</label>
              <div className="relative">
                <input
                  type="number"
                  value={previousBillKwh || ''}
                  onChange={(e) => onChangePreviousBillKwh(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Ej. 650"
                  className="w-full rounded-xl pl-3 pr-12 py-2 text-xs text-slate-200 placeholder:text-slate-650 glass-input"
                />
                <span className="absolute right-3.5 top-2.5 text-[9px] text-slate-500 font-extrabold">kWh</span>
              </div>
            </div>

            {/* Intensidad Horario Pico */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Uso Horario Pico (uso_horario_pico)</label>
              <select
                value={peakConsumptionLevel}
                onChange={(e) => onChangePeakConsumptionLevel(e.target.value as any)}
                className="w-full rounded-xl px-3 py-2 text-xs text-slate-200 bg-slate-950/80 border border-white/5 focus:border-emerald-500/50 outline-none"
              >
                <option value="low">Bajo / Aplanado</option>
                <option value="medium">Moderado (Promedio)</option>
                <option value="high">Alto (Picos Agudos)</option>
              </select>
            </div>

            {/* Horas de Alto Consumo */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Horas de Alto Consumo (horas_alto_consumo)</label>
              <select
                value={highConsumptionTime}
                onChange={(e) => onChangeHighConsumptionTime(e.target.value as any)}
                className="w-full rounded-xl px-3 py-2 text-xs text-slate-200 bg-slate-950/80 border border-white/5 focus:border-emerald-500/50 outline-none"
              >
                <option value="tarde">Tarde (12:00 - 16:00)</option>
                <option value="noche">Noche (18:00 - 22:00)</option>
                <option value="dia">Todo el día (Laboral)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4.5">
            {/* Tariff rate config */}
            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-200">Tarifa Eléctrica ({moneda} / kWh)</span>
                <span className="text-xs font-extrabold text-teal-400">${(tariff * tasaActual).toFixed(2)} {moneda}</span>
              </div>
              <input
                type="range"
                min={0.01 * tasaActual}
                max={1.50 * tasaActual}
                step={0.01 * tasaActual}
                value={tariff * tasaActual}
                onChange={(e) => onUpdateTariff(parseFloat(e.target.value) / tasaActual)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-semibold mt-1">
                <span>Económica</span>
                <span className="text-teal-400 font-bold">${(0.75 * tasaActual).toFixed(2)} ref. estándar global</span>
                <span>Elevada</span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Presets rápidos comparativos</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => applyPreset('eco')}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 transition-all text-center cursor-pointer"
                >
                  <Leaf size={14} />
                  <span className="text-[8px] font-bold uppercase tracking-wide">Ecológico</span>
                </button>

                <button
                  onClick={() => applyPreset('average')}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-700/30 bg-slate-900/50 hover:bg-slate-900 text-slate-300 transition-all text-center cursor-pointer"
                >
                  <Home size={14} />
                  <span className="text-[8px] font-bold uppercase tracking-wide">Promedio</span>
                </button>

                <button
                  onClick={() => applyPreset('critical')}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition-all text-center cursor-pointer"
                >
                  <AlertOctagon size={14} />
                  <span className="text-[8px] font-bold uppercase tracking-wide">Crítico</span>
                </button>
              </div>
            </div>

            {/* Appliance sliders */}
            <div className="space-y-3.5 pt-2">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Consumo por Categoría (kWh/día)</span>
              {appliances.map((app) => (
                <div key={app.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-350">{app.name.split(' (')[0]}</span>
                    <span className="font-extrabold text-slate-100">{app.kwh.toFixed(1)} kWh</span>
                  </div>
                  
                  <input
                    type="range"
                    min={app.id === 'electronics' ? "0" : "0.5"}
                    max={
                      app.id === 'hvac' 
                        ? "25" 
                        : app.id === 'appliances' 
                        ? "20" 
                        : app.id === 'fridge' 
                        ? "10" 
                        : app.id === 'lighting' 
                        ? "8" 
                        : "3"
                    }
                    step="0.1"
                    value={app.kwh}
                    onChange={(e) => handleSliderChange(app.id, parseFloat(e.target.value))}
                    style={{ '--slider-accent': app.color } as React.CSSProperties}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[var(--slider-accent)]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating total box */}
      <div className="mt-4 p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-emerald-400 shrink-0 animate-pulse" />
          <div>
            <span className="text-[9px] text-emerald-400/80 font-bold block uppercase tracking-wide">Proyección Diario Ajustado</span>
            <span className="text-[8px] text-slate-400 font-semibold">Cálculo de sliders</span>
          </div>
        </div>
        <span className="text-base font-extrabold text-emerald-400 glow-text-emerald">
          {currentTotal.toFixed(1)} kWh/día
        </span>
      </div>

    </div>
  );
}
