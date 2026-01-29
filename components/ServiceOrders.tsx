import React, { useState } from 'react';
import { ServiceOrder, ServiceOrderProduct } from '../types';
import { MOCK_ORDERS } from '../data/mockData';
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
          {order.general?.tripNumber && (
            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Viaje: {order.general.tripNumber}</p>
          )}
          <div className="mt-2 w-16 h-16 ml-auto bg-slate-100 flex items-center justify-center rounded">
            <span className="material-symbols-outlined text-4xl text-slate-300">qr_code_2</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 text-[11px] mb-8">
        <div className="space-y-1">
          <p className="font-black text-slate-400 uppercase text-[9px]">Shipper / Remitente</p>
          <p className="font-bold">{order.provider || 'Proveedor'}</p>
          <p className="text-slate-500">{order.general?.providerAddress}</p>
          <p className="text-slate-500">{order.general?.reception || 'Origen'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-black text-slate-400 uppercase text-[9px]">Consignee / Destinatario</p>
          <p className="font-bold">{order.client || 'Cliente'}</p>
          <p className="text-slate-500">{order.general?.clientAddress}</p>
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
          {(order.products || []).map((prod, idx) => (
            <tr key={idx}>
              <td className="py-2 font-mono">50131700</td>
              <td className="py-2">{prod.name} <span className="text-slate-400">({prod.temperature})</span></td>
              <td className="py-2 text-right font-bold">{prod.weight ? `${prod.weight.toLocaleString()} kg` : '0 kg'}</td>
            </tr>
          ))}
          {(order.products || []).length === 0 && (
            <tr>
              <td className="py-2 font-mono">-</td>
              <td className="py-2 text-slate-400 italic">No products selected</td>
              <td className="py-2 text-right font-bold">0 kg</td>
            </tr>
          )}
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
      tripNumber: '',
      destination: '',
      deliveryMethod: 'Ocurre',
      origin: '',
      pickup: '',
      receptionDate: new Date().toISOString().split('T')[0],
      conservationSystem: 'NO',
      shippingUnitRefrigeration: 'NO',
      reception: '',
      delivery: '',
      secondDelivery: '',
      clientAddress: '',
      clientContact: '',
      clientPhone: '',
      providerAddress: '',
      providerContact: '',
      providerPhone: '',
      observations: '',
      estDeparture: '',
      estArrival: '',
      receptionTemp: ''
    },
    products: [],
    logistics: { palletWeight: 0, palletCount: 0 },
    documentation: { insurance: '', clientInvoice: '', invoiceValue: 0, shippingMethod: '', paymentMethod: '', requiresInvoice: false }
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
          delivery: selectedClient.deliveryAddress,
          clientAddress: selectedClient.deliveryAddress,
          clientContact: selectedClient.contactName,
          clientPhone: selectedClient.phone,
          pickup: selectedClient.pickupRequired || 'NO'
        },
        documentation: {
          ...prev.documentation,
          insurance: selectedClient.insurance
        }
      }));
    } else {
      // Clear fields if no client selected
      setFormData(prev => ({
        ...prev,
        client: '',
        general: {
          ...prev.general,
          destination: '',
          deliveryMethod: 'Ocurre',
          delivery: '',
          clientAddress: '',
          clientContact: '',
          clientPhone: '',
          pickup: ''
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
      // Map provider products to ServiceOrderProduct format
      const newProducts: ServiceOrderProduct[] = selectedProvider.products.map(p => ({
        name: p.name,
        temperature: p.temperature,
        weight: 0,
        volume: 0,
        pieces: 0,
        unitMeasure: 'kg',
        others: ''
      }));

      setFormData(prev => ({
        ...prev,
        provider: providerName,
        products: newProducts, // Auto-load products
        general: {
          ...prev.general,
          reception: selectedProvider.address,
          origin: selectedProvider.address.split(',')[0],
          providerAddress: selectedProvider.address,
          providerContact: selectedProvider.contactName,
          providerPhone: selectedProvider.phone
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        provider: '',
        products: [],
        general: {
          ...prev.general,
          reception: '',
          origin: '',
          providerAddress: '',
          providerContact: '',
          providerPhone: ''
        }
      }));
    }
  };

  const handleProductChange = (index: number, field: keyof ServiceOrderProduct, value: any) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      return { ...prev, products: updatedProducts };
    });
  };

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { name: '', temperature: 'SECO', weight: 0, volume: 0, pieces: 0, unitMeasure: 'kg', others: '' }
      ]
    }));
  };

  const handleDeleteProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
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
            onClick={() => onSave({ ...formData, status: 'borrador' })}
            className="px-6 py-2.5 bg-amber-100 text-amber-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-200 transition-all active:scale-95"
          >
            Save as Draft
          </button>
          <button
            onClick={() => onSave({ ...formData, status: initialOrder ? formData.status : 'confirmada' })}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30 active:scale-95 transition-all"
          >
            {initialOrder ? 'Update Order' : 'Submit Order'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-7 space-y-6">

          {/* TOP HEADER: GUIDE NUMBER & TRIP NUMBER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-start gap-12">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">No. Guía</label>
              <div className="text-2xl font-black text-brand-navy tracking-tight">{formData.general.guideNumber}</div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">No. de Viaje</label>
              <input
                className="text-2xl font-black text-brand-navy tracking-tight border-none p-0 focus:ring-0 w-32 placeholder:text-slate-200"
                value={formData.general.tripNumber || ''}
                onChange={(e) => handleChange('general', 'tripNumber', e.target.value)}
                placeholder="---"
              />
            </div>
          </div>

          {/* Section 1: CLIENTE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">person</span>
              <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">1. Información del cliente</h3>
            </div>
            <div className="p-8 space-y-6">
              {/* SUB-SECTION 1: Contact Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seleccionar Cliente</label>
                  <div className="relative">
                    <select
                      className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none focus:ring-primary focus:border-primary"
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

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nombre Contacto</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
                    value={formData.general.clientContact || ''}
                    onChange={(e) => handleChange('general', 'clientContact', e.target.value)}
                    placeholder="Nombre Contacto"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Teléfono</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
                    value={formData.general.clientPhone || ''}
                    onChange={(e) => handleChange('general', 'clientPhone', e.target.value)}
                    placeholder="Teléfono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Dirección</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
                    value={formData.general.clientAddress || ''}
                    onChange={(e) => handleChange('general', 'clientAddress', e.target.value)}
                    placeholder="Dirección"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: PROVEEDOR */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">local_shipping</span>
              <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">2. Información del proveedor</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seleccionar Proveedor</label>
                  <div className="relative">
                    <select
                      className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none focus:ring-emerald-500 focus:border-emerald-500"
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

                {/* Autofilled Provider Details (Editable) */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nombre Contacto</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
                    value={formData.general.providerContact || ''}
                    onChange={(e) => handleChange('general', 'providerContact', e.target.value)}
                    placeholder="Nombre Contacto"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Teléfono</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
                    value={formData.general.providerPhone || ''}
                    onChange={(e) => handleChange('general', 'providerPhone', e.target.value)}
                    placeholder="Teléfono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Dirección</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
                    value={formData.general.providerAddress || ''}
                    onChange={(e) => handleChange('general', 'providerAddress', e.target.value)}
                    placeholder="Dirección"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: ORDEN DE TRASLADO */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-lg">route</span>
              <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">3. Información Orden de traslado</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">ORIGEN</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.origin}
                    onChange={(e) => handleChange('general', 'origin', e.target.value)}
                    placeholder="Ciudad origen..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Destino (Ciudad)</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.destination}
                    onChange={(e) => handleChange('general', 'destination', e.target.value)}
                    placeholder="Ciudad destino..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Recolección</label>
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.pickup || ''}
                    onChange={(e) => handleChange('general', 'pickup', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Forma de entrega</label>
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.deliveryMethod}
                    onChange={(e) => handleChange('general', 'deliveryMethod', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="OCURRE">OCURRE</option>
                    <option value="DOMICILIO">DOMICILIO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fecha recepción</label>
                  <input
                    type="date"
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.receptionDate}
                    onChange={(e) => handleChange('general', 'receptionDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">SISTEMA DE CONSERVACION RECEPCION:</label>
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.conservationSystem || ''}
                    onChange={(e) => handleChange('general', 'conservationSystem', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">UNIDAD DE ENVÍO CUENTA CON REFRIERACION:</label>
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.shippingUnitRefrigeration || ''}
                    onChange={(e) => handleChange('general', 'shippingUnitRefrigeration', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">DIRECCIÓN FINAL DE ENTREGA</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.delivery}
                    onChange={(e) => handleChange('general', 'delivery', e.target.value)}
                    placeholder="Dirección de entrega..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fecha aprox salida origen</label>
                  <input
                    type="date"
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.estDeparture || ''}
                    onChange={(e) => handleChange('general', 'estDeparture', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">fecha aprox llega destino</label>
                  <input
                    type="date"
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.estArrival || ''}
                    onChange={(e) => handleChange('general', 'estArrival', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Temperatura de Recepción</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.receptionTemp || ''}
                    onChange={(e) => handleChange('general', 'receptionTemp', e.target.value)}
                    placeholder="Eje: -18°C"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Observaciones</label>
                  <textarea
                    rows={3}
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.general.observations || ''}
                    onChange={(e) => handleChange('general', 'observations', e.target.value)}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: MERCANCIA */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-lg">inventory_2</span>
                <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">4. Mercancía</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{formData.products.length} Productos</span>
            </div>

            <div className="p-8 space-y-8">
              {/* PRODUCTS LIST */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase">Detalle Físico (Por Producto)</h4>
                  <button
                    onClick={handleAddProduct}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:text-blue-700"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span> Agregar
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.products.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <span className="material-symbols-outlined text-4xl mb-2">playlist_add</span>
                      <p className="text-sm font-medium">Agregue productos manual o seleccione proveedor.</p>
                    </div>
                  ) : (
                    formData.products.map((product, index) => (
                      <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-5 group hover:border-primary/30 transition-colors relative">
                        <button
                          onClick={() => handleDeleteProduct(index)}
                          className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                          title="Eliminar producto"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-slate-400">{index + 1}</span>
                          {/* Editable Name */}
                          <input
                            className="font-bold text-brand-navy text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none w-1/3 placeholder-slate-400"
                            value={product.name}
                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                            placeholder="Nombre del producto"
                          />

                          {/* Editable Temperature */}
                          <select
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase appearance-none border-none focus:ring-0 cursor-pointer ${product.temperature === 'CONGELADO' ? 'bg-cyan-100 text-cyan-700' :
                              product.temperature === 'REFRIGERADO' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-amber-100 text-amber-700'
                              }`}
                            value={product.temperature}
                            onChange={(e) => handleProductChange(index, 'temperature', e.target.value)}
                          >
                            <option value="SECO">SECO</option>
                            <option value="REFRIGERADO">REFRIGERADO</option>
                            <option value="CONGELADO">CONGELADO</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-5 gap-4 hidden md:grid"> {/* Labels header for better readability */}
                          <label className="text-[9px] font-bold text-slate-400">Peso</label>
                          <label className="text-[9px] font-bold text-slate-400">Volumen</label>
                          <label className="text-[9px] font-bold text-slate-400">Piezas</label>
                          <label className="text-[9px] font-bold text-slate-400">U.M.</label>
                          <label className="text-[9px] font-bold text-slate-400">Otros</label>
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                          <div>
                            <input
                              type="number"
                              className="w-full border-slate-200 rounded-lg text-xs focus:border-primary focus:ring-primary"
                              value={product.weight}
                              onChange={(e) => handleProductChange(index, 'weight', parseFloat(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              className="w-full border-slate-200 rounded-lg text-xs focus:border-primary focus:ring-primary"
                              value={product.volume}
                              onChange={(e) => handleProductChange(index, 'volume', parseFloat(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              className="w-full border-slate-200 rounded-lg text-xs focus:border-primary focus:ring-primary"
                              value={product.pieces}
                              onChange={(e) => handleProductChange(index, 'pieces', parseInt(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <input
                              className="w-full border-slate-200 rounded-lg text-xs focus:border-primary focus:ring-primary"
                              value={product.unitMeasure}
                              onChange={(e) => handleProductChange(index, 'unitMeasure', e.target.value)}
                              placeholder="U.M"
                            />
                          </div>
                          <div>
                            <input
                              className="w-full border-slate-200 rounded-lg text-xs focus:border-primary focus:ring-primary"
                              value={product.others || ''}
                              onChange={(e) => handleProductChange(index, 'others', e.target.value)}
                              placeholder="Notas..."
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100"></div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Logística</h4>
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: FACTURACION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-lg">payments</span>
              <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">5. Facturación</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seguro</label>
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.documentation.insurance}
                    onChange={(e) => handleChange('documentation', 'insurance', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Factura cliente</label>
                  <input
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.documentation.clientInvoice}
                    onChange={(e) => handleChange('documentation', 'clientInvoice', e.target.value)}
                    placeholder="No. Factura..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Valor Factura</label>
                  <input
                    type="number"
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.documentation.invoiceValue}
                    onChange={(e) => handleChange('documentation', 'invoiceValue', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Forma de pago</label>
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.documentation.paymentMethod}
                    onChange={(e) => handleChange('documentation', 'paymentMethod', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Forma de envío</label>
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.documentation.shippingMethod}
                    onChange={(e) => handleChange('documentation', 'shippingMethod', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="POR COBRAR">POR COBRAR</option>
                    <option value="PAGADO">PAGADO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Requiere Factura</label>
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold"
                    value={formData.documentation.requiresInvoice ? 'SI' : 'NO'}
                    onChange={(e) => handleChange('documentation', 'requiresInvoice', e.target.value === 'SI')}
                  >
                    <option value="NO">NO</option>
                    <option value="SI">SI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DocumentPreview order={formData} />
        </div>
      </div >
    </div >
  );
};

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
              {order.general.tripNumber && (
                <span className="text-xs font-black bg-brand-navy/10 text-brand-navy px-3 py-1 rounded-full uppercase tracking-widest">Viaje: {order.general.tripNumber}</span>
              )}
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
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Origen</p>
                    <p className="font-bold text-brand-navy text-sm">{order.general.origin}</p>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-300 relative">
                    <div className="absolute -top-1 left-0 w-2 h-2 bg-primary rounded-full"></div>
                    <div className="absolute -top-1 right-0 w-2 h-2 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Destino</p>
                    <p className="font-bold text-brand-navy text-sm">{order.general.destination}</p>
                  </div>
                </div>
              </div>

              {/* Products Grid (Replaces Physical Data Grid) */}
              <div>
                <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-sm">inventory_2</span> Merchandise</h3>
                <div className="grid grid-cols-2 gap-4">
                  {order.products.map((prod, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-[10px] font-black uppercase text-slate-600">{prod.name}</p>
                        <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded font-bold uppercase text-slate-500">{prod.temperature}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Peso:</span> <span className="font-bold">{prod.weight}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Volumen:</span> <span className="font-bold">{prod.volume}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Piezas:</span> <span className="font-bold">{prod.pieces}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">U.M.:</span> <span className="font-bold">{prod.unitMeasure}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transport Details (Section 3) */}
              <div className="mt-8">
                <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-sm text-blue-500">local_shipping</span> Transport Details</h3>
                <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-200/50">
                      <tr><td className="py-2 text-slate-400 font-bold w-1/2">Origen</td><td className="py-2 font-semibold text-brand-navy">{order.general.origin}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Destino</td><td className="py-2 font-semibold text-brand-navy">{order.general.destination}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Fecha Rec.</td><td className="py-2">{order.general.receptionDate}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Cons. Recepción</td><td className="py-2">{order.general.conservationSystem}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Temp. Recepción</td><td className="py-2">{order.general.receptionTemp}</td></tr>
                    </tbody>
                  </table>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-200/50">
                      <tr><td className="py-2 text-slate-400 font-bold w-1/2">Salida (Est)</td><td className="py-2">{order.general.estDeparture}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Llegada (Est)</td><td className="py-2">{order.general.estArrival}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Refr. Unidad</td><td className="py-2">{order.general.shippingUnitRefrigeration}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Entrega</td><td className="py-2">{order.general.deliveryMethod}</td></tr>
                    </tbody>
                  </table>
                </div>
                {order.general.observations && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-[11px]">
                    <span className="font-black text-amber-600 uppercase block mb-1">Observaciones</span>
                    {order.general.observations}
                  </div>
                )}
              </div>

              {/* Logistics & Facturación (Section 4 & 5) */}
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest mb-4">Facturación</h3>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-50">
                      <tr><td className="py-2 text-slate-400 font-bold w-1/3">Seguro</td><td className="py-2">{order.documentation.insurance}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Factura</td><td className="py-2">{order.documentation.clientInvoice}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Valor</td><td className="py-2">${order.documentation.invoiceValue?.toLocaleString()}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Requiere Factura</td><td className="py-2">{order.documentation.requiresInvoice ? 'SI' : 'NO'}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest mb-4">Logistics</h3>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-50">
                      <tr><td className="py-2 text-slate-400 font-bold w-1/3">Tarimas</td><td className="py-2">{order.logistics.palletCount}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Peso U.</td><td className="py-2">{order.logistics.palletWeight} kg</td></tr>
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
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-slate-600">{order.general.origin || order.general.reception}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-primary">{order.general.destination}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-600">{order.products[0]?.name || 'N/A'}</td>
                    <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-600">{order.general.unit || 'Pendiente'}</td>
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
