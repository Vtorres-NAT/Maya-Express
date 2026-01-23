
import React, { useState } from 'react';

const ServiceOrders: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">Create Service Order</h1>
          <p className="text-sm text-slate-500 font-medium">Generate Carta Porte and Logistics Documentation</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">Save Draft</button>
          <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30">Submit Final Order</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Form Area */}
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">1. Transactional Data</h3>
               <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-black uppercase">Auto-Validate On</span>
             </div>
             <div className="p-8 grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Customer / Client</label>
                  <select className="w-full border-slate-200 rounded-xl text-sm font-semibold focus:ring-primary focus:border-primary">
                    <option>Alimentos del Norte S.A.</option>
                    <option>Retail Logistics MX</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Service Line</label>
                  <select className="w-full border-slate-200 rounded-xl text-sm font-semibold focus:ring-primary focus:border-primary">
                    <option>Full Truck Load (FTL)</option>
                    <option>Less than Truckload (LTL)</option>
                    <option>Cold Chain specialized</option>
                  </select>
                </div>
                <div className="col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-3 gap-6">
                   <div>
                     <p className="text-[9px] font-black text-primary uppercase mb-1">Pick-up Location</p>
                     <p className="text-sm font-bold text-brand-navy">CDMX Central Hub</p>
                   </div>
                   <div>
                     <p className="text-[9px] font-black text-primary uppercase mb-1">Drop-off Destination</p>
                     <p className="text-sm font-bold text-brand-navy">Cancún DC</p>
                   </div>
                   <div>
                     <p className="text-[9px] font-black text-primary uppercase mb-1">Total Distance</p>
                     <p className="text-sm font-bold text-brand-navy">1,640 km</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">2. Cargo Details</h3>
             </div>
             <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Item Description</label>
                    <input type="text" placeholder="Frozen Dairy Products" className="w-full border-slate-200 rounded-xl text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Weight (kg)</label>
                    <input type="number" placeholder="12500" className="w-full border-slate-200 rounded-xl text-sm font-semibold" />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="col-span-12 xl:col-span-5">
          <div className="sticky top-28 bg-brand-navy rounded-3xl p-8 text-white shadow-2xl min-h-[700px] flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
               <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-3">
                 <span className="material-symbols-outlined text-blue-400">visibility</span> Document Preview
               </h3>
               <div className="flex gap-2">
                  <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"><span className="material-symbols-outlined text-sm">download</span></button>
                  <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"><span className="material-symbols-outlined text-sm">print</span></button>
               </div>
            </div>
            
            <div className="bg-white rounded shadow-2xl p-10 text-slate-900 flex-1 flex flex-col scale-95 origin-top">
               <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
                 <div>
                    <h4 className="font-black text-2xl uppercase leading-none tracking-tighter">MAYA<br/><span className="text-primary">EXPRESS</span></h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Logistics Enterprise Solutions</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Carta Porte 3.1</p>
                    <p className="font-mono text-xs font-black">SO-2024-00129-REF</p>
                    <div className="mt-2 w-16 h-16 ml-auto bg-slate-100 flex items-center justify-center rounded">
                      <span className="material-symbols-outlined text-4xl text-slate-300">qr_code_2</span>
                    </div>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-8 text-[11px] mb-8">
                 <div className="space-y-1">
                    <p className="font-black text-slate-400 uppercase text-[9px]">Shipper / Remitente</p>
                    <p className="font-bold">Alimentos del Norte S.A. de C.V.</p>
                    <p className="text-slate-500">RFC: ADN920101XYZ</p>
                    <p className="text-slate-500">Av. Vallejo 201, CDMX</p>
                 </div>
                 <div className="space-y-1">
                    <p className="font-black text-slate-400 uppercase text-[9px]">Consignee / Destinatario</p>
                    <p className="font-bold">CEDIS Mérida Maya</p>
                    <p className="text-slate-500">RFC: CMM051212ABC</p>
                    <p className="text-slate-500">Carretera Mer-Cam km 20</p>
                 </div>
               </div>

               <table className="w-full text-[10px] border-y-2 border-slate-200 py-4 mb-6">
                 <thead>
                    <tr className="text-slate-400 font-black uppercase text-[8px]">
                      <th className="text-left pb-2">Clave Producto</th>
                      <th className="text-left pb-2">Descripción</th>
                      <th className="text-right pb-2">Peso Bruto</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 font-mono">50131700</td>
                      <td className="py-2">Productos Lácteos Congelados</td>
                      <td className="py-2 text-right font-bold">12,500.00 kg</td>
                    </tr>
                 </tbody>
               </table>

               <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[8px] font-black text-slate-400 uppercase">Digital Seal</p>
                     <p className="text-[7px] font-mono text-slate-400 w-48 break-all">f293h4092h3f0923h4f0923h409f23h40f23h40f23h409f23h40f23h40f23h40f23h40f23h4</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase">Valid Signature</p>
                     <div className="h-10 w-32 border-b border-slate-300 ml-auto mb-1"></div>
                     <p className="text-[8px] font-bold">OPERACIONES LOGÍSTICAS</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrders;
