import React from 'react';
import { useData } from '../context/DataContext';
import { Unit, Driver } from '../types';

const OperationalHub: React.FC = () => {

  const { units, drivers, addUnit, updateUnit, addDriver, updateDriver } = useData();
  const [activeTab, setActiveTab] = React.useState<'units' | 'drivers'>('units');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Form states
  const [unitForm, setUnitForm] = React.useState<Partial<Unit>>({
    id: '', plates: '', brand: '', color: '', type: 'CAJA SECA', status: 'disponible', loc: 'BASE QUERÉTARO', colorCode: 'primary'
  });
  const [driverForm, setDriverForm] = React.useState<Partial<Driver>>({
    name: '', phone: '', license: '', rfc: '', status: 'disponible'
  });

  const handleOpenEdit = (item: Unit | Driver) => {
    setEditingId(item.id);
    if (activeTab === 'units') {
      const unit = item as Unit;
      setUnitForm({ ...unit });
    } else {
      const driver = item as Driver;
      setDriverForm({ ...driver });
    }
    setShowAddForm(true);
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUnit(editingId, unitForm as Unit);
      } else {
        await addUnit(unitForm as Unit);
      }
      setShowAddForm(false);
      setEditingId(null);
      setUnitForm({ id: '', plates: '', brand: '', color: '', type: 'CAJA SECA', status: 'disponible', loc: 'BASE QUERÉTARO', colorCode: 'primary' });
    } catch (err) {
      alert('Error saving unit');
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDriver(editingId, driverForm as Driver);
      } else {
        await addDriver(driverForm as Driver);
      }
      setShowAddForm(false);
      setEditingId(null);
      setDriverForm({ name: '', phone: '', license: '', rfc: '', status: 'disponible' });
    } catch (err) {
      alert('Error saving driver');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'asignado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'mantenimiento': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'fuera_servicio':
      case 'descanso': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'baja': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-emerald-500';
      case 'asignado': return 'bg-blue-500';
      case 'mantenimiento': return 'bg-amber-500';
      case 'fuera_servicio':
      case 'descanso': return 'bg-slate-500';
      case 'baja': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-8 text-slate-800">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">Hub Operativo</h1>
          <p className="text-sm text-slate-500 font-medium">Workforce & Fleet Management Center</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('units'); setShowAddForm(false); setEditingId(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'units' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Unidades
            </button>
            <button
              onClick={() => { setActiveTab('drivers'); setShowAddForm(false); setEditingId(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'drivers' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Operadores
            </button>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setUnitForm({ id: '', plates: '', brand: '', color: '', type: 'CAJA SECA', status: 'disponible', loc: 'BASE QUERÉTARO', colorCode: 'primary' });
              setDriverForm({ name: '', phone: '', license: '', rfc: '', status: 'disponible' });
            }}
            className="bg-brand-orange text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-orange-200 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">{showAddForm && !editingId ? 'close' : 'add'}</span>
            {showAddForm && !editingId ? 'Cancelar' : `Nuevo ${activeTab === 'units' ? 'Unidad' : 'Operador'}`}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-brand-navy rounded-2xl p-8 shadow-2xl border border-brand-navy/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-white uppercase tracking-widest">
              {editingId ? 'Editar' : 'Registrar'} {activeTab === 'units' ? 'Unidad' : 'Operador'}
            </h2>
            <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="text-slate-400 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={activeTab === 'units' ? handleAddUnit : handleAddDriver} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {activeTab === 'units' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">ID Eco</label>
                  <input
                    placeholder="e.g. MAYA-101"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/10 outline-none transition-all"
                    value={unitForm.id}
                    onChange={e => setUnitForm({ ...unitForm, id: e.target.value })}
                    required
                    disabled={!!editingId} // ID is PK for units
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Placas</label>
                  <input
                    placeholder="AA-00-00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/10 outline-none transition-all"
                    value={unitForm.plates}
                    onChange={e => setUnitForm({ ...unitForm, plates: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Tipo</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/10 outline-none transition-all appearance-none"
                    value={unitForm.type}
                    onChange={e => setUnitForm({ ...unitForm, type: e.target.value as any })}
                  >
                    <option value="CAJA SECA">Caja Seca</option>
                    <option value="REFRIGERADO">Refrigerado</option>
                    <option value="PLATAFORMA">Plataforma</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Estatus</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/10 outline-none transition-all appearance-none"
                    value={unitForm.status}
                    onChange={e => setUnitForm({ ...unitForm, status: e.target.value as any })}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="asignado">Asignado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="fuera_servicio">Fuera de Servicio</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nombre Completo</label>
                  <input
                    placeholder="Nombre del operador"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/10 outline-none transition-all"
                    value={driverForm.name}
                    onChange={e => setDriverForm({ ...driverForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Teléfono</label>
                  <input
                    placeholder="55-0000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/10 outline-none transition-all"
                    value={driverForm.phone}
                    onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Licencia</label>
                  <input
                    placeholder="No. Licencia"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/10 outline-none transition-all"
                    value={driverForm.license}
                    onChange={e => setDriverForm({ ...driverForm, license: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Estatus</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/10 outline-none transition-all appearance-none"
                    value={driverForm.status}
                    onChange={e => setDriverForm({ ...driverForm, status: e.target.value as any })}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="asignado">Asignado</option>
                    <option value="descanso">Descanso</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </>
            )}
            <div className="md:col-span-4 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="px-6 py-3 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-white text-brand-navy px-8 py-3 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-xl shadow-white/5"
              >
                {editingId ? 'Actualizar' : 'Guardar'} Registro
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {units.map((unit, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-0 overflow-hidden relative group hover:shadow-lg transition-all`}>
              {/* STATUS HEADER - UNITS */}
              <div className={`p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{unit.type}</span>
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase flex items-center gap-1.5 border ${getStatusColor(unit.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(unit.status)}`}></span>
                  {unit.status}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-brand-navy mb-1">{unit.id}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-0.5 border border-slate-200 rounded text-[9px] font-bold text-slate-500 bg-slate-50">{unit.plates}</span>
                      <span className="px-2 py-0.5 border border-slate-200 rounded text-[9px] font-bold text-slate-500 bg-slate-50">{unit.color}</span>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">{unit.brand}</p>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(unit)}
                    className="p-2 bg-slate-100 hover:bg-brand-navy hover:text-white rounded-lg transition-all text-slate-400"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
                <div className="flex items-center gap-1 text-slate-500 pt-4 border-t border-slate-100">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="text-xs font-bold">{unit.loc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {drivers.map((driver, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                    {driver.photourl ? (
                      <img src={driver.photourl} alt={driver.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-xl">person</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-brand-navy text-sm uppercase leading-tight">{driver.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getStatusColor(driver.status)}`}>
                      {driver.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEdit(driver)}
                  className="p-2 bg-slate-100 hover:bg-brand-navy hover:text-white rounded-lg transition-all text-slate-400 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Mobile</p>
                  <p className="text-xs font-bold text-slate-700 font-mono">{driver.phone}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">License</p>
                  <p className="text-xs font-bold text-slate-700 font-mono">{driver.license || 'N/A'}</p>
                </div>
                {driver.rfc && (
                  <div className="col-span-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">RFC</p>
                    <p className="text-xs font-bold text-slate-700 font-mono">{driver.rfc}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default OperationalHub;
