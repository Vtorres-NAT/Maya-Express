
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Unit, Driver } from '../types';

const MasterData: React.FC = () => {
  const {
    units,
    drivers,
    addUnit,
    updateUnit,
    deleteUnit,
    addDriver,
    updateDriver,
    deleteDriver
  } = useData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'units' | 'drivers'>('units');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUnits = units.filter(u =>
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const data = activeTab === 'units' ? filteredUnits : filteredDrivers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">{t('module.master_data.title')}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('module.master_data.subtitle')}</p>
        </div>
      </div>
      <div className="flex gap-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('units')}
          className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'units' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-primary'}`}
        >
          Fleet Assets (Trucks)
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'drivers' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-primary'}`}
        >
          Operator Profiles
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'units' ? 'Assets' : 'Operators'}...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">{activeTab === 'units' ? 'Asset Identifier' : 'Operator Name'}</th>
              <th className="px-8 py-5">{activeTab === 'units' ? 'Category' : 'License'}</th>
              <th className="px-8 py-5">{activeTab === 'units' ? 'Plates' : 'Mobile'}</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((res: any, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-all group">
                <td className="px-8 py-5 font-mono text-xs font-black text-brand-navy">
                  {activeTab === 'units' ? res.id : res.name}
                </td>
                <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                  {activeTab === 'units' ? res.type : res.license}
                </td>
                <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                  {activeTab === 'units' ? res.plates : res.phone}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${res.status === 'Operational' || res.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>{res.status}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Seguro?')) {
                          activeTab === 'units' ? deleteUnit(res.id) : deleteDriver(res.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 italic text-sm">
                  No records found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterData;
