
import React from 'react';

const RealTimeTracking: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Tracking Banner */}
      <div className="bg-brand-navy text-white rounded-3xl p-8 flex flex-wrap items-center justify-between gap-8 border-b-4 border-primary shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-widest">En Ruta (GPS Live)</span>
            <h2 className="text-2xl font-black font-mono tracking-tight">GUIA: MX-2024-882-CONG</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">Origen: CDMX (CEDIS Vallejo) → Destino: Mérida, Yucatán</p>
        </div>
        <div className="flex gap-10">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Carga</p>
            <p className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">ac_unit</span> -18.4°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Progreso</p>
            <p className="font-bold text-lg text-primary">82%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">ETA</p>
            <p className="font-bold text-lg">18:45 PM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Timeline */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-fit">
          <h3 className="text-sm font-black text-brand-navy uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">route</span> Event Log
          </h3>
          <div className="relative pl-8 border-l-2 border-slate-100 space-y-10">
            {[
              { title: 'Order Received', time: '08:20 AM', icon: 'check', status: 'completed' },
              { title: 'Cargo Loaded', time: '09:45 AM', icon: 'inventory_2', status: 'completed' },
              { title: 'In Transit (Villahermosa)', time: 'Active', icon: 'local_shipping', status: 'current' },
              { title: 'ETA (Mérida DC)', time: '06:45 PM', icon: 'schedule', status: 'pending' }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-emerald-500' : 
                  step.status === 'current' ? 'bg-primary animate-pulse' : 'bg-slate-200'
                }`}>
                  <span className="material-symbols-outlined text-white text-[12px] font-bold">{step.icon}</span>
                </div>
                <p className={`text-xs font-black uppercase ${step.status === 'current' ? 'text-primary' : 'text-brand-navy'}`}>{step.title}</p>
                <p className="text-[10px] text-slate-400 font-medium">{step.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="col-span-12 lg:col-span-8 bg-slate-100 rounded-3xl min-h-[500px] relative overflow-hidden flex items-center justify-center border border-slate-200 group">
          <img src="https://picsum.photos/seed/map/1200/800" className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 transition-all duration-700" alt="Map" />
          <div className="absolute z-10">
            <div className="bg-brand-navy text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-blue-400">MX-2024-882 | GPS Live</p>
                <p className="text-xl font-black">Campeche-Mérida Highway</p>
                <p className="text-xs text-slate-400 font-medium">Speed: 85 km/h | Fuel: 64%</p>
              </div>
            </div>
          </div>
          {/* Telemetry Overlay */}
          <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50 w-64">
             <h5 className="text-[10px] font-black uppercase mb-3 tracking-widest text-brand-navy">Critical Telemetry</h5>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between items-center text-xs mb-1.5">
                   <span className="text-slate-500 font-bold uppercase text-[9px]">Cold Chain Temp</span>
                   <span className="font-bold text-emerald-500">-18.4°C</span>
                 </div>
                 <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-emerald-500 h-full w-[92%]"></div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Load Factor</p>
                    <p className="text-xs font-bold text-brand-navy">94% Capacity</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Doors Status</p>
                    <p className="text-xs font-bold text-emerald-500 uppercase">Secured</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;
