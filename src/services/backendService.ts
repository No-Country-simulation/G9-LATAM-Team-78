/**
 * Servicio de conexión con la API REST (FastAPI)
 * 
 * Este servicio conecta el frontend de React con el backend de la API REST
 * (que se ejecuta en OCI Compute o local en el puerto 8000).
 * Si el servidor backend no responde, realiza un fallback automático y
 * transparente a la simulación local del lado del cliente.
 */

import { getDynamicSummary } from '../mockData';
import type { ApplianceBreakdown } from '../mockData';

const BACKEND_URL = 'http://localhost:8000';

export interface AnalisisInput {
  consumidor: string;
  consumo_kwh: number;
  uso_horario_pico: boolean;
  cantidad_equipos: number;
  tipo_inmueble: string;
  horas_alto_consumo: number;
}

export interface AnalisisOutput {
  id_analisis: string;
  timestamp: string;
  consumidor: string;
  categoria: 'Eficiente' | 'Moderado' | 'Ineficiente';
  probabilidad: number;
  recomendaciones: string[];
  estimacion_financiera: {
    consumo_mensual_kwh: number;
    tarifa_referencia_usd_kwh: number;
    costo_estimado_mensual: number;
    costo_con_tarifa_usuario?: number;
    ahorro_potencial_mensual: number;
  };
  perfil_detalle: any;
  isFallback?: boolean; // Bandera para indicar que los datos se calcularon localmente
}

/**
 * Envía los datos de consumo a la API REST en el backend.
 * Si falla, calcula y devuelve un resultado estructurado localmente.
 */
export async function realizarAnalisisApi(
  input: AnalisisInput,
  appliances: ApplianceBreakdown[],
  tariff: number
): Promise<AnalisisOutput> {
  try {
    const response = await fetch(`${BACKEND_URL}/analisis-energetico`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumidor: input.consumidor || 'Usuario',
        consumo_kwh: input.consumo_kwh,
        uso_horario_pico: input.uso_horario_pico,
        cantidad_equipos: input.cantidad_equipos,
        tipo_inmueble: input.tipo_inmueble,
        horas_alto_consumo: input.horas_alto_consumo,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      isFallback: false,
    };
  } catch (error) {
    console.warn("⚠️ No se pudo conectar con el Backend API REST. Usando fallback del cliente local:", error);
    
    // Fallback: usar el cálculo dinámico local
    const propertyMap: Record<string, 'casa' | 'apto' | 'oficina' | 'comercio'> = {
      'Casa': 'casa',
      'Apartamento': 'apto',
      'Oficina': 'oficina',
      'Comercio': 'comercio',
    };
    
    const propType = propertyMap[input.tipo_inmueble] || 'casa';
    const localSummary = getDynamicSummary(
      appliances, 
      tariff, 
      propType, 
      input.cantidad_equipos, 
      input.consumo_kwh
    );
    
    // Simular recomendaciones
    const recomendaciones = appliances
      .filter(a => a.status === 'wasteful')
      .map(a => a.recommendation);
    recomendaciones.push("Distribuir las actividades de mayor consumo a lo largo del día");
    recomendaciones.push("Monitorear el consumo mensualmente y comparar con la factura anterior");

    // Simular probabilidad basada en el perfil
    let probabilidad = 0.85;
    if (localSummary.profile === 'Ineficiente') probabilidad = 0.81;
    else if (localSummary.profile === 'Moderado') probabilidad = 0.74;

    return {
      id_analisis: 'local-fb',
      timestamp: new Date().toISOString(),
      consumidor: input.consumidor,
      categoria: localSummary.profile,
      probabilidad,
      recomendaciones: recomendaciones.slice(0, 4),
      estimacion_financiera: {
        consumo_mensual_kwh: localSummary.monthlyProjectionKwh,
        tarifa_referencia_usd_kwh: 0.75,
        costo_estimado_mensual: localSummary.costoEstimadoMensual,
        costo_con_tarifa_usuario: parseFloat((localSummary.monthlyProjectionKwh * tariff).toFixed(2)),
        ahorro_potencial_mensual: parseFloat((localSummary.totalWaste * 30 * 0.75).toFixed(2)),
      },
      perfil_detalle: {
        ...localSummary,
      },
      isFallback: true,
    };
  }
}

export async function getHistorialApi(): Promise<AnalisisOutput[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/resultados`);
    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    return data.analisis || [];
  } catch (error) {
    console.error("Error fetching historial:", error);
    return [];
  }
}

export async function deleteAnalisisApi(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/resultados/${id}`, { method: 'DELETE' });
    return response.ok;
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return false;
  }
}

export async function updateAnalisisApi(id: string, input: Partial<AnalisisInput>): Promise<AnalisisOutput | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/resultados/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error updating analysis:", error);
    return null;
  }
}

export interface MonedaResponse {
  base: string;
  tasas: Record<string, number>;
  ultima_actualizacion: string;
}

export async function getTasasMoneda(): Promise<MonedaResponse | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/convertir-moneda`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return null;
  }
}
