
import React from 'react';

const MasterData: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex gap-8 border-b border-slate-200">
          <button className="pb-4 text-sm font-bold text-primary border-b-2 border-primary">Fleet Assets (Trucks)</button>
          <button className="pb-4 text-sm font-bold text-slate-400 hover:text-primary transition-colors">Operator Profiles</button>
          <button className="pb-4 text-sm font-bold text-slate-400 hover:text-primary transition-colors">Route Definitions</button>
          <button className="pb-4 text-sm font-bold text-slate-400 hover:text-primary transition-colors">Customer Portals</button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
           <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
              <input type="text" placeholder="Search Master Data..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary" />
           </div>
           <button className="px-6 py-2 bg-brand-navy text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
             <span className="material-symbols-outlined text-sm">add</span> Add New Asset
           </button>
        </div>
        <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                    <th className="px-8 py-5">Asset Identifier</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">Base Hub</th>
                    <th className="px-8 py-5">System Health</th>
                    <th className="px-8 py-5 text-right">Settings</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'WH-MER-01', cat: 'Distribution Center', loc: 'Mérida, YUC', status: 'Operational' },
                  { id: 'TRK-REF-202', cat: 'Refrigerated Unit', loc: 'Mobile (CDMX)', status: 'Operational' },
                  { id: 'TRK-DRY-105', cat: 'Dry Van', loc: 'Warehouse Hub 02', status: 'Maintenance' },
                  { id: 'OPS-D-4412', cat: 'Certified Operator', loc: 'Veracruz Base', status: 'Active' }
                ].map((res, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-5 font-mono text-xs font-black text-brand-navy">{res.id}</td>
                    <td className="px-8 py-5 text-xs text-slate-500 font-medium">{res.cat}</td>
                    <td className="px-8 py-5 text-xs text-slate-500 font-medium">{res.loc}</td>
                    <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                          res.status === 'Operational' || res.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>{res.status}</span>
                    </td>
                    <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-2">
                           <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                           <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                        </div>
                    </td>
                  </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterData;
