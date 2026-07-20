export interface HourlyUsage {
  hour: number; // 0 to 23
  label: string; // e.g. "08:00"
  kwh: number;
  baseline: number; // standard target for efficiency
  hvac: number;
  fridge: number;
  lighting: number;
  appliances: number;
  wasteEstimate: number; // potential waste in kWh
}

export interface ApplianceBreakdown {
  id: string;
  name: string;
  kwh: number;
  percentage: number;
  status: 'normal' | 'efficient' | 'wasteful';
  powerRating: string; // e.g. "1200W"
  recommendation: string;
  color: string;
}

export interface DailyUsage {
  dayName: string;
  kwh: number;
  cost: number;
  wasteDetected: boolean;
}

// 24 hours of simulated electrical usage (kWh) - Default Reference
export const mockHourlyUsage: HourlyUsage[] = [
  { hour: 0, label: '00:00', kwh: 0.45, baseline: 0.35, hvac: 0.25, fridge: 0.15, lighting: 0.02, appliances: 0.03, wasteEstimate: 0.05 },
  { hour: 1, label: '01:00', kwh: 0.42, baseline: 0.35, hvac: 0.24, fridge: 0.15, lighting: 0.01, appliances: 0.02, wasteEstimate: 0.02 },
  { hour: 2, label: '02:00', kwh: 0.40, baseline: 0.35, hvac: 0.22, fridge: 0.15, lighting: 0.01, appliances: 0.02, wasteEstimate: 0.0 },
  { hour: 3, label: '03:00', kwh: 0.38, baseline: 0.35, hvac: 0.20, fridge: 0.15, lighting: 0.01, appliances: 0.02, wasteEstimate: 0.0 },
  { hour: 4, label: '04:00', kwh: 0.39, baseline: 0.35, hvac: 0.21, fridge: 0.15, lighting: 0.01, appliances: 0.02, wasteEstimate: 0.0 },
  { hour: 5, label: '05:00', kwh: 0.41, baseline: 0.35, hvac: 0.23, fridge: 0.15, lighting: 0.01, appliances: 0.02, wasteEstimate: 0.0 },
  { hour: 6, label: '06:00', kwh: 0.65, baseline: 0.50, hvac: 0.30, fridge: 0.15, lighting: 0.08, appliances: 0.12, wasteEstimate: 0.05 },
  { hour: 7, label: '07:00', kwh: 0.95, baseline: 0.70, hvac: 0.35, fridge: 0.15, lighting: 0.15, appliances: 0.30, wasteEstimate: 0.10 },
  { hour: 8, label: '08:00', kwh: 1.10, baseline: 0.80, hvac: 0.40, fridge: 0.15, lighting: 0.10, appliances: 0.45, wasteEstimate: 0.15 },
  { hour: 9, label: '09:00', kwh: 0.85, baseline: 0.75, hvac: 0.30, fridge: 0.15, lighting: 0.05, appliances: 0.35, wasteEstimate: 0.05 },
  { hour: 10, label: '10:00', kwh: 0.75, baseline: 0.70, hvac: 0.30, fridge: 0.15, lighting: 0.03, appliances: 0.27, wasteEstimate: 0.0 },
  { hour: 11, label: '11:00', kwh: 0.72, baseline: 0.70, hvac: 0.30, fridge: 0.15, lighting: 0.02, appliances: 0.25, wasteEstimate: 0.0 },
  { hour: 12, label: '12:00', kwh: 0.88, baseline: 0.80, hvac: 0.35, fridge: 0.15, lighting: 0.03, appliances: 0.35, wasteEstimate: 0.05 },
  { hour: 13, label: '13:00', kwh: 1.35, baseline: 0.90, hvac: 0.65, fridge: 0.15, lighting: 0.05, appliances: 0.50, wasteEstimate: 0.25 },
  { hour: 14, label: '14:00', kwh: 1.48, baseline: 0.90, hvac: 0.75, fridge: 0.15, lighting: 0.05, appliances: 0.53, wasteEstimate: 0.30 },
  { hour: 15, label: '15:00', kwh: 1.25, baseline: 0.85, hvac: 0.60, fridge: 0.15, lighting: 0.04, appliances: 0.46, wasteEstimate: 0.15 },
  { hour: 16, label: '16:00', kwh: 0.95, baseline: 0.80, hvac: 0.45, fridge: 0.15, lighting: 0.05, appliances: 0.30, wasteEstimate: 0.05 },
  { hour: 17, label: '17:00', kwh: 1.15, baseline: 0.90, hvac: 0.50, fridge: 0.15, lighting: 0.10, appliances: 0.40, wasteEstimate: 0.10 },
  { hour: 18, label: '18:00', kwh: 1.85, baseline: 1.10, hvac: 0.60, fridge: 0.15, lighting: 0.25, appliances: 0.85, wasteEstimate: 0.45 },
  { hour: 19, label: '19:00', kwh: 2.10, baseline: 1.20, hvac: 0.65, fridge: 0.15, lighting: 0.30, appliances: 1.00, wasteEstimate: 0.50 },
  { hour: 20, label: '20:00', kwh: 1.95, baseline: 1.15, hvac: 0.60, fridge: 0.15, lighting: 0.30, appliances: 0.90, wasteEstimate: 0.40 },
  { hour: 21, label: '21:00', kwh: 1.40, baseline: 0.95, hvac: 0.45, fridge: 0.15, lighting: 0.25, appliances: 0.55, wasteEstimate: 0.20 },
  { hour: 22, label: '22:00', kwh: 0.85, baseline: 0.60, hvac: 0.35, fridge: 0.15, lighting: 0.10, appliances: 0.25, wasteEstimate: 0.10 },
  { hour: 23, label: '23:00', kwh: 0.55, baseline: 0.40, hvac: 0.28, fridge: 0.15, lighting: 0.04, appliances: 0.08, wasteEstimate: 0.05 },
];

// Default Appliance Breakdown References
export const mockApplianceBreakdown: ApplianceBreakdown[] = [
  {
    id: 'hvac',
    name: 'Climatización (Aire Acondicionado/Calefacción)',
    kwh: 9.3,
    percentage: 42,
    status: 'wasteful',
    powerRating: '2400W',
    recommendation: 'Sube el aire a 24°C y usa el modo ECO. Limpia filtros mensualmente para ahorrar un 15% en este equipo.',
    color: '#f43f5e',
  },
  {
    id: 'appliances',
    name: 'Electrodomésticos Grandes (Cocina, Lavadora, etc.)',
    kwh: 7.7,
    percentage: 35,
    status: 'normal',
    powerRating: '1500W-3000W',
    recommendation: 'Usa programas de lavado en frío y carga completa. Evita la secadora si es posible.',
    color: '#f59e0b',
  },
  {
    id: 'fridge',
    name: 'Nevera (Refrigerador - 24h activo)',
    kwh: 3.6,
    percentage: 16,
    status: 'efficient',
    powerRating: '200W',
    recommendation: 'Ajusta la temperatura a 4°C y congelador a -18°C. Mantén la parte trasera ventilada y libre de polvo.',
    color: '#10b981',
  },
  {
    id: 'lighting',
    name: 'Iluminación (Bombillas y lámparas)',
    kwh: 1.4,
    percentage: 6,
    status: 'wasteful',
    powerRating: '10W-60W',
    recommendation: 'Detectamos luces encendidas en habitaciones vacías entre 18:00 y 21:00. Cambia a focos LED y apaga al salir.',
    color: '#06b6d4',
  },
  {
    id: 'electronics',
    name: 'Otros y Consumo Vampiro (En espera)',
    kwh: 0.2,
    percentage: 1,
    status: 'wasteful',
    powerRating: '5W-30W',
    recommendation: 'Varios aparatos consumen electricidad apagados (cargadores, consolas, TV). Usa regletas con interruptor para apagarlos por completo.',
    color: '#8b5cf6',
  },
];

// Default Weekly History Reference
export const mockWeeklyUsage: DailyUsage[] = [
  { dayName: 'Lunes', kwh: 20.4, cost: 3.06, wasteDetected: false },
  { dayName: 'Martes', kwh: 22.8, cost: 3.42, wasteDetected: true },
  { dayName: 'Miércoles', kwh: 19.5, cost: 2.93, wasteDetected: false },
  { dayName: 'Jueves', kwh: 25.1, cost: 3.77, wasteDetected: true },
  { dayName: 'Viernes', kwh: 21.0, cost: 3.15, wasteDetected: false },
  { dayName: 'Sábado', kwh: 28.6, cost: 4.29, wasteDetected: true },
  { dayName: 'Domingo', kwh: 22.2, cost: 3.33, wasteDetected: false },
];

export const REGIONES_CONFIG: Record<string, { tarifa_usd: number; factor_clima: number }> = {
  "USD": { tarifa_usd: 0.75, factor_clima: 1.0 },
  "MXN": { tarifa_usd: 0.08, factor_clima: 1.15 },
  "COP": { tarifa_usd: 0.20, factor_clima: 1.05 },
  "ARS": { tarifa_usd: 0.04, factor_clima: 1.10 },
  "CLP": { tarifa_usd: 0.16, factor_clima: 0.90 },
  "PEN": { tarifa_usd: 0.18, factor_clima: 0.95 },
  "BRL": { tarifa_usd: 0.14, factor_clima: 1.20 },
};

export const getDynamicSummary = (
  appliances: ApplianceBreakdown[], 
  rate: number,
  propertyType: 'casa' | 'apto' | 'oficina' | 'comercio' = 'casa',
  deviceQuantity: number = 12,
  previousBillKwh: number = 650,
  monedaRegion: string = 'USD'
) => {
  const hvac = appliances.find(a => a.id === 'hvac')?.kwh || 0;
  const bigApp = appliances.find(a => a.id === 'appliances')?.kwh || 0;
  const fridge = appliances.find(a => a.id === 'fridge')?.kwh || 0;
  const lighting = appliances.find(a => a.id === 'lighting')?.kwh || 0;
  const vampire = appliances.find(a => a.id === 'electronics')?.kwh || 0;

  const totalKwh = hvac + bigApp + fridge + lighting + vampire;

  // Base efficiency target baselines dynamically affected by propertyType (tipo_imovel)
  let baselineHvac = 7.0;
  let baselineBigApp = 6.0;
  let baselineFridge = 3.0;
  let baselineLighting = 0.8;

  if (propertyType === 'apto') {
    // Apartments have lower heating/cooling loads and overall space
    baselineHvac = 5.0;
    baselineBigApp = 4.5;
    baselineLighting = 0.5;
  } else if (propertyType === 'oficina' || propertyType === 'comercio') {
    // Commercial spots run higher HVAC and lighting targets but low fridge targets
    baselineHvac = 12.0;
    baselineBigApp = 4.0;
    baselineFridge = 1.0;
    baselineLighting = 2.5;
  }

  // Standby vampire baseline shifts dynamically based on equipment quantity (quantidade_equipamentos)
  // Standard baseline is 0.1 kWh for ~10 devices.
  const baselineVampire = parseFloat(Math.max(0.05, deviceQuantity * 0.01).toFixed(2));
  
  let baselineKwh = baselineHvac + baselineBigApp + baselineFridge + baselineLighting + baselineVampire;

  // Apply climate factor based on region
  const factorClima = REGIONES_CONFIG[monedaRegion]?.factor_clima || 1.0;
  baselineKwh = baselineKwh * factorClima;

  // Waste calculations
  const wasteHvac = Math.max(0, hvac - (baselineHvac * factorClima));
  const wasteBigApp = Math.max(0, bigApp - (baselineBigApp * factorClima));
  const wasteFridge = Math.max(0, fridge - (baselineFridge * factorClima));
  const wasteLighting = Math.max(0, lighting - (baselineLighting * factorClima));
  const wasteVampire = Math.max(0, vampire - (baselineVampire * factorClima));
  const totalWaste = wasteHvac + wasteBigApp + wasteFridge + wasteLighting + wasteVampire;

  const currentCost = totalKwh * rate;
  const optimalCost = baselineKwh * rate;
  const potentialSavings = totalWaste * rate;

  // Compare projection against previous bill target (consumo_kwh)
  const monthlyProjectionKwh = totalKwh * 30;
  const savingsOverBillPercent = previousBillKwh > 0 
    ? parseFloat((((previousBillKwh - monthlyProjectionKwh) / previousBillKwh) * 100).toFixed(1))
    : 0;

  // Determine efficiency rating profile
  let profile: 'Eficiente' | 'Moderado' | 'Ineficiente' = 'Eficiente';
  const ratio = totalKwh / baselineKwh;
  if (ratio > 1.3) {
    profile = 'Ineficiente';
  } else if (ratio > 1.05) {
    profile = 'Moderado';
  }

  // costo_estimado_mensual usando tarifa de referencia según región
  const TARIFA_REFERENCIA = REGIONES_CONFIG[monedaRegion]?.tarifa_usd || 0.75;
  const costoEstimadoMensual = parseFloat((monthlyProjectionKwh * TARIFA_REFERENCIA).toFixed(2));

  return {
    totalKwh: parseFloat(totalKwh.toFixed(1)),
    baselineKwh: parseFloat(baselineKwh.toFixed(1)),
    totalWaste: parseFloat(totalWaste.toFixed(1)),
    currentCost: parseFloat(currentCost.toFixed(2)),
    optimalCost: parseFloat(optimalCost.toFixed(2)),
    potentialSavings: parseFloat(potentialSavings.toFixed(2)),
    monthlyProjectionKwh: parseFloat(monthlyProjectionKwh.toFixed(1)),
    costoEstimadoMensual,
    savingsOverBillPercent,
    profile,
  };
};

/**
 * Linearly scales the 24-hour baseline curve, taking into account peak hour intensity (uso_horario_pico)
 * and high consumption timeframe (horas_alto_consumo).
 */
export const getDynamicHourly = (
  appliances: ApplianceBreakdown[],
  highConsumptionTime: 'tarde' | 'noche' | 'dia' = 'noche',
  peakConsumptionLevel: 'low' | 'medium' | 'high' = 'medium',
  propertyType: 'casa' | 'apto' | 'oficina' | 'comercio' = 'casa',
  deviceQuantity: number = 12
): HourlyUsage[] => {
  const hvacNew = appliances.find(a => a.id === 'hvac')?.kwh || 0;
  const fridgeNew = appliances.find(a => a.id === 'fridge')?.kwh || 0;
  const lightingNew = appliances.find(a => a.id === 'lighting')?.kwh || 0;
  
  // Combine big appliances and vampire loads under the generic hourly "appliances" bucket
  const appNew = appliances.find(a => a.id === 'appliances')?.kwh || 0;
  const vampireNew = appliances.find(a => a.id === 'electronics')?.kwh || 0;
  const appliancesNewCombined = appNew + vampireNew;

  // Reference sums from static mock
  const refHvac = 9.3;
  const refFridge = 3.6;
  const refLighting = 1.4;
  const refAppliances = 7.9;

  const scaleHvac = refHvac > 0 ? hvacNew / refHvac : 0;
  const scaleFridge = refFridge > 0 ? fridgeNew / refFridge : 0;
  const scaleLighting = refLighting > 0 ? lightingNew / refLighting : 0;
  const scaleAppliances = refAppliances > 0 ? appliancesNewCombined / refAppliances : 0;

  // Calculate scaled baseline
  const summary = getDynamicSummary(appliances, 0.15, propertyType, deviceQuantity);
  const baselineScale = 16.9 > 0 ? summary.baselineKwh / 16.9 : 0;

  return mockHourlyUsage.map(h => {
    // 1. Peak Shifting multiplier based on hours of high consumption (horas_alto_consumo)
    let timeShiftFactor = 1.0;
    
    if (highConsumptionTime === 'tarde') {
      // Peak shifts to 12:00 - 16:00
      if (h.hour >= 12 && h.hour <= 16) {
        timeShiftFactor = 1.4;
      } else if (h.hour >= 19 || h.hour <= 5) {
        timeShiftFactor = 0.6; // low active levels at night
      }
    } else if (highConsumptionTime === 'dia') {
      // Typical office flat hours: 09:00 - 17:00
      if (h.hour >= 9 && h.hour <= 17) {
        timeShiftFactor = 1.35;
      } else {
        timeShiftFactor = 0.45; // low usage outside office hours
      }
    } else {
      // Night peak (18:00 - 22:00)
      if (h.hour >= 18 && h.hour <= 22) {
        timeShiftFactor = 1.4;
      } else if (h.hour >= 9 && h.hour <= 15) {
        timeShiftFactor = 0.65;
      }
    }

    // 2. Peak intensity multiplier based on peak hour usage level (uso_horario_pico)
    let peakLevelFactor = 1.0;
    if (h.hour === 13 || h.hour === 14 || h.hour === 19 || h.hour === 20) {
      if (peakConsumptionLevel === 'low') {
        peakLevelFactor = 0.75; // flatten the peaks
      } else if (peakConsumptionLevel === 'high') {
        peakLevelFactor = 1.35; // spike the peaks
      }
    }

    const scaledHvac = h.hvac * scaleHvac * timeShiftFactor * peakLevelFactor;
    const scaledFridge = h.fridge * scaleFridge; // fridge remains constant
    const scaledLighting = h.lighting * scaleLighting * (h.hour >= 18 ? timeShiftFactor : 1.0);
    const scaledAppl = h.appliances * scaleAppliances * timeShiftFactor;

    const totalKwh = scaledHvac + scaledFridge + scaledLighting + scaledAppl;
    const hourlyBaseline = h.baseline * baselineScale;
    
    // Scale waste estimate proportionally
    const scaledWaste = h.wasteEstimate * (scaleHvac * 0.5 + scaleLighting * 0.3 + scaleAppliances * 0.2) * peakLevelFactor;

    return {
      hour: h.hour,
      label: h.label,
      kwh: parseFloat(totalKwh.toFixed(3)),
      baseline: parseFloat(hourlyBaseline.toFixed(3)),
      hvac: parseFloat(scaledHvac.toFixed(3)),
      fridge: parseFloat(scaledFridge.toFixed(3)),
      lighting: parseFloat(scaledLighting.toFixed(3)),
      appliances: parseFloat(scaledAppl.toFixed(3)),
      wasteEstimate: parseFloat(scaledWaste.toFixed(3)),
    };
  });
};

/**
 * Linearly scales weekly history relative to the custom daily total.
 */
export const getDynamicWeekly = (
  totalKwhNew: number,
  rate: number
): DailyUsage[] => {
  const origDailyTotal = 22.2;
  const scaleFactor = origDailyTotal > 0 ? totalKwhNew / origDailyTotal : 0;

  return mockWeeklyUsage.map(w => {
    const kwh = w.kwh * scaleFactor;
    const cost = kwh * rate;
    const wasteDetected = kwh > w.kwh * 1.15 ? true : w.wasteDetected;

    return {
      dayName: w.dayName,
      kwh: parseFloat(kwh.toFixed(1)),
      cost: parseFloat(cost.toFixed(2)),
      wasteDetected,
    };
  });
};

/**
 * Builds a dynamic contextual prompt string reflecting user values for Gemini,
 * incorporating property type, previous bill baseline, peak intensity and quantity of devices.
 */
export const getDynamicContext = (
  appliances: ApplianceBreakdown[],
  summary: ReturnType<typeof getDynamicSummary>,
  rate: number,
  consumerName: string,
  propertyType: 'casa' | 'apto' | 'oficina' | 'comercio',
  deviceQuantity: number,
  previousBillKwh: number,
  peakConsumptionLevel: 'low' | 'medium' | 'high',
  highConsumptionTime: 'tarde' | 'noche' | 'dia'
): string => {
  const profileNames = {
    Eficiente: 'Eficiente (Bajo consumo en general)',
    Moderado: 'Consumo Moderado (Algunas fugas de energía)',
    Ineficiente: 'Consumo Crítico (Derroche severo registrado)',
  };

  const propertyNames = {
    casa: 'Casa Residencial',
    apto: 'Apartamento Residencial',
    oficina: 'Oficina Comercial',
    comercio: 'Local Comercial',
  };

  const peakLevels = {
    low: 'Bajo / Aplanado (Consumo equilibrado sin picos graves)',
    medium: 'Moderado (Picos normales en horarios de uso)',
    high: 'Alto / Agudo (Consumo disparado en horas pico)',
  };

  const peakTimes = {
    tarde: 'Tarde (12:00 - 16:00, alta demanda solar/climatización)',
    noche: 'Noche (18:00 - 22:00, retorno al hogar, iluminación y cocina)',
    dia: 'Horario Laboral / Día (09:00 - 17:00, actividad constante)',
  };

  return `
[PERFIL DEL CONSUMIDOR CONFIGURADO]
- Nombre del Consumidor (consumidor): ${consumerName}
- Tipo de Inmueble (tipo_imovel): ${propertyNames[propertyType]}
- Cantidad de Equipos Activos (quantidade_equipamentos): ${deviceQuantity} dispositivos
- Factura Anterior de Referencia (consumo_kwh): ${previousBillKwh} kWh/mes
- Intensidad en Horas Pico (uso_horario_pico): ${peakLevels[peakConsumptionLevel]}
- Horas de Alto Consumo (horas_alto_consumo): ${peakTimes[highConsumptionTime]}

[DATOS DE CONSUMO ELÉCTRICO CALCULADOS EN TIEMPO REAL]
- Consumo diario simulado: ${summary.totalKwh} kWh (Límite objetivo ideal: ${summary.baselineKwh} kWh)
- Proyección mensual calculada: ${summary.monthlyProjectionKwh} kWh/mes
- Comparativa vs Factura Anterior: ${summary.savingsOverBillPercent >= 0 
    ? `Ahorro del ${summary.savingsOverBillPercent}% respecto al mes anterior` 
    : `Aumento del ${Math.abs(summary.savingsOverBillPercent)}% respecto al mes anterior`}
- Costo diario simulado: $${summary.currentCost} USD (a un costo de $${rate} USD/kWh)
- Desperdicio estimado diario: ${summary.totalWaste} kWh (pérdida de $${summary.potentialSavings} USD al día)
- Clasificación de eficiencia: ${profileNames[summary.profile]}

[DESGLOSE DETALLADO DE EQUIPOS]
${appliances.map(app => `- ${app.name}: ${app.kwh} kWh (${app.percentage}%) | Estado: ${app.status.toUpperCase()} | Consejo específico: ${app.recommendation}`).join('\n')}

[DIRECTRICES DE AUDITORÍA]
1. Dirígete al consumidor por su nombre: "${consumerName}".
2. Analiza cómo su tipo de inmueble (${propertyNames[propertyType]}), la cantidad de dispositivos (${deviceQuantity}) y su franja horaria de alto consumo (${highConsumptionTime}) explican los picos de electricidad.
3. Si el consumo proyectado es mayor que su consumo de referencia anterior de ${previousBillKwh} kWh, indícale qué equipo o hábito causó el incremento y dale consejos inmediatos de bajo costo.
`;
};

// Kept for backward compatibility
export const getEnergySummary = () => {
  return getDynamicSummary(mockApplianceBreakdown, 0.15);
};

export const getActiveDiagnosticsContext = () => {
  const summary = getEnergySummary();
  return getDynamicContext(mockApplianceBreakdown, summary, 0.15, 'Usuario', 'casa', 12, 650, 'medium', 'noche');
};
