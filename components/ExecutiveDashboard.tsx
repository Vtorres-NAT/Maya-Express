
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateLogisticsInsights } from '../lib/gemini';
import { MOCK_ORDERS, FLEET_DATA } from '../data/mockData';

const ExecutiveDashboard: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<{ title: string, desc: string }[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);

  // Dynamic Metrics
  const activeShipments = MOCK_ORDERS.filter(o => o.status === 'transito' || o.status === 'confirmada').length;
  const unitsInOperation = FLEET_DATA.filter(u => u.status === 'In Transit' || u.status === 'Loading').length;
  const ordersInWarehouse = MOCK_ORDERS.filter(o => o.status === 'bodega').length;

  const chartData = [
    { name: 'Confirmada', value: MOCK_ORDERS.filter(o => o.status === 'confirmada').length, color: '#10b981' },
    { name: 'En Tránsito', value: MOCK_ORDERS.filter(o => o.status === 'transito').length, color: '#3b82f6' },
    { name: 'En Bodega', value: MOCK_ORDERS.filter(o => o.status === 'bodega').length, color: '#f59e0b' },
  ];

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
          { label: 'Envíos Activos', value: activeShipments, trend: 'Confirmados/Ruta', icon: 'local_shipping', color: 'blue' },
          { label: 'Unidades en Operación', value: unitsInOperation, trend: 'Tránsito/Carga', icon: 'route', color: 'emerald' },
          { label: 'Órdenes en Bodega', value: ordersInWarehouse, trend: 'Stock Hub', icon: 'warehouse', color: 'amber' },
          { label: 'Eficiencia Operativa', value: '94.2%', trend: 'Objetivo: 95%', icon: 'precision_manufacturing', color: 'slate' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">{kpi.icon}</span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${kpi.color === 'blue' ? 'text-blue-600' : kpi.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}`}>
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
              <h4 className="font-black text-brand-navy uppercase text-sm tracking-widest">Distribución de Órdenes</h4>
              <p className="text-xs text-slate-500 font-medium">Estado actual del flujo operativo</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBold: '900', fill: '#1e293b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          <h4 className="font-black text-brand-navy flex items-center gap-3 uppercase text-sm tracking-widest">
            <span className="material-symbols-outlined text-primary">analytics</span> Eventos Recientes
          </h4>
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-8 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {MOCK_ORDERS.slice(0, 4).map((order, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${order.status === 'transito' ? 'bg-blue-500' :
                  order.status === 'bodega' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Guía: {order.general.guideNumber}</span>
                    <span className="text-[9px] font-mono text-slate-300">Hoy</span>
                  </div>
                  <p className="text-xs font-bold text-brand-navy">Envío a {order.general.destination}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Estatus: <span className="capitalize font-black text-primary">{order.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
