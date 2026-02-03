import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

const ExecutiveDashboard: React.FC = () => {
  const { orders, units } = useData();
  const { language, t } = useLanguage();

  // Dynamic Metrics - Using live data from DataContext
  const activeShipments = orders.filter(o => o.status === 'transito' || o.status === 'confirmada').length;
  const unitsInOperation = units.filter(u => u.status === 'asignado').length;
  const ordersInWarehouse = orders.filter(o => o.status === 'bodega').length;

  // Calculate operational efficiency (Orders closed vs Total orders that aren't drafts)
  const nonDraftOrders = orders.filter(o => o.status !== 'borrador');
  const efficiency = nonDraftOrders.length > 0
    ? ((orders.filter(o => o.status === 'cerrada').length / nonDraftOrders.length) * 100).toFixed(1)
    : '0';

  const chartData = [
    { name: language === 'en' ? 'Draft' : 'Borrador', value: orders.filter(o => o.status === 'borrador').length, color: '#94a3b8' },
    { name: language === 'en' ? 'Confirmed' : 'Confirmada', value: orders.filter(o => o.status === 'confirmada').length, color: '#10b981' },
    { name: language === 'en' ? 'In Transit' : 'En Tránsito', value: orders.filter(o => o.status === 'transito').length, color: '#3b82f6' },
    { name: language === 'en' ? 'In Warehouse' : 'En Bodega', value: orders.filter(o => o.status === 'bodega').length, color: '#f59e0b' },
    { name: language === 'en' ? 'Closed' : 'Cerradas', value: orders.filter(o => o.status === 'cerrada').length, color: '#64748b' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('dash.kpi.active_shipments'), value: activeShipments, trend: t('dash.kpi.active_shipments_desc'), icon: 'local_shipping', color: 'blue' },
          { label: t('dash.kpi.units_operation'), value: unitsInOperation, trend: t('dash.kpi.units_operation_desc'), icon: 'route', color: 'emerald' },
          { label: t('dash.kpi.warehouse_load'), value: ordersInWarehouse, trend: t('dash.kpi.warehouse_load_desc'), icon: 'warehouse', color: 'amber' },
          { label: t('dash.kpi.efficiency'), value: `${efficiency}%`, trend: t('dash.kpi.efficiency_desc'), icon: 'precision_manufacturing', color: 'slate' }
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

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-black text-brand-navy uppercase text-sm tracking-widest">{t('dash.chart.title')}</h4>
              <p className="text-xs text-slate-500 font-medium">{t('dash.chart.subtitle')}</p>
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
            <span className="material-symbols-outlined text-primary">analytics</span> {t('dash.recent.title')}
          </h4>
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-8 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t('dash.recent.empty')}</p>
            ) : (
              orders.slice(0, 6).map((order, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${order.status === 'transito' ? 'bg-blue-500' :
                    order.status === 'bodega' ? 'bg-amber-500' :
                      order.status === 'cerrada' ? 'bg-slate-500' : 'bg-emerald-500'
                    }`}></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-primary transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{t('dash.order.guide')}: {order.general.guideNumber}</span>
                      <span className="text-[9px] font-mono text-slate-300">ACTIVO</span>
                    </div>
                    <p className="text-xs font-bold text-brand-navy">{t('dash.order.destination')} {order.general.destination}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{t('dash.order.status')}: <span className="capitalize font-black text-primary">{order.status}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
