import React from 'react';
import { FleetUnit } from '../types';
import { FLEET_DATA } from '../data/mockData';

const OperationalHub: React.FC = () => {

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">Hub Operativo</h1>
          <p className="text-sm text-slate-500 font-medium">Workforce & Fleet Management Center</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined text-sm">filter_alt</span> Advanced Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FLEET_DATA.map((truck, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-0 overflow-hidden relative group hover:shadow-lg transition-all`}>
            {/* Status Header */}
            <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${truck.colorCode === 'emerald' ? 'bg-emerald-50' :
              truck.colorCode === 'blue' ? 'bg-blue-50' :
                truck.colorCode === 'amber' ? 'bg-amber-50' :
                  truck.colorCode === 'primary' ? 'bg-indigo-50' : 'bg-slate-50'
              }`}>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{truck.type}</span>
              <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase flex items-center gap-1.5 ${truck.colorCode === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                truck.colorCode === 'blue' ? 'bg-blue-100 text-blue-700' :
                  truck.colorCode === 'amber' ? 'bg-amber-100 text-amber-700' :
                    truck.colorCode === 'primary' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${truck.colorCode === 'emerald' ? 'bg-emerald-500' :
                  truck.colorCode === 'blue' ? 'bg-blue-500' :
                    truck.colorCode === 'amber' ? 'bg-amber-500' :
                      truck.colorCode === 'primary' ? 'bg-indigo-500' : 'bg-slate-500'
                  }`}></span>
                {truck.status}
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Unit Identifiers */}
              <div>
                <h3 className="text-lg font-black text-brand-navy mb-1">{truck.id}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 border border-slate-200 rounded text-[9px] font-bold text-slate-500 bg-slate-50">{truck.plates}</span>
                  <span className="px-2 py-0.5 border border-slate-200 rounded text-[9px] font-bold text-slate-500 bg-slate-50">{truck.color}</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-slate-400">{truck.brand}</p>
              </div>

              {/* Driver Info - Highlighted */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Operador / Driver</p>
                    <p className="text-xs font-bold text-brand-navy leading-none">{truck.driver.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">License</p>
                    <p className="text-[10px] font-bold text-slate-600 font-mono">{truck.driver.license || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Phone</p>
                    <p className="text-[10px] font-bold text-slate-600 font-mono">{truck.driver.phone}</p>
                  </div>
                  {truck.driver.rfc && (
                    <div className="col-span-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase">RFC</p>
                      <p className="text-[10px] font-bold text-slate-600 font-mono">{truck.driver.rfc}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-1 text-slate-500">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="text-xs font-bold">{truck.loc}</span>
              </div>
              <button className="text-[10px] font-black uppercase text-slate-400 hover:text-brand-navy flex items-center gap-1">
                View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperationalHub;
