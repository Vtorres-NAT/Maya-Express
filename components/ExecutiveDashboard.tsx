
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateLogisticsInsights } from '../lib/gemini';

const data = [
  { name: 'Lun', revenue: 4000, trips: 24 },
  { name: 'Mar', revenue: 3000, trips: 18 },
  { name: 'Mie', revenue: 2000, trips: 22 },
  { name: 'Jue', revenue: 2780, trips: 30 },
  { name: 'Vie', revenue: 1890, trips: 28 },
  { name: 'Sab', revenue: 2390, trips: 15 },
  { name: 'Dom', revenue: 3490, trips: 12 },
];

const ExecutiveDashboard: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<{title: string, desc: string}[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      const stats = { daily: 142, revenue: 2.4, efficiency: 92.5 };
      const res = await generateLogisticsInsights(stats);
      setAiInsights(res.insights);
      setLoadingAi(false);
    };
    fetchInsights();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Envíos Diarios', value: '142', trend: '+8.4%', icon: 'local_shipping', color: 'blue' },
          { label: 'Rutas Activas', value: '28', trend: 'En Ruta', icon: 'route', color: 'emerald' },
          { label: 'Facturación Pendiente', value: '$2.4M', trend: '12 Facturas', icon: 'payments', color: 'amber' },
          { label: 'Estado de Flota', value: '92.5%', trend: '4 en Taller', icon: 'precision_manufacturing', color: 'slate' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">{kpi.icon}</span>
              </div>
              <span className={`text-xs font-black uppercase tracking-wider ${kpi.color === 'blue' ? 'text-blue-600' : kpi.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-3xl font-black text-brand-navy mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-brand-navy to-brand-dark rounded-3xl p-8 text-white border-b-4 border-primary shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-[120px]">psychology</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg animate-pulse">
              <span className="material-symbols-outlined">auto_awesome</span>
            </span>
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Maya AI: Perspectivas Estratégicas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingAi ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>)
            ) : (
              aiInsights.map((insight, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                  <p className="text-blue-400 font-black text-xs uppercase mb-2 tracking-tighter">{insight.title}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{insight.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-black text-brand-navy uppercase text-sm tracking-widest">Rendimiento de Ingresos</h4>
              <p className="text-xs text-slate-500 font-medium">Análisis de consolidación mensual</p>
            </div>
            <select className="text-xs font-bold border-slate-200 rounded-lg px-3 py-1.5 focus:ring-primary">
              <option>Últimos 7 Días</option>
              <option>Últimos 30 Días</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#2b6cee" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          <h4 className="font-black text-brand-navy flex items-center gap-3 uppercase text-sm tracking-widest">
            <span className="material-symbols-outlined text-primary">analytics</span> Eventos en Vivo
          </h4>
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {[
              { type: 'Crítico', time: '14:22 PM', title: 'Falla de Temperatura', unit: 'MX-4552', desc: 'Temp a -8°C (Umbral: -18°C).' },
              { type: 'Update', time: '14:05 PM', title: 'Arribo a HUB', unit: 'MX-2024', desc: 'Viaje VIA-882 llegó a Cancún.' },
              { type: 'Factura', time: '13:48 PM', title: 'Nueva Factura', unit: 'F-5518', desc: 'Factura por $42.5k procesada.' }
            ].map((event, i) => (
              <div key={i} className={`bg-white border-l-4 ${event.type === 'Crítico' ? 'border-red-500' : 'border-primary'} p-4 rounded-xl shadow-sm border border-slate-200`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${event.type === 'Crítico' ? 'text-red-500' : 'text-primary'}`}>{event.type}</span>
                  <span className="text-[9px] font-mono text-slate-400">{event.time}</span>
                </div>
                <p className="text-xs font-bold text-brand-navy">{event.title} - <span className="text-primary font-mono">{event.unit}</span></p>
                <p className="text-[11px] text-slate-500 mt-1">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
