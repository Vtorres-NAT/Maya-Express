import React, { useState } from 'react';
import { ServiceOrder, ServiceOrderProduct } from '../types';
import { MOCK_ORDERS } from '../data/mockData';
import { useData } from '../context/DataContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

// Reusable Document Preview (Updated for Nested Data)
const DocumentPreview: React.FC<{ order: Partial<ServiceOrder>; id?: string }> = ({ order, id = "document-preview-content" }) => {
  return (
    <div
      id={id}
      className="bg-white p-12 text-slate-900 shadow-2xl w-full mx-auto flex flex-col min-h-[297mm] h-auto overflow-visible print:shadow-none print:p-0"
      style={{ maxWidth: '210mm' }}
    >
      <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-8">
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
          {order.general?.reception && order.general.reception !== order.general.providerAddress && (
            <p className="text-slate-500">{order.general.reception}</p>
          )}
        </div>
        <div className="space-y-1">
          <p className="font-black text-slate-400 uppercase text-[9px]">Consignee / Destinatario</p>
          <p className="font-bold">{order.client || 'Cliente'}</p>
          <p className="text-slate-500">{order.general?.clientAddress}</p>
          {order.general?.delivery && order.general.delivery !== order.general.clientAddress && (
            <p className="text-slate-500">{order.general.delivery}</p>
          )}
        </div>
      </div>

      {/* Detailed Products Table matching Reference Image */}
      <div className="mb-6 rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-[9px]">
          <thead className="bg-brand-navy text-white uppercase font-black text-[8px]">
            <tr>
              <th className="py-2 px-2 text-left w-[25%]">Producto / Descripción</th>
              <th className="py-2 px-1 text-center text-blue-200 w-[10%]">Temp.</th>
              <th className="py-2 px-1 text-center w-[10%]">Volumen</th>
              <th className="py-2 px-1 text-center w-[10%]">Piezas</th>
              <th className="py-2 px-1 text-center w-[10%]">U. Medida</th>
              <th className="py-2 px-1 text-center w-[10%]">Peso</th>
              <th className="py-2 px-2 text-left w-[25%]">Notas / Otros</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(order.products || []).map((prod, idx) => (
              <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="py-2 px-2 font-bold text-slate-700">{prod.name}</td>
                <td className="py-2 px-1 text-center">
                  <span className={`px-1 py-0.5 rounded text-[7px] font-black uppercase ${getTemperatureStyle(prod.temperature)}`}>
                    {prod.temperature}
                  </span>
                </td>
                <td className="py-2 px-1 text-center font-mono">{prod.volume || '-'}</td>
                <td className="py-2 px-1 text-center font-mono font-bold">{prod.pieces || '-'}</td>
                <td className="py-2 px-1 text-center lowercase text-slate-500">{prod.unitMeasure}</td>
                <td className="py-2 px-1 text-center font-bold">{prod.weight ? `${prod.weight.toLocaleString()} kg` : '-'}</td>
                <td className="py-2 px-2 text-slate-500 italic truncate max-w-[120px]">{prod.others || '-'}</td>
              </tr>
            ))}
            {(order.products || []).length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 italic bg-slate-50">
                  <span className="material-symbols-outlined text-xl mb-1 block">inventory_2</span>
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
            <tr>
              <td colSpan={2} className="py-2 px-3 text-right uppercase text-slate-500">Totales:</td>
              <td className="py-2 px-2 text-center">{order.products?.reduce((sum, p) => sum + (p.volume || 0), 0) || 0}</td>
              <td className="py-2 px-2 text-center">{order.products?.reduce((sum, p) => sum + (p.pieces || 0), 0) || 0}</td>
              <td className="py-2 px-2 text-center">-</td>
              <td className="py-2 px-2 text-center">{order.products?.reduce((sum, p) => sum + (p.weight || 0), 0) || 0} kg</td>
              <td className="py-2 px-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Logistics & Transport Details - Preview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <h5 className="text-[9px] font-black text-slate-400 uppercase mb-2">Detalles de Traslado</h5>
          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between"><span className="text-slate-500">Fecha Recep.:</span> <span className="font-bold">{order.general?.receptionDate || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Temp. Recep.:</span> <span className="font-bold">{order.general?.receptionTemp || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Cons. Sistema:</span> <span className="font-bold">{order.general?.conservationSystem || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Refrig. Unidad:</span> <span className="font-bold">{order.general?.shippingUnitRefrigeration || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Salida Est.:</span> <span className="font-bold">{order.general?.estDeparture || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Llegada Est.:</span> <span className="font-bold">{order.general?.estArrival || '-'}</span></div>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
          <div>
            <h5 className="text-[9px] font-black text-slate-400 uppercase mb-2">Documentación y Logística</h5>
            <div className="space-y-1 text-[9px]">
              <div className="flex justify-between"><span className="text-slate-500">Seguro de Carga:</span> <span className="font-bold">{order.documentation?.insurance || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Valor Factura:</span> <span className="font-bold">${order.documentation?.invoiceValue?.toLocaleString() || '0'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Factura Cliente:</span> <span className="font-bold">{order.documentation?.clientInvoice || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Forma Pago:</span> <span className="font-bold">{order.documentation?.paymentMethod || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tarimas:</span> <span className="font-bold">{order.logistics?.palletCount || '0'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Peso Tarima:</span> <span className="font-bold">{order.logistics?.palletWeight || '0'} kg</span></div>
            </div>
          </div>
        </div>
      </div>

      {order.general?.observations && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <h5 className="text-[9px] font-black text-amber-500 uppercase mb-1">Observaciones</h5>
          <p className="text-[9px] text-slate-700 italic">{order.general.observations}</p>
        </div>
      )}

      {/* Driver & Unit Info - Preview */}
      {
        (order.assignedUnit || order.assignedDriver) && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-4">
            {order.assignedUnit && (
              <div>
                <h5 className="text-[9px] font-black text-slate-400 uppercase mb-1">Unidad Asignada</h5>
                <p className="font-bold text-[10px] uppercase">{order.assignedUnit.id}</p>
                <p className="text-[9px] text-slate-500">{order.assignedUnit.plates} • {order.assignedUnit.type}</p>
              </div>
            )}
            {order.assignedDriver && (
              <div>
                <h5 className="text-[9px] font-black text-slate-400 uppercase mb-1">Operador</h5>
                <p className="font-bold text-[10px] uppercase">{order.assignedDriver.name}</p>
                <p className="text-[9px] text-slate-500">Lic: {order.assignedDriver.license}</p>
              </div>
            )}
          </div>
        )
      }

      {order.attachments && order.attachments.length > 0 && (
        <div className="mb-6">
          <h5 className="text-[9px] font-black text-slate-400 uppercase mb-2">Evidencia Fotográfica</h5>
          <div className="grid grid-cols-4 gap-2">
            {order.attachments.map((src, index) => (
              <div key={index} className="aspect-square rounded border border-slate-200 overflow-hidden">
                <img src={src} alt={`Evidencia ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div >
  );
};

// --- TEMPERATURE STYLING ---
const getTemperatureStyle = (temp: string) => {
  const t = temp?.toUpperCase() || '';
  if (t === 'CONGELADO') return 'bg-[#00CCFF] text-white';
  if (t === 'SECO') return 'bg-[#FFFF00] text-black';
  if (t === 'REFRIGERADO') return 'bg-[#FF00FF] text-white';
  return 'bg-slate-100 text-slate-600';
};

const TemperatureBadge: React.FC<{ temp: string; label?: string }> = ({ temp, label }) => {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getTemperatureStyle(temp)}`}>
      {label || temp}
    </span>
  );
};

// --- PDF GENERATION HELPER ---
const downloadAsPDF = (elementId: string, filename: string) => {
  const input = document.getElementById(elementId);
  if (!input) return;

  // Add a temporary class to ensure the element is captured at its full height and width
  input.style.width = "210mm";
  input.style.height = "auto";

  html2canvas(input, {
    scale: 2, // Higher quality
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: input.scrollWidth,
    windowHeight: input.scrollHeight
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm (slightly less to account for margins)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Page 1
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // Offset the image to show the next part
      // Correction for proper multi-page slicing
      const slicePosition = -(imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, slicePosition, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);

    // Reset styles after capture
    input.style.width = "";
    input.style.height = "";
  });
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

// --- FORM SECTION COMPONENT (Moved outside to prevent focus loss) ---
const FormSection = ({
  step,
  title,
  icon,
  colorClass,
  children,
  isLast = false,
  activeSection,
  onToggle,
  onNext
}: {
  step: number;
  title: string;
  icon: string;
  colorClass: string;
  children: React.ReactNode;
  isLast?: boolean;
  activeSection: number;
  onToggle: (step: number) => void;
  onNext: (current: number) => void;
}) => {
  const isActive = activeSection === step;
  const isCompleted = activeSection > step;

  return (
    <div className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isActive ? 'border-primary/50 shadow-lg ring-1 ring-primary/10' : 'border-slate-200 shadow-sm opacity-80'}`}>
      <div
        onClick={() => onToggle(step)}
        className={`p-6 border-b border-slate-100 flex items-center justify-between cursor-pointer transition-colors ${isActive ? 'bg-slate-50/80' : 'bg-white hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${isActive ? 'bg-primary text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {isCompleted ? <span className="material-symbols-outlined text-sm">check</span> : step}
          </div>
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-lg ${colorClass}`}>{icon}</span>
            <h3 className={`font-black uppercase text-xs tracking-widest ${isActive ? 'text-brand-navy' : 'text-slate-400'}`}>{title}</h3>
          </div>
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>expand_more</span>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-8 space-y-6">
          {children}
          {!isLast && (
            <div className="flex justify-end pt-4 border-t border-slate-50">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNext(step); }}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                Siguiente <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CREATE/EDIT FORM ---
const CreateServiceOrder: React.FC<{
  initialOrder?: ServiceOrder;
  existingOrders: ServiceOrder[];
  onSave: (order: ServiceOrder) => void;
  onCancel: () => void;
}> = ({ initialOrder, existingOrders, onSave, onCancel }) => {
  const { clients, providers, drivers, units } = useData();

  const generateNextGuideNumber = () => {
    const cmeOrders = existingOrders
      .map(o => o.general.guideNumber)
      .filter(g => g && g.startsWith('CME-'))
      .map(g => parseInt(g.replace('CME-', ''), 10))
      .filter(n => !isNaN(n));

    const maxNumber = cmeOrders.length > 0 ? Math.max(...cmeOrders) : -1;
    return `CME-${maxNumber + 1}`;
  };

  const generateTripNumber = () => {
    const tripOrders = existingOrders
      .map(o => o.general.tripNumber)
      .filter(t => t && t.startsWith('TR-'))
      .map(t => parseInt(t.replace('TR-', ''), 10))
      .filter(n => !isNaN(n));

    const maxTrip = tripOrders.length > 0 ? Math.max(...tripOrders) : 1000;
    return `TR-${maxTrip + 1}`;
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
      tripNumber: generateTripNumber(),
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
    attachments: [] // Initialize attachments
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

  // --- ATTACHMENTS HANDLING ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setFormData(prev => ({
              ...prev,
              attachments: [...(prev.attachments || []), reader.result as string]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }));
  };

  const [activeSection, setActiveSection] = useState<number>(1);

  const toggleSection = (section: number) => {
    setActiveSection(prev => prev === section ? section : section);
  };

  const nextSection = (current: number) => {
    setActiveSection(current + 1);
  };



  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">
            {initialOrder ? 'Edit' : 'Create'} Service Order
          </h1>
          <p className="text-sm text-slate-500 font-medium">Capture complete service details</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button onClick={onCancel} className="flex-1 md:flex-none px-4 md:px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">Cancel</button>
          <button
            onClick={() => onSave({ ...formData, status: 'borrador' })}
            className="flex-1 md:flex-none px-4 md:px-6 py-2.5 bg-amber-100 text-amber-700 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider hover:bg-amber-200 transition-all active:scale-95"
          >
            Draft
          </button>
          <button
            onClick={() => onSave({ ...formData, status: initialOrder ? formData.status : 'confirmada' })}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all ${activeSection >= 7 ? 'bg-primary shadow-primary/30 animate-pulse' : 'bg-slate-300 shadow-none cursor-not-allowed'
              }`}
          >
            {initialOrder ? 'Update' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-7 space-y-4">

          {/* TOP HEADER: GUIDE NUMBER & TRIP NUMBER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-start gap-6 md:gap-12 mb-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">No. Guía</label>
              <div className="text-2xl font-black text-brand-navy tracking-tight">{formData.general.guideNumber}</div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">No. de Viaje</label>
              <div className="text-2xl font-black text-slate-300 tracking-tight">{formData.general.tripNumber}</div>
            </div>
          </div>

          {/* Section 1: CLIENTE */}
          <FormSection step={1} title="Información del cliente" icon="person" colorClass="text-primary" activeSection={activeSection} onToggle={toggleSection} onNext={nextSection}>
            {/* SUB-SECTION 1: Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seleccionar Cliente</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none focus:ring-primary focus:border-primary"
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

              <div className="col-span-1">
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
          </FormSection>

          {/* Section 2: PROVEEDOR */}
          <FormSection step={2} title="Información del proveedor" icon="local_shipping" colorClass="text-emerald-600" activeSection={activeSection} onToggle={toggleSection} onNext={nextSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seleccionar Proveedor</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none focus:ring-emerald-500 focus:border-emerald-500"
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
              <div className="col-span-1">
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
          </FormSection>

          {/* Section 3: ORDEN DE TRASLADO */}
          <FormSection step={3} title="Información Orden de traslado" icon="route" colorClass="text-blue-500" activeSection={activeSection} onToggle={toggleSection} onNext={nextSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none"
                    value={formData.general.pickup || ''}
                    onChange={(e) => handleChange('general', 'pickup', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Forma de entrega</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none"
                    value={formData.general.deliveryMethod}
                    onChange={(e) => handleChange('general', 'deliveryMethod', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="OCURRE">OCURRE</option>
                    <option value="DOMICILIO">DOMICILIO</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
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
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none"
                    value={formData.general.conservationSystem || ''}
                    onChange={(e) => handleChange('general', 'conservationSystem', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">UNIDAD DE ENVÍO CUENTA CON REFRIERACION:</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none"
                    value={formData.general.shippingUnitRefrigeration || ''}
                    onChange={(e) => handleChange('general', 'shippingUnitRefrigeration', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
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
              <div className="col-span-1 md:col-span-2">
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
          </FormSection>

          {/* Section 4: MERCANCIA */}
          <FormSection step={4} title="Mercancía" icon="inventory_2" colorClass="text-amber-500" activeSection={activeSection} onToggle={toggleSection} onNext={nextSection}>
            <div className="space-y-8">
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
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase appearance-none bg-none border-none focus:ring-0 cursor-pointer ${product.temperature === 'CONGELADO' ? 'bg-cyan-100 text-cyan-700' :
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

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </FormSection>

          {/* Section 5: FACTURACION */}
          <FormSection step={5} title="Facturación" icon="payments" colorClass="text-emerald-500" activeSection={activeSection} onToggle={toggleSection} onNext={nextSection}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seguro</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none"
                    value={formData.documentation.insurance}
                    onChange={(e) => handleChange('documentation', 'insurance', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
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
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none"
                    value={formData.documentation.paymentMethod}
                    onChange={(e) => handleChange('documentation', 'paymentMethod', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Forma de envío</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none"
                    value={formData.documentation.shippingMethod}
                    onChange={(e) => handleChange('documentation', 'shippingMethod', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="POR COBRAR">POR COBRAR</option>
                    <option value="PAGADO">PAGADO</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Requiere Factura</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none"
                    value={formData.documentation.requiresInvoice ? 'SI' : 'NO'}
                    onChange={(e) => handleChange('documentation', 'requiresInvoice', e.target.value === 'SI')}
                  >
                    <option value="NO">NO</option>
                    <option value="SI">SI</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 6: ASIGNACIÓN DE UNIDAD Y OPERADOR */}
          <FormSection step={6} title="Asignación de Unidad y Operador" icon="local_shipping" colorClass="text-slate-500" activeSection={activeSection} onToggle={toggleSection} onNext={nextSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seleccionar Unidad</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none focus:ring-slate-500 focus:border-slate-500"
                    value={formData.assignedUnit?.id || ''}
                    onChange={(e) => {
                      const unitId = e.target.value;
                      const selectedUnit = units.find(u => u.id === unitId);
                      handleTopLevelChange('assignedUnit', selectedUnit);
                      handleTopLevelChange('unitId', unitId);
                    }}
                  >
                    <option value="">Seleccionar Unidad...</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.id} - {u.plates}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seleccionar Operador</label>
                <div className="relative">
                  <select
                    className="w-full border-slate-200 rounded-xl text-sm font-semibold appearance-none bg-none focus:ring-slate-500 focus:border-slate-500"
                    value={formData.assignedDriver?.id || ''}
                    onChange={(e) => {
                      const driverId = e.target.value;
                      const selectedDriver = drivers.find(d => d.id === driverId);
                      handleTopLevelChange('assignedDriver', selectedDriver);
                      handleTopLevelChange('driverId', driverId);
                    }}
                  >
                    <option value="">Seleccionar Operador...</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 7: EVIDENCIA FOTOGRÁFICA (NEW) */}
          <FormSection step={7} title="Evidencia Fotográfica" icon="photo_camera" colorClass="text-pink-500" isLast={true} activeSection={activeSection} onToggle={toggleSection} onNext={nextSection}>
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 hover:bg-slate-50 transition-colors text-center cursor-pointer relative group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  capture="environment" // Hints for camera on mobile
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                />
                <div className="pointer-events-none">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 group-hover:text-primary transition-colors">add_a_photo</span>
                  <p className="text-sm font-bold text-slate-600">Toque para tomar foto o cargar de galería</p>
                  <p className="text-[10px] text-slate-400 mt-1">Soporta múltiples imágenes (JPG, PNG)</p>
                </div>
              </div>

              {/* Image Previews */}
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.attachments.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
                      <img src={src} alt={`Adjunto ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>
        </div>

        <div className="col-span-12 xl:col-span-5 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Vista Previa</h3>
            <button
              type="button"
              onClick={() => downloadAsPDF('document-preview-content', `Draft_${formData.general.guideNumber}.pdf`)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">download</span> Descargar Borrador
            </button>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-auto max-h-[1200px]">
            <DocumentPreview order={formData} />
          </div>
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
                        <TemperatureBadge temp={prod.temperature} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Peso Bruto:</span> <span className="font-bold">{prod.weight}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Volumen:</span> <span className="font-bold">{prod.volume}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Piezas:</span> <span className="font-bold">{prod.pieces}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Unidad Medida:</span> <span className="font-bold">{prod.unitMeasure}</span></div>
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
                      <tr><td className="py-2 text-slate-400 font-bold">Fecha Recepción</td><td className="py-2">{order.general.receptionDate}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Cons. Recepción</td><td className="py-2">{order.general.conservationSystem}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Temperatura Recepción</td><td className="py-2">{order.general.receptionTemp}</td></tr>
                    </tbody>
                  </table>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-200/50">
                      <tr><td className="py-2 text-slate-400 font-bold w-1/2">Salida Estimada</td><td className="py-2">{order.general.estDeparture}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Llegada Estimada</td><td className="py-2">{order.general.estArrival}</td></tr>
                      <tr><td className="py-2 text-slate-400 font-bold">Refrigeración Unidad</td><td className="py-2">{order.general.shippingUnitRefrigeration}</td></tr>
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

              {/* Evidence photos in modal */}
              {order.attachments && order.attachments.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-pink-500">photo_camera</span> Evidencia Fotográfica
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {order.attachments.map((src, index) => (
                      <div key={index} className="aspect-square rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                        <img src={src} alt={`Evidencia ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Preview */}
            <div className="col-span-12 lg:col-span-4 bg-slate-100 p-6 border-l border-slate-200 flex flex-col overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-brand-navy uppercase text-xs tracking-widest">Document Preview</h3>
                <button
                  onClick={() => downloadAsPDF('modal-document-preview', `CartaPorte_${order.general.guideNumber}.pdf`)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Imprimir PDF
                </button>
              </div>
              <DocumentPreview order={order} id="modal-document-preview" />
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
  const { orders, isLoading, error, addOrder, updateOrder } = useData();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    guideNumber: true,
    tripNumber: true,
    client: true,
    origin: true,
    destination: true,
    products: true,
    unit: true,
    receptionDate: true,
    receptionTemp: true,
    estDeparture: false,
    estArrival: false,
    insurance: false,
    clientInvoice: false,
    invoiceValue: false,
    paymentMethod: false,
    shippingMethod: false,
    requiresInvoice: false,
    observations: false,
    status: true,
    actions: true
  });

  const columnLabels: Record<string, string> = {
    guideNumber: 'No. Guía',
    tripNumber: 'No. Viaje',
    client: 'Cliente',
    origin: 'Origen',
    destination: 'Destino',
    products: 'Productos',
    unit: 'Unidad',
    receptionDate: 'Fecha Rec.',
    receptionTemp: 'Temp. Rec.',
    estDeparture: 'Salida Est.',
    estArrival: 'Llegada Est.',
    insurance: 'Seguro',
    clientInvoice: 'Factura',
    invoiceValue: 'Valor',
    paymentMethod: 'Forma Pago',
    shippingMethod: 'Forma Envío',
    requiresInvoice: 'Req. Factura',
    observations: 'Observaciones',
    status: 'Estado'
  };

  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'all' | 'confirmada' | 'transito' | 'bodega' | 'cerrada'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const handleSave = async (orderData: ServiceOrder) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, orderData);
      } else {
        await addOrder(orderData);
      }
      setEditingOrder(null);
      setView('list');
    } catch (err) {
      console.error('Error saving order:', err);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.general.guideNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = activeSegment === 'all' || order.status === activeSegment;
    return matchesSearch && matchesSegment;
  });

  const stats = {
    total: orders.length,
    active: orders.filter(o => o.status === 'transito' || o.status === 'confirmada').length,
    completed: orders.filter(o => o.status === 'cerrada').length,
    alerts: 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100 m-4">
        <span className="material-symbols-outlined text-4xl mb-2">error</span>
        <p className="font-bold">Error al cargar datos</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

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

              {/* Column Visibility Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className="bg-white border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 shadow-sm outline-none hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  Columnas <span className="material-symbols-outlined text-sm text-slate-400">view_column</span>
                </button>
                {showColumnMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-20 max-h-[400px] overflow-y-auto">
                    {Object.keys(columnLabels).map(key => {
                      return (
                        <label key={key} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns[key as keyof typeof visibleColumns]}
                            onChange={() => toggleColumn(key as keyof typeof visibleColumns)}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-[11px] font-bold text-slate-600">{columnLabels[key]}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <button className="ml-auto bg-white py-2.5 px-5 rounded-xl text-xs font-bold text-slate-400 shadow-sm border border-slate-200">Limpiar</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  {visibleColumns.guideNumber && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 whitespace-nowrap">No. Guía</th>}
                  {visibleColumns.tripNumber && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">No. Viaje</th>}
                  {visibleColumns.client && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Cliente</th>}
                  {visibleColumns.origin && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Origen</th>}
                  {visibleColumns.destination && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Destino</th>}
                  {visibleColumns.products && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Productos</th>}
                  {visibleColumns.unit && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Unidad</th>}
                  {visibleColumns.receptionDate && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Fecha Rec.</th>}
                  {visibleColumns.receptionTemp && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Temp. Rec.</th>}
                  {visibleColumns.estDeparture && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Salida Estimada</th>}
                  {visibleColumns.estArrival && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Llegada Estimada</th>}
                  {visibleColumns.insurance && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Seguro</th>}
                  {visibleColumns.clientInvoice && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Factura</th>}
                  {visibleColumns.invoiceValue && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Valor</th>}
                  {visibleColumns.paymentMethod && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Forma Pago</th>}
                  {visibleColumns.shippingMethod && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Forma Envío</th>}
                  {visibleColumns.requiresInvoice && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Req. Factura</th>}
                  {visibleColumns.observations && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Observaciones</th>}
                  {visibleColumns.status && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Estado</th>}
                  {visibleColumns.actions && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group whitespace-nowrap"
                  >
                    {visibleColumns.guideNumber && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-brand-navy sticky left-0 bg-white group-hover:bg-slate-50 z-10">{order.general.guideNumber}</td>}
                    {visibleColumns.tripNumber && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-slate-500">{order.general.tripNumber || '-'}</td>}
                    {visibleColumns.client && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-600">{order.client}</td>}
                    {visibleColumns.origin && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-slate-600">{order.general.origin || order.general.reception}</td>}
                    {visibleColumns.destination && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-primary">{order.general.destination}</td>}
                    {visibleColumns.products && (
                      <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {order.products.map((p, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-slate-600">{p.name}</span>
                              <TemperatureBadge temp={p.temperature} />
                            </div>
                          ))}
                        </div>
                      </td>
                    )}
                    {visibleColumns.unit && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-600">{order.assignedUnit?.id || 'Pendiente'}</td>}
                    {visibleColumns.receptionDate && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-500">{order.general.receptionDate}</td>}
                    {visibleColumns.receptionTemp && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-blue-600">{order.general.receptionTemp || '-'}</td>}
                    {visibleColumns.estDeparture && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-500 text-center">{order.general.estDeparture || '-'}</td>}
                    {visibleColumns.estArrival && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-500 text-center">{order.general.estArrival || '-'}</td>}
                    {visibleColumns.insurance && (
                      <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-center">
                        <span className={order.documentation.insurance === 'SI' ? 'text-emerald-600' : 'text-slate-400'}>{order.documentation.insurance || 'NO'}</span>
                      </td>
                    )}
                    {visibleColumns.clientInvoice && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-medium text-slate-600">{order.documentation.clientInvoice || '-'}</td>}
                    {visibleColumns.invoiceValue && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-black text-slate-900 text-right">${order.documentation.invoiceValue?.toLocaleString() || '0'}</td>}
                    {visibleColumns.paymentMethod && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase italic">{order.documentation.paymentMethod || '-'}</td>}
                    {visibleColumns.shippingMethod && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase italic">{order.documentation.shippingMethod || '-'}</td>}
                    {visibleColumns.requiresInvoice && (
                      <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-xs font-bold text-center">
                        <span className={order.documentation.requiresInvoice ? 'text-emerald-600' : 'text-slate-400'}>{order.documentation.requiresInvoice ? 'SI' : 'NO'}</span>
                      </td>
                    )}
                    {visibleColumns.observations && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4 text-[10px] text-slate-500 whitespace-normal min-w-[200px]">{order.general.observations || '-'}</td>}
                    {visibleColumns.status && <td onClick={() => setSelectedOrder(order)} className="px-6 py-4"><StatusBadge status={order.status} /></td>}
                    {visibleColumns.actions && (
                      <td className="px-6 py-4 text-slate-400 flex items-center gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="hover:text-primary transition-colors" title="Ver Detalles">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button onClick={() => navigate(`/tracking?guide=${order.general.guideNumber}`)} className="hover:text-primary transition-colors" title="Rastrear en Mapa">
                          <span className="material-symbols-outlined">location_on</span>
                        </button>
                      </td>
                    )}
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
