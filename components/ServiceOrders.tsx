import React, { useState } from 'react';
import { ServiceOrder } from '../types';
import { MOCK_ORDERS, FLEET_DATA } from '../data/mockData';
import { useData } from '../context/DataContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

// Reusable Document Preview (Updated for Nested Data)
const DocumentPreview: React.FC<{ order: Partial<ServiceOrder> }> = ({ order }) => {
  return (
    <div id="document-preview-content" className="bg-white rounded shadow-2xl p-10 text-slate-900 flex-1 flex flex-col scale-95 origin-top h-full min-h-[600px]">
      <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
        <div>
          <h4 className="font-black text-2xl uppercase leading-none tracking-tighter">MAYA<br /><span className="text-primary">EXPRESS</span></h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Logistics Enterprise Solutions</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase">Carta Porte 3.1</p>
          <p className="font-mono text-xs font-black">{order.general?.guideNumber || 'SO-PENDING'}</p>
          <div className="mt-2 w-16 h-16 ml-auto bg-slate-100 flex items-center justify-center rounded">
            <span className="material-symbols-outlined text-4xl text-slate-300">qr_code_2</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 text-[11px] mb-8">
        <div className="space-y-1">
          <p className="font-black text-slate-400 uppercase text-[9px]">Shipper / Remitente</p>
          <p className="font-bold">{order.provider || 'Proveedor'}</p>
          <p className="text-slate-500">RFC: GEN010101ABC</p>
          <p className="text-slate-500">{order.general?.reception || 'Origen'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-black text-slate-400 uppercase text-[9px]">Consignee / Destinatario</p>
          <p className="font-bold">{order.client || 'Cliente'}</p>
          <p className="text-slate-500">RFC: CMM051212ABC</p>
          <p className="text-slate-500">{order.general?.delivery || 'Ubicación Entrega'}</p>
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
            <td className="py-2">{order.merchandise?.product || 'Mercancía'}</td>
            <td className="py-2 text-right font-bold">{order.physicalReception?.weight ? `${order.physicalReception.weight.toLocaleString()} kg` : '0 kg'}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[8px] font-black text-slate-400 uppercase">Digital Seal</p>
          <p className="text-[7px] font-mono text-slate-400 w-48 break-all">f293h4092h3f0923h4f0923h409f23h40f23h40f23h40f23h40f23h40f23h40f23h40f23h4</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase">Valid Signature</p>
          <div className="h-10 w-32 border-b border-slate-300 ml-auto mb-1"></div>
          <p className="text-[8px] font-bold">OPERACIONES LOGÍSTICAS</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: ServiceOrder['status'] }> = ({ status }) => {
  const styles = {
    transito: 'bg-blue-100 text-blue-700',
    bodega: 'bg-amber-100 text-amber-700',
    confirmada: 'bg-emerald-100 text-emerald-700',
    borrador: 'bg-slate-100 text-slate-600',
    cerrada: 'bg-slate-200 text-slate-500',
  };
  const labels = {
    transito: 'En tránsito',
    bodega: 'En bodega',
    confirmada: 'Confirmada',
    borrador: 'Borrador',
    cerrada: 'Cerrada',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// --- CREATE/EDIT FORM ---
const CreateServiceOrder: React.FC<{
  initialOrder?: ServiceOrder;
  existingOrders: ServiceOrder[];
  onSave: (order: ServiceOrder) => void;
  onCancel: () => void;
}> = ({ initialOrder, existingOrders, onSave, onCancel }) => {
  const { clients, providers } = useData();

  const generateNextGuideNumber = () => {
    const cmeOrders = existingOrders
      .map(o => o.general.guideNumber)
      .filter(g => g && g.startsWith('CME-'))
      .map(g => parseInt(g.replace('CME-', ''), 10))
      .filter(n => !isNaN(n));

    const maxNumber = cmeOrders.length > 0 ? Math.max(...cmeOrders) : -1;
    return `CME-${maxNumber + 1}`;
  };

  const [formData, setFormData] = useState<ServiceOrder>(initialOrder || {
    id: `SO-${Date.now()}`,
    client: '',
    provider: '',
    status: 'borrador',
    workflow: { includesPickup: true, includesShipping: true, includesDelivery: true },
    general: {
      guideNumber: generateNextGuideNumber(),
      sheetName: '',
      destination: '',
      deliveryMethod: 'Ocurre',
      unit: '',
      reception: '',
      delivery: '',
      secondDelivery: ''
    },
    physicalReception: { weight: 0, volume: 0, pieces: 0, unitMeasure: 'kg' },
    physicalDelivery: { weight: 0, volume: 0, pieces: 0, unitMeasure: 'kg' },
    physicalFinal: { weight: 0, volume: 0, pieces: 0, unitMeasure: 'kg' },
    merchandise: { product: '', type: '', isRefrigerated: false, receptionConservation: '' },
    logistics: { palletWeight: 0, palletCount: 0 },
    documentation: { receptionDate: new Date().toISOString().split('T')[0], insurance: '', clientInvoice: '', invoiceValue: 0, shippingMethod: '', paymentMethod: '', requiresInvoice: false }
  });

  const handleChange = (section: keyof ServiceOrder, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' ? { ...(prev[section] as any), [field]: value } : value
    }));
  };

  const handleTopLevelChange = (field: keyof ServiceOrder, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientName = e.target.value;
    handleTopLevelChange('client', clientName);

    // Autofill logic
    const selectedClient = clients.find(c => c.client === clientName);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        client: clientName,
        general: {
          ...prev.general,
          destination: selectedClient.destination,
          deliveryMethod: selectedClient.deliveryMethod,
          delivery: selectedClient.deliveryAddress
        },
        documentation: {
          ...prev.documentation,
          insurance: selectedClient.insurance
        }
      }));
    }
  };

  const handleProviderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerName = e.target.value;
    handleTopLevelChange('provider', providerName);

    // Autofill logic
    const selectedProvider = providers.find(p => p.provider === providerName);
    if (selectedProvider) {
      setFormData(prev => ({
        ...prev,
        provider: providerName,
        general: {
          ...prev.general,
          reception: selectedProvider.address
        },
        // Optional: Prefill product if only one exists
        merchandise: {
          ...prev.merchandise,
          product: selectedProvider.products.length === 1 ? selectedProvider.products[0].name : prev.merchandise.product
        }
      }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">
            {initialOrder ? 'Edit' : 'Create'} Service Order
          </h1>
          <p className="text-sm text-slate-500 font-medium">Capture complete service details</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">Cancel</button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30 active:scale-95 transition-all"
          >
            {initialOrder ? 'Update Order' : 'Submit Order'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-7 space-y-6">
          {/* Section 1: General */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">1. General Information</h3></div>
            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">No. Guía</label>
                <input
                  className="w-full border-slate-200 rounded-xl text-sm font-semibold bg-slate-50 cursor-not-allowed"
                  value={formData.general.guideNumber}
                  readOnly
                  placeholder="CME-0"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Unidad (Hub Operativo)</label>
                <select
                  className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                  value={formData.general.unit}
                  onChange={(e) => handleChange('general', 'unit', e.target.value)}
                >
                  <option value="">Seleccionar Unidad...</option>
                  {FLEET_DATA.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.id} - {unit.type}</option>
                  ))}
                </select>
              </div>

              {/* CLIENT SELECTION */}
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Cliente</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none"
                    value={formData.client}
                    onChange={handleClientSelect}
                  >
                    <option value="">Seleccionar Cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.client}>{c.client}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* PROVIDER SELECTION */}
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Proveedor</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none"
                    value={formData.provider || ''}
                    onChange={handleProviderSelect}
                  >
                    <option value="">Seleccionar Proveedor...</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.provider}>{p.provider}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Destino</label>
                <input
                  className="w-full border-slate-200 rounded-xl text-sm font-semibold bg-slate-50"
                  value={formData.general.destination}
                  onChange={(e) => handleChange('general', 'destination', e.target.value)}
                  placeholder="Automático del cliente..."
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Forma de entrega</label>
                <select
                  className="w-full border-slate-200 rounded-xl text-sm font-semibold bg-slate-50"
                  value={formData.general.deliveryMethod}
                  onChange={(e) => handleChange('general', 'deliveryMethod', e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  <option value="OCURRE">OCURRE</option>
                  <option value="DOMICILIO">DOMICILIO</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Recepción (Origen)</label>
                <input
                  className="w-full border-slate-200 rounded-xl text-sm font-semibold bg-slate-50"
                  value={formData.general.reception}
                  onChange={(e) => handleChange('general', 'reception', e.target.value)}
                  placeholder="Automático del proveedor..."
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Entrega (Dirección)</label>
                <input
                  className="w-full border-slate-200 rounded-xl text-sm font-semibold bg-slate-50"
                  value={formData.general.delivery}
                  onChange={(e) => handleChange('general', 'delivery', e.target.value)}
                  placeholder="Automático del cliente..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Physical Data */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">2. Physical Data</h3></div>
            <div className="p-8 space-y-6">
              {[
                { title: 'Recepción', section: 'physicalReception', color: 'text-primary' },
                { title: 'Entrega', section: 'physicalDelivery', color: 'text-emerald-600' },
                { title: 'Entrega Final', section: 'physicalFinal', color: 'text-brand-navy' }
              ].map((group) => (
                <div key={group.section} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className={`text-[10px] font-black uppercase mb-4 ${group.color}`}>{group.title}</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Peso</label>
                      <input
                        type="number"
                        className="w-full border-slate-200 rounded-lg text-xs"
                        value={(formData[group.section as keyof ServiceOrder] as any).weight}
                        onChange={(e) => handleChange(group.section as keyof ServiceOrder, 'weight', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Volumen</label>
                      <input
                        type="number"
                        className="w-full border-slate-200 rounded-lg text-xs"
                        value={(formData[group.section as keyof ServiceOrder] as any).volume}
                        onChange={(e) => handleChange(group.section as keyof ServiceOrder, 'volume', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Piezas</label>
                      <input
                        type="number"
                        className="w-full border-slate-200 rounded-lg text-xs"
                        value={(formData[group.section as keyof ServiceOrder] as any).pieces}
                        onChange={(e) => handleChange(group.section as keyof ServiceOrder, 'pieces', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">U.M.</label>
                      <input
                        className="w-full border-slate-200 rounded-lg text-xs"
                        value={(formData[group.section as keyof ServiceOrder] as any).unit}
                        onChange={(e) => handleChange(group.section as keyof ServiceOrder, 'unit', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Merchandise & Logistics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest border-b border-slate-100 pb-2">3. Merchandise</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Producto</label>
                  <input
                    className="w-full border-slate-200 rounded-lg text-xs"
                    value={formData.merchandise.product}
                    onChange={(e) => handleChange('merchandise', 'product', e.target.value)}
                    list="provider-products"
                  />
                  {/* Datalist for products if a provider is selected */}
                  {formData.provider && (
                    <datalist id="provider-products">
                      {providers.find(p => p.provider === formData.provider)?.products.map((prod, idx) => (
                        <option key={idx} value={prod.name}>{prod.temperature}</option>
                      ))}
                    </datalist>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Tipo</label>
                  <input
                    className="w-full border-slate-200 rounded-lg text-xs"
                    value={formData.merchandise.type}
                    onChange={(e) => handleChange('merchandise', 'type', e.target.value)}
                  />
                </div>
                <div className="flex gap-4 items-center pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary"
                      checked={formData.merchandise.isRefrigerated}
                      onChange={(e) => handleChange('merchandise', 'isRefrigerated', e.target.checked)}
                    />
                    Refrigerado
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest border-b border-slate-100 pb-2">4. Logistics</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Peso Tarima</label>
                  <input
                    className="w-full border-slate-200 rounded-lg text-xs"
                    type="number"
                    value={formData.logistics.palletWeight}
                    onChange={(e) => handleChange('logistics', 'palletWeight', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1"># Tarimas</label>
                  <input
                    className="w-full border-slate-200 rounded-lg text-xs"
                    type="number"
                    value={formData.logistics.palletCount}
                    onChange={(e) => handleChange('logistics', 'palletCount', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Seguro</label>
                  <select
                    className="w-full border-slate-200 rounded-lg text-xs"
                    value={formData.documentation.insurance}
                    onChange={(e) => handleChange('documentation', 'insurance', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DocumentPreview order={formData} />
        </div>
      </div>
    </div>
  );
}

// --- MODAL COMPONENT ---
const OrderDetailsModal: React.FC<{ order: ServiceOrder; onClose: () => void; onEdit: () => void }> = ({ order, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl overflow-hidden relative animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-black text-brand-navy tracking-tight">{order.general.guideNumber}</h2>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm font-bold text-slate-500">{order.client || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-white p-0">
          <div className="grid grid-cols-12 h-full">
            {/* Left Details */}
            <div className="col-span-12 lg:col-span-8 p-8 space-y-8">
              {/* General + Route */}
              <div className="grid grid-cols-3 gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="col-span-3 lg:col-span-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nombre de Hoja</p>
                  <p className="font-bold text-slate-700">{order.general.sheetName}</p>
                </div>
                <div className="col-span-3 lg:col-span-2 flex items-center gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Recepción</p>
                    <p className="font-bold text-brand-navy text-sm">{order.general.reception}</p>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-300 relative">
                    <div className="absolute -top-1 left-0 w-2 h-2 bg-primary rounded-full"></div>
                    <div className="absolute -top-1 right-0 w-2 h-2 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Entrega</p>
                    <p className="font-bold text-brand-navy text-sm">{order.general.delivery}</p>
                  </div>
                </div>
              </div>

              {/* Unit & Driver Info (New Section) */}
              {(order.assignedUnit || order.assignedDriver) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary material-symbols-outlined text-sm">local_shipping</span>
                    <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Fleet Assignment</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    {order.assignedUnit && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 pb-1">Unidad: <span className="text-brand-navy">{order.assignedUnit.id}</span></p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-slate-400 block text-[9px]">Placas</span><span className="font-bold text-slate-700">{order.assignedUnit.plates}</span></div>
                          <div><span className="text-slate-400 block text-[9px]">Tipo</span><span className="font-bold text-slate-700">{order.assignedUnit.type}</span></div>
                          <div><span className="text-slate-400 block text-[9px]">Marca</span><span className="font-bold text-slate-700">{order.assignedUnit.brand}</span></div>
                          <div><span className="text-slate-400 block text-[9px]">Color</span><span className="font-bold text-slate-700">{order.assignedUnit.color}</span></div>
                        </div>
                      </div>
                    )}
                    {order.assignedDriver && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 pb-1">Operador</p>
                        <div className="mb-2"><span className="font-black text-sm text-brand-navy block">{order.assignedDriver.name}</span></div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-slate-400 block text-[9px]">Teléfono</span><span className="font-bold text-slate-700">{order.assignedDriver.phone}</span></div>
                          <div><span className="text-slate-400 block text-[9px]">Licencia</span><span className="font-bold text-slate-700">{order.assignedDriver.license || 'N/A'}</span></div>
                          {order.assignedDriver.rfc && <div><span className="text-slate-400 block text-[9px]">RFC</span><span className="font-bold text-slate-700">{order.assignedDriver.rfc}</span></div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Physical Data Grid */}
              <div>
                <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-sm">inventory_2</span> Physical Data</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: 'Recepción', data: order.physicalReception, color: 'text-primary' },
                    { title: 'Entrega', data: order.physicalDelivery, color: 'text-emerald-600' },
                    { title: 'Final', data: order.physicalFinal, color: 'text-brand-navy' }
                  ].map((g, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <p className={`text-[10px] font-black uppercase mb-3 ${g.color}`}>{g.title}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Peso:</span> <span className="font-bold">{g.data.weight}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Volumen:</span> <span className="font-bold">{g.data.volume}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Piezas:</span> <span className="font-bold">{g.data.pieces}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Merchandise & Logistics */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest mb-4">Merchandise</h3>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-50">
                      <tr><td className="py-2 text-slate-400 font-bold w-1/3">Producto</td><td className="py-2 font-bold">{order.merchandise.product}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Tipo</td><td className="py-2">{order.merchandise.type}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Refrigerado</td><td className="py-2">{order.merchandise.isRefrigerated ? 'Sí' : 'No'}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest mb-4">Documentation</h3>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-50">
                      <tr><td className="py-2 text-slate-400 font-bold w-1/3">Fecha Rec.</td><td className="py-2">{order.documentation.receptionDate}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Factura</td><td className="py-2">{order.documentation.clientInvoice}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Valor</td><td className="py-2">${order.documentation.invoiceValue.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Preview */}
            <div className="col-span-12 lg:col-span-4 bg-slate-50 p-6 border-l border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Document Preview</h3>
                <button
                  onClick={() => {
                    const input = document.getElementById('document-preview-content');
                    if (input) {
                      html2canvas(input, { scale: 2 }).then((canvas) => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`CartaPorte_${order.general.guideNumber}.pdf`);
                      });
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 shadow-sm transition-all active:scale-95"
                >
                  Download PDF
                </button>
              </div>
              <DocumentPreview order={order} />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 z-10">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-colors">Cerrar</button>
          <button onClick={onEdit} className="px-6 py-2.5 bg-brand-navy text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 active:scale-95 transition-all">Editar</button>
        </div>
      </div>
    </div>
  );
};

const ServiceOrders: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>(MOCK_ORDERS);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const navigate = useNavigate();

  const handleSave = (orderData: ServiceOrder) => {
    if (view === 'edit') {
      setOrders(prev => prev.map(o => o.id === orderData.id ? orderData : o));
    } else {
      setOrders(prev => [orderData, ...prev]);
    }
    setView('list');
    setEditingOrder(null);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <CreateServiceOrder
        initialOrder={editingOrder || undefined}
        existingOrders={orders}
        onSave={handleSave}
        onCancel={() => {
          setView('list');
          setEditingOrder(null);
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">Service Orders</h1>
            <p className="text-sm text-slate-500 font-medium">Gestión de órdenes, cotizaciones, y documentación operativa</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('create')} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span> Nueva Orden
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
          {/* Filters (Simplified for brevity) */}
          <div className="p-6 border-b border-slate-100 space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap gap-3 items-center">
              <button className="bg-white border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 shadow-sm outline-none hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2">
                Cliente <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
              </button>
              <button className="bg-white border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 shadow-sm outline-none hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2">
                Estado <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
              </button>
              <button className="bg-white border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 shadow-sm outline-none hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2">
                Fecha <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
              </button>
              <button className="ml-auto bg-white py-2.5 px-5 rounded-xl text-xs font-bold text-slate-400 shadow-sm border border-slate-200">Limpiar</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">No. Guía</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Origen</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Destino</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Unidad</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-brand-navy">{order.general.guideNumber}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-600">{order.client}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-slate-600">{order.general.reception}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-primary">{order.general.destination}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-600">{order.merchandise.product}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-600">{order.general.unit}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-500">{order.documentation.receptionDate}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-slate-400 flex items-center gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="hover:text-primary transition-colors" title="Ver Detalles">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button onClick={() => navigate(`/tracking?guide=${order.general.guideNumber}`)} className="hover:text-primary transition-colors" title="Rastrear en Mapa">
                        <span className="material-symbols-outlined">location_on</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onEdit={() => {
            setEditingOrder(selectedOrder);
            setSelectedOrder(null);
            setView('edit');
          }}
        />
      )}
    </>
  );
};

export default ServiceOrders;
