import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie, LineChart, Line, Legend
} from 'recharts';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { ServiceOrder } from '../types';

// Helper to format date for X-Axis (e.g. 05-Feb)
const formatXAxisDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const d = String(date.getDate()).padStart(2, '0');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d}-${months[date.getMonth()]}`;
};

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
  ].filter(d => d.value > 0);

  // 1. Service Type Distribution (Real Data)
  const serviceTypes = orders.reduce((acc: any, order) => {
    const type = (order.general.deliveryMethod || 'N/A').trim().toUpperCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const serviceTypeColors: any = { 'FTL': '#3b82f6', 'LTL': '#10b981', 'RABON': '#f59e0b', 'OCURRE': '#6366f1', 'DOMICILIO': '#8b5cf6', 'N/A': '#94a3b8' };
  const serviceTypeData = Object.keys(serviceTypes).map(key => ({
    name: key,
    value: serviceTypes[key],
    color: serviceTypeColors[key] || '#94a3b8'
  }));

  // 2. Shipment Trends by Date (Real Data)
  const dateCounts = orders.reduce((acc: any, order) => {
    const date = order.general.receptionDate || 'N/A';
    if (date !== 'N/A') {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  const trendData = Object.keys(dateCounts)
    .sort()
    .map(date => ({
      day: formatXAxisDate(date),
      envios: dateCounts[date],
      fullDate: date
    }));

  // 3. Product Type Trends (Real Data)
  const productsByDate = orders.reduce((acc: any, order) => {
    const date = order.general.receptionDate || 'N/A';
    if (date === 'N/A') return acc;

    if (!acc[date]) acc[date] = {};

    order.products.forEach(p => {
      const pName = (p.name || '').trim().toUpperCase();
      acc[date][pName] = (acc[date][pName] || 0) + 1;
    });
    return acc;
  }, {});

  const allProductNames: string[] = Array.from(new Set(orders.flatMap(o => o.products.map(p => (p.name || '').trim().toUpperCase()))));
  const productTrendData = Object.keys(productsByDate)
    .sort()
    .map(date => {
      const entry: any = { day: formatXAxisDate(date) };
      allProductNames.forEach(pName => {
        entry[pName] = productsByDate[date][pName] || 0;
      });
      return entry;
    });

  const productColors = ['#f43f5e', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#10b981'];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">{t('module.dashboard.title')}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('module.dashboard.subtitle')}</p>
        </div>
      </div>

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
        {/* Row 1: Status Distribution (Left) & Recent Orders (Right) */}
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontBold: '900', fill: '#1e293b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
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
            <span className="material-symbols-outlined text-primary text-xl">history</span> {t('dash.recent.title')}
          </h4>
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t('dash.recent.empty')}</p>
            ) : (
              orders.slice().reverse().slice(0, 10).map((order, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[25px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${order.status === 'transito' ? 'bg-blue-500' :
                      order.status === 'bodega' ? 'bg-amber-500' :
                        order.status === 'cerrada' ? 'bg-slate-500' :
                          order.status === 'confirmada' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}></div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:border-primary transition-all cursor-default">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{order.general.guideNumber}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">{formatXAxisDate(order.general.receptionDate)}</span>
                    </div>
                    <p className="text-[10px] font-black text-brand-navy truncate">{order.client}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[9px] text-slate-500 font-medium">Destino: <span className="text-brand-navy font-bold">{order.general.destination}</span></span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${order.status === 'transito' ? 'bg-blue-50 text-blue-600' :
                          order.status === 'bodega' ? 'bg-amber-50 text-amber-600' :
                            order.status === 'confirmada' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                        }`}>{order.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Service Type (Left) & Product Trends (Right) */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h4 className="font-black text-brand-navy uppercase text-sm tracking-widest mb-8">Tipo de Servicio</h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
            {serviceTypeData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-[9px] font-bold text-slate-500">{entry.name}: <span className="text-brand-navy">{entry.value}</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h4 className="font-black text-brand-navy uppercase text-sm tracking-widest mb-8">Tendencias Históricas por Producto</h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1e293b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                {allProductNames.map((pName, idx) => (
                  <Line
                    key={pName}
                    type="monotone"
                    dataKey={pName}
                    stroke={productColors[idx % productColors.length]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
