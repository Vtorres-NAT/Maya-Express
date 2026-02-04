
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const BillingCenter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">{t('module.billing.title')}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('module.billing.subtitle')}</p>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pending Invoice', value: '$142,500.00', count: '12 items', color: 'blue' },
          { label: 'Overdue (30d+)', value: '$34,210.00', count: '8 critical', color: 'red' },
          { label: 'Avg Time to Bill', value: '4.2 hrs', count: 'Meta: 6h', color: 'emerald' }
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-7 rounded-2xl border ${stat.color === 'red' ? 'border-red-100' : 'border-slate-200'} shadow-sm`}>
            <p className="text-[11px] text-slate-500 font-bold mb-3 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={`text-3xl font-black ${stat.color === 'red' ? 'text-red-600' : 'text-brand-navy'}`}>{stat.value}</h3>
              <span className="text-slate-400 text-[10px] font-bold uppercase">{stat.count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Validation List */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <h4 className="font-black text-brand-navy uppercase text-sm tracking-widest flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">pending_actions</span> Validation Queue
          </h4>
          {[
            { id: 'VIA-0892', client: 'Grupo Walmart', route: 'CDMX → Cancún', amount: '$22,400', status: 'Delivered', active: true },
            { id: 'VIA-0895', client: 'Chedraui', route: 'Mérida → CDMX', amount: '$14,800', status: 'Delivered', active: false },
            { id: 'VIA-0901', client: 'Sigma Alimentos', route: 'CDMX → Veracruz', amount: '$18,500', status: 'Pending POD', active: false }
          ].map((item, i) => (
            <div key={i} className={`p-5 rounded-2xl shadow-sm transition-all cursor-pointer ${item.active ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white border border-slate-200 hover:border-primary'
              }`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[11px] font-black font-mono ${item.active ? 'text-blue-200' : 'text-slate-400'}`}>{item.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.active ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'
                  }`}>{item.status}</span>
              </div>
              <p className="font-bold text-base leading-tight">{item.client}</p>
              <p className={`text-[11px] mt-1 ${item.active ? 'text-blue-100' : 'text-slate-500'}`}>{item.route}</p>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                <span className={`text-[10px] uppercase font-bold ${item.active ? 'text-blue-100' : 'text-slate-400'}`}>Est. Amount</span>
                <span className="text-xl font-black">{item.amount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Validation Panel */}
        <div className="col-span-12 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden border-t-4 border-t-primary h-fit">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-black text-brand-navy">Support & Invoicing Review</h3>
              <p className="text-xs text-slate-500 font-medium">Comparing POD evidence vs commercial quote</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-xl uppercase tracking-widest">Raise Discrepancy</button>
              <button className="px-8 py-2.5 bg-primary text-white text-[10px] font-black rounded-xl shadow-lg shadow-primary/30 uppercase tracking-widest hover:bg-blue-700 transition-all">Authorize CFDI</button>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-[11px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined">inventory</span> POD Evidence (Signed)
              </p>
              <div className="bg-emerald-50/30 rounded-2xl p-6 border border-emerald-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase text-slate-400 font-black">Delivery Date</span>
                  <span className="text-xs font-bold text-brand-navy">24 Oct 2024, 14:35</span>
                </div>
                <div className="aspect-video bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">picture_as_pdf</span>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">pod_scan_882.pdf</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-[11px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined">contract</span> Quote Summary
              </p>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs font-medium text-slate-500">Base Freight</span><span className="text-xs font-bold">$18,500.00</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-medium text-slate-500">Manuevers / Docks</span><span className="text-xs font-bold">$2,100.00</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-medium text-slate-500">VAT (16%)</span><span className="text-xs font-bold">$3,296.00</span></div>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-sm font-black uppercase text-primary">Total Amount</span>
                  <span className="text-2xl font-black text-brand-navy">$23,896.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingCenter;
