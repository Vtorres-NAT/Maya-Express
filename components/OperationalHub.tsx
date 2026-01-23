
import React from 'react';

const OperationalHub: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">Fleet Resource Hub</h1>
          <p className="text-sm text-slate-500 font-medium">94% Fleet Efficiency | 128 Active Units</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined text-sm">filter_alt</span> Advanced Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { id: 'MX-TRK-772', status: 'In Transit', type: 'Kenworth T680', loc: 'Veracruz Highway', color: 'emerald', temp: '-18.5°C' },
          { id: 'MX-TRK-815', status: 'At Dock', type: 'Freightliner Cascadia', loc: 'Warehouse Hub 01', color: 'blue', temp: 'Ambient' },
          { id: 'MX-TRK-901', status: 'Maintenance', type: 'International ProStar', loc: 'Service Center CDMX', color: 'amber', alert: 'Oil Change Overdue' },
          { id: 'MX-TRK-442', status: 'Idle', type: 'Kenworth T680', loc: 'Puebla Yard', color: 'slate', temp: 'N/A' },
          { id: 'MX-TRK-551', status: 'Loading', type: 'Volvo VNL', loc: 'Valley DC CDMX', color: 'primary', temp: '-2.0°C' },
          { id: 'MX-TRK-221', status: 'In Transit', type: 'Mack Anthem', loc: 'Villahermosa Bypass', color: 'emerald', temp: '-19.1°C' }
        ].map((truck, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-t-4 transition-all hover:shadow-lg ${
            truck.color === 'emerald' ? 'border-t-emerald-500' : 
            truck.color === 'blue' ? 'border-t-blue-500' : 
            truck.color === 'amber' ? 'border-t-amber-500' : 'border-t-slate-400'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black font-mono tracking-wider">{truck.id}</span>
              <span className={`flex items-center gap-1.5 font-black text-[10px] uppercase ${
                truck.color === 'emerald' ? 'text-emerald-500' : 
                truck.color === 'blue' ? 'text-blue-500' : 'text-amber-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  truck.color === 'emerald' ? 'bg-emerald-500' : 
                  truck.color === 'blue' ? 'bg-blue-500' : 'bg-amber-500 animate-pulse'
                }`}></span> {truck.status}
              </span>
            </div>
            <h4 className="text-lg font-black text-brand-navy">{truck.type}</h4>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-sm">location_on</span> {truck.loc}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-100 mt-5">
              <div>
                <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Status Data</p>
                <p className={`text-xs font-bold ${truck.color === 'amber' ? 'text-red-500' : 'text-brand-navy'}`}>{truck.temp || truck.alert}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Driver</p>
                <p className="text-xs font-bold text-brand-navy">R. Sanchez</p>
              </div>
            </div>
            <div className="mt-6">
               <button className="w-full py-2.5 bg-slate-50 border border-slate-100 text-brand-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all">Details & Telemetry</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperationalHub;
