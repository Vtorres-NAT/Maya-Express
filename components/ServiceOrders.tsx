import React, { useState, useEffect } from 'react';
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
    borrador: 'bg-slate-100 text-slate-600 border border-slate-200',
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const generateNextGuideNumber = () => {
    const cmeOrders = existingOrders
      .map(o => o.general.guideNumber)
      .filter(g => g && g.startsWith('CME-'))
      .map(g => parseInt(g.replace('CME-', ''), 10))
      .filter(n => !isNaN(n));

    const maxNumber = cmeOrders.length > 0 ? Math.max(...cmeOrders) : -1;
    return `CME-${maxNumber + 1}`;
  };

  const initialFormData: ServiceOrder = initialOrder || {
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
    documentation: { insurance: '', clientInvoice: '', invoiceValue: 0, shippingMethod: '', paymentMethod: '', requiresInvoice: false },
    evidence: { photos: [], observations: '' }
  };

  const [formData, setFormData] = useState<ServiceOrder>(() => {
    const saved = localStorage.getItem('so_draft_current');
    if (saved && !initialOrder) {
      return JSON.parse(saved);
    }
    return initialFormData;
  });

  // Photo helpers
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedData = canvas.toDataURL('image/jpeg', 0.7);

            setFormData(prev => ({
              ...prev,
              evidence: {
                ...prev.evidence,
                photos: [...(prev.evidence?.photos || []), compressedData]
              }
            }));
          };
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence: {
        ...prev.evidence,
        photos: (prev.evidence?.photos || []).filter((_, i) => i !== index)
      }
    }));
  };

  useEffect(() => {
    if (!initialOrder) {
      localStorage.setItem('so_draft_current', JSON.stringify(formData));
    }
  }, [formData, initialOrder]);

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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 px-1 no-scrollbar">
      {[
        { step: 1, label: 'General', icon: 'person' },
        { step: 2, label: 'Carga', icon: 'inventory_2' },
        { step: 3, label: 'Ruta', icon: 'route' },
        { step: 4, label: 'Evidencia', icon: 'add_a_photo' }
      ].map((s) => (
        <div key={s.step} className="flex items-center min-w-fit">
          <div
            onClick={() => setCurrentStep(s.step)}
            className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${currentStep === s.step ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-60'
              }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === s.step ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-200 text-slate-500'
              }`}>
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{s.label}</span>
          </div>
          {s.step < 4 && <div className="w-8 md:w-16 h-0.5 bg-slate-200 mx-2 md:mx-4 mt-[-20px]"></div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Banner (Mobile Friendly) */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 flex items-center justify-between shadow-sm lg:relative">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-sm font-black text-brand-navy uppercase tracking-tight leading-none">
              {initialOrder ? 'Editar' : 'Nueva'} Orden
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Guía: {formData.general.guideNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={`lg:hidden p-2 rounded-xl border transition-all ${isPreviewOpen ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'
              }`}
          >
            <span className="material-symbols-outlined text-xl">description</span>
          </button>
          <button
            onClick={() => onSave({ ...formData, status: 'borrador' })}
            className="hidden md:block px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 border border-amber-200"
          >
            Borrador
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">
        {/* Main Form Area */}
        <div className={`flex-1 p-4 md:p-8 lg:max-w-4xl transition-all duration-300 ${isPreviewOpen ? 'hidden lg:block' : 'block'}`}>
          {renderStepIndicator()}

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Step 1: Same Section 1 & 2 content but adapted */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">person</span>
                    <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Información del Cliente</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Seleccionar Cliente</label>
                    <select
                      className="w-full border-slate-200 rounded-2xl text-sm font-bold p-4 bg-slate-50 focus:ring-primary h-14"
                      value={formData.client}
                      onChange={handleClientSelect}
                    >
                      <option value="">Buscar cliente...</option>
                      {clients.map(c => <option key={c.id} value={c.client}>{c.client}</option>)}
                    </select>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Contacto</label>
                        <input className="w-full border-slate-200 rounded-xl text-sm p-3 bg-slate-50" value={formData.general.clientContact} onChange={e => handleChange('general', 'clientContact', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Teléfono</label>
                        <input className="w-full border-slate-200 rounded-xl text-sm p-3 bg-slate-50" value={formData.general.clientPhone} onChange={e => handleChange('general', 'clientPhone', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">local_shipping</span>
                    <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Información del Proveedor</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Seleccionar Proveedor</label>
                    <select
                      className="w-full border-slate-200 rounded-2xl text-sm font-bold p-4 bg-slate-50 focus:ring-emerald-500 h-14"
                      value={formData.provider}
                      onChange={handleProviderSelect}
                    >
                      <option value="">Buscar proveedor...</option>
                      {providers.map(p => <option key={p.id} value={p.provider}>{p.provider}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-lg">inventory_2</span>
                      <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Detalle de la Carga</h3>
                    </div>
                    <button onClick={handleAddProduct} className="text-primary p-2">
                      <span className="material-symbols-outlined">add_circle</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {formData.products.map((p, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                        <button onClick={() => handleDeleteProduct(i)} className="absolute top-2 right-2 text-red-400">
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                        <input
                          className="w-full bg-white border-slate-200 rounded-xl text-sm font-bold p-3"
                          placeholder="Nombre del producto"
                          value={p.name}
                          onChange={e => handleProductChange(i, 'name', e.target.value)}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Peso</label>
                            <input type="number" className="w-full border-slate-200 rounded-lg text-xs p-2" value={p.weight} onChange={e => handleProductChange(i, 'weight', parseFloat(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Piezas</label>
                            <input type="number" className="w-full border-slate-200 rounded-lg text-xs p-2" value={p.pieces} onChange={e => handleProductChange(i, 'pieces', parseInt(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">U.M.</label>
                            <input className="w-full border-slate-200 rounded-lg text-xs p-2" value={p.unitMeasure} onChange={e => handleProductChange(i, 'unitMeasure', e.target.value)} placeholder="kg" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Temp</label>
                            <select className="w-full border-slate-200 rounded-lg text-[10px] p-2" value={p.temperature} onChange={e => handleProductChange(i, 'temperature', e.target.value)}>
                              <option value="SECO">Seco</option>
                              <option value="REFRIGERADO">Refrigerado</option>
                              <option value="CONGELADO">Congelado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Total Tarimas</label>
                        <input type="number" className="w-full border-slate-200 rounded-xl text-sm p-3 font-bold" value={formData.logistics.palletCount} onChange={e => handleChange('logistics', 'palletCount', parseInt(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Peso Tarima</label>
                        <input type="number" className="w-full border-slate-200 rounded-xl text-sm p-3 font-bold" value={formData.logistics.palletWeight} onChange={e => handleChange('logistics', 'palletWeight', parseFloat(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500 text-lg">route</span>
                    <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Ruta y Logística</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">A</div>
                        <input className="flex-1 border-b border-slate-200 focus:border-primary p-2 text-sm font-bold outline-none" placeholder="Origen..." value={formData.general.origin} onChange={e => handleChange('general', 'origin', e.target.value)} />
                      </div>
                      <div className="w-0.5 h-6 bg-slate-200 ml-4"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">B</div>
                        <input className="flex-1 border-b border-slate-200 focus:border-primary p-2 text-sm font-bold outline-none" placeholder="Destino final..." value={formData.general.destination} onChange={e => handleChange('general', 'destination', e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Fecha Recepción</label>
                        <input type="date" className="w-full border-slate-200 rounded-xl p-3 text-sm font-bold bg-slate-50" value={formData.general.receptionDate} onChange={e => handleChange('general', 'receptionDate', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Modo Entrega</label>
                        <select className="w-full border-slate-200 rounded-xl p-3 text-sm font-bold bg-slate-50" value={formData.general.deliveryMethod} onChange={e => handleChange('general', 'deliveryMethod', e.target.value)}>
                          <option value="OCURRE">OCURRE</option>
                          <option value="DOMICILIO">DOMICILIO</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600 text-lg">add_a_photo</span>
                    <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Evidencia de Carga</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.evidence?.photos.map((photo, i) => (
                        <div key={i} className="aspect-square rounded-2xl border border-slate-200 overflow-hidden relative group">
                          <img src={photo} className="w-full h-full object-cover" />
                          <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Subir Foto</span>
                        <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handlePhotoCapture} />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Comentarios Operativos</label>
                      <textarea
                        className="w-full border-slate-200 rounded-2xl p-4 bg-slate-50 text-sm font-medium focus:ring-primary h-32"
                        placeholder="Describa el estado de la carga o cualquier novedad..."
                        value={formData.evidence?.observations}
                        onChange={e => handleChange('evidence', 'observations', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Persistent Form Navigation */}
          <div className="mt-12 flex items-center justify-between pb-24">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black uppercase text-xs disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined">chevron_left</span> Anterior
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-brand-navy text-white font-black uppercase text-xs active:scale-95 transition-all shadow-lg"
              >
                Siguiente <span className="material-symbols-outlined">chevron_right</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('so_draft_current');
                  onSave({ ...formData, status: 'confirmada' });
                }}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black uppercase text-xs active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Confirmar Orden <span className="material-symbols-outlined">send</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className={`flex-1 lg:max-w-md bg-slate-100 border-l border-slate-200 p-8 pt-0 overflow-y-auto ${isPreviewOpen ? 'fixed inset-0 z-50 pt-20 lg:relative lg:pt-0' : 'hidden lg:block'}`}>
          <div className="sticky top-0 pt-8 pb-4 bg-slate-100 z-10 flex justify-between items-center mb-4">
            <h3 className="font-black text-brand-navy uppercase text-[10px] tracking-widest">Vista Previa Real-Time</h3>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="lg:hidden p-2 bg-white border border-slate-200 rounded-full text-slate-400"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="scale-90 md:scale-100 origin-top">
            <DocumentPreview order={formData} />
          </div>
        </div>
      </div>
    </div>
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
  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('service_orders_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved orders:', e);
        return MOCK_ORDERS;
      }
    }
    return MOCK_ORDERS;
  });
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const navigate = useNavigate();

  // Persist orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('service_orders_list', JSON.stringify(orders));
  }, [orders]);

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
