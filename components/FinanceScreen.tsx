
import React from 'react';

const FinanceScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Accounts Receivable', value: '$2,410,500', trend: '+5.2%', color: 'blue', sub: '75% collected' },
          { label: 'Accounts Payable', value: '$1,120,800', trend: 'Control', color: 'blue', sub: 'Payroll & Fuel focus' },
          { label: 'Overdue Payments', value: '$84,210', trend: 'Alert', color: 'red', sub: '12 invoices > 30d' },
          { label: 'Available Cash', value: '$1,289,700', trend: 'Healthy', color: 'navy', sub: 'Projected OK' }
        ].map((item, i) => (
          <div key={i} className={`p-6 rounded-3xl border ${item.color === 'navy' ? 'bg-brand-navy text-white' : 'bg-white border-slate-200'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${item.color === 'navy' ? 'text-blue-300' : 'text-slate-500'}`}>{item.label}</p>
            <h3 className="text-2xl font-black">{item.value}</h3>
            <div className="mt-4 w-full bg-slate-100/20 h-1.5 rounded-full overflow-hidden">
               <div className={`h-full ${item.color === 'red' ? 'bg-red-500' : 'bg-primary'}`} style={{ width: '64%' }}></div>
            </div>
            <div className="flex justify-between items-center mt-3">
               <span className="text-[9px] font-bold opacity-60 uppercase">{item.sub}</span>
               <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${item.color === 'red' ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary'}`}>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
           <div>
              <h3 className="text-xl font-black text-brand-navy">Consolidated Invoicing Log</h3>
              <p className="text-xs text-slate-500 font-medium">Tracking AR status across all active corridors</p>
           </div>
           <div className="flex gap-3">
              <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600">Export CSV</button>
              <button className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20">New Transaction</button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Invoice / Date</th>
                <th className="px-8 py-5">Client Name</th>
                <th className="px-8 py-5">Ref / Shipment</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: 'INV-4412', date: 'Oct 22', client: 'Retail Supply MX', ref: 'SO-8821', amount: '$112,450.00', status: 'Pending', color: 'amber' },
                { id: 'INV-4410', date: 'Oct 20', client: 'Frío Logística S.A.', ref: 'SO-8790', amount: '$56,120.00', status: 'Paid', color: 'emerald' },
                { id: 'INV-4390', date: 'Sep 15', client: 'Comercializadora Maya', ref: 'SO-8101', amount: '$28,400.00', status: 'Overdue', color: 'red' },
                { id: 'INV-4385', date: 'Sep 12', client: 'Walmart CEDIS', ref: 'SO-8092', amount: '$189,400.00', status: 'Paid', color: 'emerald' }
              ].map((inv, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-mono text-xs font-black text-brand-navy">{inv.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{inv.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-brand-navy">{inv.client}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-mono text-slate-500">{inv.ref}</p>
                  </td>
                  <td className="px-8 py-6 text-right font-mono font-bold text-brand-navy">
                    {inv.amount}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                      inv.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 
                      inv.color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceScreen;
