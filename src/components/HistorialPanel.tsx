import React, { useEffect, useState } from 'react';
import { Trash2, Edit, RefreshCcw, Save, X, Plus } from 'lucide-react';
import { getHistorialApi, deleteAnalisisApi, updateAnalisisApi } from '../services/backendService';
import type { AnalisisOutput } from '../services/backendService';

export const HistorialPanel: React.FC = () => {
  const [historial, setHistorial] = useState<AnalisisOutput[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ consumidor: '', consumo_kwh: 0 });

  const fetchHistorial = async () => {
    setLoading(true);
    const data = await getHistorialApi();
    setHistorial(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const handleCreate = async () => {
    try {
      const input = {
        consumidor: 'Nuevo Usuario',
        consumo_kwh: 350,
        uso_horario_pico: false,
        cantidad_equipos: 8,
        tipo_inmueble: 'Casa',
        horas_alto_consumo: 6
      };
      const response = await fetch('http://localhost:8000/analisis-energetico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (response.ok) {
        fetchHistorial();
      }
    } catch (e) {
      console.error("Error creating analysis:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este análisis?")) {
      const success = await deleteAnalisisApi(id);
      if (success) {
        setHistorial(historial.filter(item => item.id_analisis !== id));
      } else {
        alert("Error al eliminar el análisis.");
      }
    }
  };

  const startEdit = (item: AnalisisOutput) => {
    setEditingId(item.id_analisis);
    setEditForm({
      consumidor: item.consumidor || '',
      consumo_kwh: item.perfil_detalle?.consumo_mensual_kwh || 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    const updated = await updateAnalisisApi(id, {
      consumidor: editForm.consumidor,
      consumo_kwh: editForm.consumo_kwh
    });
    if (updated) {
      setHistorial(historial.map(item => item.id_analisis === id ? updated : item));
      setEditingId(null);
    } else {
      alert("Error al actualizar el análisis.");
    }
  };

  return (
    <div className="glass-panel-glow rounded-2xl shadow-sm border border-white/5 overflow-hidden flex flex-col h-full mt-6 relative">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      
      <div className="bg-slate-950/40 p-4 border-b border-white/5 flex justify-between items-center z-10">
        <h2 className="font-bold text-slate-100 flex items-center gap-2">
          Historial de Análisis
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCreate} 
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-medium transition-colors border border-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Crear Nuevo
          </button>
          <button 
            onClick={fetchHistorial} 
            disabled={loading}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </div>
      </div>
      
      <div className="p-0 overflow-x-auto z-10">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-300 uppercase bg-slate-900/50 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Consumidor</th>
              <th className="px-6 py-4">Consumo (kWh)</th>
              <th className="px-6 py-4">Perfil</th>
              <th className="px-6 py-4">Costo USD</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {historial.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No hay análisis registrados. Realiza un análisis primero.
                </td>
              </tr>
            )}
            {historial.map((item) => (
              <tr key={item.id_analisis} className="bg-transparent border-b border-white/5 hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">
                  {editingId === item.id_analisis ? (
                    <input 
                      type="text" 
                      value={editForm.consumidor} 
                      onChange={e => setEditForm({...editForm, consumidor: e.target.value})}
                      className="bg-slate-900 border border-emerald-500/30 rounded px-2 py-1.5 w-full text-sm text-slate-200 outline-none focus:border-emerald-500/70"
                    />
                  ) : (
                    item.consumidor || 'Anónimo'
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id_analisis ? (
                    <input 
                      type="number" 
                      value={editForm.consumo_kwh} 
                      onChange={e => setEditForm({...editForm, consumo_kwh: Number(e.target.value)})}
                      className="bg-slate-900 border border-emerald-500/30 rounded px-2 py-1.5 w-24 text-sm text-slate-200 outline-none focus:border-emerald-500/70"
                    />
                  ) : (
                    <span className="font-bold text-slate-200">{item.estimacion_financiera?.consumo_mensual_kwh || 0}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                    item.categoria === 'Eficiente' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    item.categoria === 'Moderado' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {item.categoria}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-emerald-400">
                  ${item.estimacion_financiera?.costo_estimado_mensual?.toFixed(2)}
                </td>
                <td className="px-6 py-4 flex gap-3 justify-center items-center">
                  {editingId === item.id_analisis ? (
                    <>
                      <button onClick={() => saveEdit(item.id_analisis)} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors" title="Guardar">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEdit} className="p-1.5 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-md transition-colors" title="Cancelar">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(item)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id_analisis)} className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-md transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
