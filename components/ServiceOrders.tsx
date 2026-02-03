import React, { useState } from 'react';
import { ServiceOrder, ServiceOrderProduct } from '../types';
import { MOCK_ORDERS } from '../data/mockData';
import { useData } from '../context/DataContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import pdfLogo from '../assets/pdf_logo_v2.png';
import pdfSlogan from '../assets/pdf_slogan_v2.png';

// Reusable Document Preview (Updated for Nested Data)
const DocumentPreview: React.FC<{ order: Partial<ServiceOrder>; id?: string }> = ({ order, id = "document-preview-content" }) => {
  // Logic to group products by temperature
  const grouped = (order.products || []).reduce((acc, prod) => {
    const temp = (prod.temperature || 'SECO').toUpperCase();
    if (!acc[temp]) {
      acc[temp] = { volume: 0, pieces: 0, weight: 0, units: new Set<string>(), others: [] };
    }
    acc[temp].volume += Number(prod.volume) || 0;
    acc[temp].pieces += Number(prod.pieces) || 0;
    acc[temp].weight += Number(prod.weight) || 0;
    if (prod.unitMeasure) acc[temp].units.add(prod.unitMeasure.toUpperCase());
    if (prod.others) acc[temp].others.push(prod.others);
    return acc;
  }, {} as Record<string, { volume: number; pieces: number; weight: number; units: Set<string>; others: string[] }>);

  const formatQuantity = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || num === '') return '-';
    const val = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(val)) return num;
    // Standard Western: Comma for thousands, Dot for decimals
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCurrency = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || num === '') return '-';
    const val = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(val)) return num;
    // User wants "10,000" (no decimals if zero) but with commas for thousands
    return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const totalWeight = Object.keys(grouped).reduce((sum, key) => sum + grouped[key].weight, 0);
  const isSinThermoChecked = order.general?.conservationSystem !== 'SI';

  return (
    <div
      id={id}
      className="bg-white p-8 text-black shadow-2xl w-full mx-auto flex flex-col min-h-[297mm] h-auto overflow-visible print:shadow-none print:p-0"
      style={{ maxWidth: '210mm' }}
    >
      {/* Brand Header */}
      <div className="flex justify-between items-center mb-2">
        <img src={pdfLogo} alt="Logo" className="h-20 object-contain" />
        <img src={pdfSlogan} alt="Slogan" className="h-10 object-contain" />
      </div>

      {/* Guide Header Row */}
      <div className="flex justify-between items-center mb-4 border-y-2 border-slate-900 h-10">
        <p className="text-[#FF0000] font-black text-[10px] uppercase leading-tight">
          CLIENTE FAVOR DE VERIFICAR QUE SUS DATOS SEAN CORRECTOS
        </p>
        <div className="flex items-center gap-6 h-full">
          <span className="font-black text-base uppercase whitespace-nowrap text-black">NÚMERO DE GUÍA:</span>
          <span className="font-black text-xl text-[#0070c0] min-w-[80px] text-right flex items-center justify-end h-full">
            {order.general?.guideNumber || 'SO-PENDING'}
          </span>
        </div>
      </div>

      {/* Info Section: ORDEN DE TRASLADO */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-0.5 text-[10px] mb-4 font-bold">
        {/* Left Side */}
        <div className="space-y-0.5">
          <h2 className="text-base font-black uppercase mb-1 text-black">ORDEN DE TRASLADO</h2>
          <div className="flex gap-2">
            <span className="uppercase whitespace-nowrap text-black">FECHA:</span>
            <span className="font-normal uppercase text-[#0070c0]">{order.general?.receptionDate || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="uppercase whitespace-nowrap text-black">OPERADOR:</span>
            <span className="font-normal uppercase text-[#0070c0]">{order.assignedDriver?.name || '-'}</span>
          </div>

          <div className="pt-1">
            <p className="text-[#FF0000] text-[8px] leading-tight font-black uppercase max-w-[280px]">
              IMPORTANTE: MAYA EXPRESS NO SE HACE RESPONSABLE POR MERCANCIA O ENVIOS PASADOS LOS 15 DIAS DE ARRIBO
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-0.5 mt-[0.5px]">
          <div className="flex items-center gap-3 mb-1">
            <span className="uppercase whitespace-nowrap text-black">NO. ECONÓMICO DE UNIDAD:</span>
            <span className="font-normal uppercase text-[#0070c0]">{/* Placeholder for future field */}</span>
          </div>

          <div className="flex gap-2">
            <span className="uppercase whitespace-nowrap text-black">ORIGEN:</span>
            <span className="font-normal uppercase text-[#0070c0]">{order.general?.origin || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="uppercase whitespace-nowrap text-black">DESTINO:</span>
            <span className="font-normal uppercase text-[#0070c0]">{order.general?.destination || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="uppercase whitespace-nowrap text-black">FORMA DE ENTREGA:</span>
            <span className="font-normal uppercase text-[#0070c0]">{order.general?.deliveryMethod || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="uppercase whitespace-nowrap font-black text-black">NO. VIAJE:</span>
            <span className="font-black uppercase text-[#0070c0]">{order.general?.tripNumber || '-'}</span>
          </div>
        </div>
      </div>

      {/* Billing Section */}
      <div className="text-[10px] mb-2 font-bold text-slate-900 border-t border-slate-200 pt-2">
        <div className="flex gap-2">
          <span className="uppercase whitespace-nowrap text-black">CLIENTE AL QUE SE FACTURA O COBRA:</span>
          <span className="font-normal uppercase text-[#0070c0]">{/* Manual Fill */}</span>
        </div>
      </div>

      {/* Contact Section: REMITENTE & DESTINATARIO */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-[10px] mb-4 font-bold">
        {/* Remitente side */}
        <div className="space-y-1">
          <div className="flex gap-1">
            <span className="uppercase whitespace-nowrap text-black">REMITENTE:</span>
            <span className="font-normal uppercase leading-tight text-[#0070c0]">{order.provider || '-'}</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="uppercase whitespace-nowrap text-black">DIRECCIÓN:</span>
            <span className="font-normal uppercase leading-snug text-[#0070c0]">{order.general?.providerAddress || '-'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-1">
              <span className="uppercase whitespace-nowrap text-black">NOMBRE:</span>
              <span className="font-normal uppercase leading-tight text-[#0070c0]">{order.general?.providerContact || '-'}</span>
            </div>
            <div className="flex gap-1">
              <span className="uppercase whitespace-nowrap text-black">TELÉFONO:</span>
              <span className="font-normal uppercase leading-tight text-[#0070c0]">{order.general?.providerPhone || '-'}</span>
            </div>
          </div>
        </div>

        {/* Destinatario side */}
        <div className="space-y-1">
          <div className="flex gap-1">
            <span className="uppercase whitespace-nowrap text-black">DESTINATARIO:</span>
            <span className="font-normal uppercase leading-tight text-[#0070c0]">{order.client || '-'}</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="uppercase whitespace-nowrap text-black">DIRECCIÓN:</span>
            <span className="font-normal uppercase leading-snug text-[#0070c0]">{order.general?.clientAddress || '-'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-1">
              <span className="uppercase whitespace-nowrap text-black">NOMBRE:</span>
              <span className="font-normal uppercase leading-tight text-[#0070c0]">{order.general?.clientContact || '-'}</span>
            </div>
            <div className="flex gap-1">
              <span className="uppercase whitespace-nowrap text-black">TELÉFONO:</span>
              <span className="font-normal uppercase leading-tight text-[#0070c0]">{order.general?.clientPhone || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Products Table matching Reference Image */}
      <div className="mt-8 mb-4 overflow-hidden border border-slate-900">
        <table className="w-full text-[10px] border-collapse">
          <thead className="bg-[#5b9bd5] text-white uppercase font-black text-[9px]">
            <tr>
              <th className="py-2 px-2 text-left border border-slate-900 w-[15%]">PRODUCTO:</th>
              <th className="py-2 px-1 text-center border border-slate-900 w-[15%]">Volumen</th>
              <th className="py-2 px-1 text-center border border-slate-900 w-[15%]">Piezas</th>
              <th className="py-2 px-1 text-center border border-slate-900 w-[15%]">Unidad de Medida</th>
              <th className="py-2 px-1 text-center border border-slate-900 w-[15%]">Otros</th>
              <th className="py-2 px-1 text-center border border-slate-900 w-[10%]">Peso</th>
              <th className="py-2 px-2 text-left border border-slate-900 w-[15%]">Recepción de mercancía</th>
            </tr>
          </thead>
          <tbody>
            {['SECO', 'REFRIGERADO', 'CONGELADO'].map((temp) => {
              const data = (grouped as any)[temp] || { volume: 0, pieces: 0, weight: 0, units: new Set(), others: [] };
              return (
                <tr key={temp} className="font-bold text-black text-center">
                  <td className="py-2 px-2 border border-slate-900 uppercase text-left">{temp}</td>
                  <td className="py-2 px-1 border border-slate-900 font-black text-[#0070c0]">{formatQuantity(data.volume)}</td>
                  <td className="py-2 px-1 border border-slate-900 font-black text-[#0070c0]">{formatQuantity(data.pieces)}</td>
                  <td className="py-2 px-1 border border-slate-900 uppercase text-[#0070c0]">{Array.from(data.units as any).join(', ') || '0'}</td>
                  <td className="py-2 px-1 border border-slate-900 text-[#0070c0]">{(data.others as any).join(', ') || '0'}</td>
                  <td className="py-2 px-1 border border-slate-900 font-black text-[#0070c0]">{data.weight > 0 ? formatQuantity(data.weight) : '-'}</td>
                  <td className="py-1 px-2 border border-slate-900 text-[9px] font-black italic text-[#0070c0] text-center">
                    {temp === 'REFRIGERADO' && (
                      <span>{isSinThermoChecked ? 'SIN THERMO' : 'CON THERMO'}</span>
                    )}
                    {temp === 'CONGELADO' && (
                      <div className="flex flex-col">
                        <span>{isSinThermoChecked ? 'SIN THERMO' : 'CON THERMO'}</span>
                        <span className="text-[7px]">DESCONGELADO / CONGELADO</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Peso Total & Contenido Producto Row */}
      <div className="flex flex-col mb-4">
        <div className="flex justify-between items-end">
          <div className="flex-1 mr-12 relative h-10 flex flex-col justify-end">
            <div className="flex items-baseline gap-2">
              <span className="text-[9.5px] font-black text-black uppercase whitespace-nowrap">CONTENIDO PRODUCTO:</span>
              <span className="text-[#0070c0] font-bold uppercase text-[10px] flex-1 text-center">
                {order.products?.map(p => p.name).filter(Boolean).join(', ') || '-'}
              </span>
            </div>
            <div className="border-b border-slate-900 w-full mt-1"></div>
          </div>
          <div className="flex flex-col items-end gap-1 mb-[-2px]">
            <span className="text-[10px] font-black text-black uppercase leading-none">PESO TOTAL:</span>
            <div className="border-b border-slate-200 min-w-[120px] text-right font-black text-xs pb-1 pr-2 text-[#0070c0] mt-1 border-b-slate-900">
              {formatQuantity(totalWeight)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Conditions Section - COMPACT & FANCY */}
      <div className="text-[9px] font-black border-t-2 border-slate-900 pt-1.5 mt-4">
        <p className="mb-1 text-[9px] uppercase tracking-tighter text-slate-400">SE RECIBE Y ENVIA BAJO LAS SIGUIENTES CONDICIONES</p>

        <div className="grid grid-cols-2 gap-x-12 gap-y-0.5">
          {/* Left Column Operations */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="uppercase whitespace-nowrap text-black">UNIDAD CUENTA CON REFRIERACION:</span>
              <div className="flex-1 border-b border-dotted border-slate-300 h-2 mx-1"></div>
              <span className="font-bold text-[#0070c0]">{order.general?.shippingUnitRefrigeration || '-'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="uppercase whitespace-nowrap text-black">SISTEMA DE CONSERVACION RECEPCION:</span>
              <div className="flex-1 border-b border-dotted border-slate-300 h-2 mx-1"></div>
              <span className="font-bold text-[#0070c0]">{order.general?.conservationSystem || '-'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="uppercase whitespace-nowrap text-black">SISTEMA DE CONSERVACION ENVIO:</span>
              <div className="flex-1 border-b border-dotted border-slate-300 h-2 mx-1"></div>
              <span className="font-bold text-[#0070c0]">{(order.products && order.products[0]?.temperature) || '-'}</span>
            </div>
          </div>

          {/* Right Column Physical */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="uppercase whitespace-nowrap text-black">PESO TARIMA:</span>
              <div className="flex-1 border-b border-dotted border-slate-300 h-2 mx-1"></div>
              <span className="font-bold text-[#0070c0]">{formatQuantity(order.logistics?.palletWeight) || '0.00'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="uppercase whitespace-nowrap text-black">TEMPERATURA DE RECEPCION °C:</span>
              <div className="flex-1 border-b border-dotted border-slate-300 h-2 mx-1"></div>
              <span className="font-bold text-[#0070c0]">{order.general?.receptionTemp || '-'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="uppercase whitespace-nowrap text-black"># DE TARIMAS:</span>
              <div className="flex-1 border-b border-dotted border-slate-300 h-2 mx-1"></div>
              <span className="font-bold text-[#0070c0]">{order.logistics?.palletCount || '0'}</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 text-center leading-none">
          <p className="text-[#FF0000] text-[8px] uppercase font-black">
            ( TODA MERCANCÍA NO ASEGURADA VIAJARÁ POR CUENTA Y RIESGO DEL CLIENTE )
          </p>
          <p className="text-[#0070c0] text-[8px] uppercase font-black">
            TODO PRODUCTO EMBARCADO ES RESPONSABILIDAD DEL CLIENTE / PROVEEDOR
          </p>
        </div>

        {/* Invoice Section Row */}
        <div className="mt-2 grid grid-cols-3 gap-6 items-end">
          <div className="flex flex-col gap-1 text-center">
            <span className="uppercase text-[8px] text-slate-500">CARGA ASEGURADA COSTO ADICIONAL</span>
            <div className="border-b border-slate-900 pb-0.5 font-bold text-[10px] text-[#0070c0]">
              {order.documentation?.insurance || '-'}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-center">
            <span className="uppercase text-[8px] text-slate-500">FACTURA DEL CLIENTE</span>
            <div className="border-b border-slate-900 pb-0.5 font-bold text-[10px] text-[#0070c0]">
              {order.documentation?.clientInvoice || '-'}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-center">
            <span className="uppercase text-[8px] text-slate-500">VALOR FACTURA</span>
            <div className="border-b border-slate-900 pb-0.5 flex justify-between px-2 font-bold text-[10px]">
              <span className="text-black">$</span>
              <span className="text-[#0070c0]">{formatCurrency(order.documentation?.invoiceValue)}</span>
            </div>
          </div>
        </div>

        {/* Payment / Shipping Row */}
        <div className="mt-2 flex justify-between items-center gap-6">
          <div className="flex items-center gap-1 flex-1">
            <span className="uppercase whitespace-nowrap text-[8px] text-black">FORMA DE ENVIO:</span>
            <div className="flex-1 border-b border-dotted border-slate-200 h-1.5 mx-1"></div>
            <span className="font-bold text-[9px] text-[#0070c0]">{order.documentation?.shippingMethod || '-'}</span>
          </div>
          <div className="flex items-center gap-1 flex-1">
            <span className="uppercase whitespace-nowrap text-[8px] text-black">FORMA DE PAGO:</span>
            <div className="flex-1 border-b border-dotted border-slate-200 h-1.5 mx-1"></div>
            <span className="font-bold text-[9px] text-[#0070c0]">{order.documentation?.paymentMethod || '-'}</span>
          </div>
          <div className="flex items-center gap-1 flex-1">
            <span className="uppercase whitespace-nowrap text-[8px] text-black">CLIENTE REQUIERE FACTURA:</span>
            <div className="flex-1 border-b border-dotted border-slate-200 h-1.5 mx-1"></div>
            <span className="font-bold text-[9px] text-[#0070c0]">{order.documentation?.requiresInvoice ? 'SI' : 'NO'}</span>
          </div>
        </div>

        {/* Observations */}
        <div className="mt-2">
          <span className="uppercase block text-[8px] text-slate-400 mb-0.5">OBSERVACIONES GENERALES:</span>
          <div className="border-b border-slate-900 min-h-[16px] pb-1 text-[#0070c0] italic font-medium text-[9px]">
            {order.general?.observations || '-'}
          </div>
        </div>

        {/* Dates - Split timestamps */}
        <div className="mt-2 grid grid-cols-2 gap-12">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-0.5">
            <span className="uppercase whitespace-nowrap text-[8px] text-black">FECHA APROX SALIDA ORIGEN:</span>
            <span className="font-bold text-[10px] text-[#0070c0]">{order.general?.estDeparture?.split('T')[0] || '-'}</span>
          </div>
          <div className="flex items-center gap-2 border-b border-slate-900 pb-0.5">
            <span className="uppercase whitespace-nowrap text-[8px] text-black">FECHA APROX LLEGADA DESTINO:</span>
            <span className="font-bold text-[10px] text-[#0070c0]">{order.general?.estArrival?.split('T')[0] || '-'}</span>
          </div>
        </div>
      </div>



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

      {
        order.attachments && order.attachments.length > 0 && (
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
        )
      }

      {/* Signatures Section - COMPRESSED */}
      <div className="mt-auto pt-4 space-y-4 mb-8">
        {/* RECEPCIÓN Row */}
        <div className="relative">
          <div className="absolute left-1/2 -top-3 -translate-x-1/2 text-[9px] font-black uppercase">RECEPCIÓN</div>
          <div className="grid grid-cols-2 gap-x-20">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold h-3 uppercase">{order.general?.providerContact || '-'}</span>
              <div className="w-full border-b border-slate-400 mt-0.5"></div>
              <span className="text-[7px] font-black mt-0.5 text-center leading-none uppercase">NOMBRE, FIRMA Y FECHA CLIENTE QUE ENTREGA</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold h-3 uppercase">{/* Collaborator Placeholder */}</span>
              <div className="w-full border-b border-slate-400 mt-0.5"></div>
              <span className="text-[7px] font-black mt-0.5 text-center leading-none uppercase">NOMBRE, FIRMA Y FECHA COLABORADOR QUE RECIBE</span>
            </div>
          </div>
        </div>

        {/* ENTREGA Row */}
        <div className="relative pt-2">
          <div className="absolute left-1/2 -top-1 -translate-x-1/2 text-[9px] font-black uppercase">ENTREGA</div>
          <div className="grid grid-cols-2 gap-x-20">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold h-3 uppercase">{/* Collaborator Placeholder */}</span>
              <div className="w-full border-b border-slate-400 mt-0.5"></div>
              <span className="text-[7px] font-black mt-0.5 text-center leading-none uppercase">NOMBRE, FIRMA Y FECHA COLABORADOR QUE ENTREGA</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold h-3 uppercase">{order.general?.clientContact || '-'}</span>
              <div className="w-full border-b border-slate-400 mt-0.5"></div>
              <span className="text-[7px] font-black mt-0.5 text-center leading-none uppercase">NOMBRE, FIRMA Y FECHA CLIENTE QUE RECIBE</span>
            </div>
          </div>
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
              onClick={() => downloadAsPDF('document-preview-content', `GUIA_${formData.general.guideNumber}.pdf`)}
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
                  onClick={() => downloadAsPDF('modal-document-preview', `GUIA_${order.general.guideNumber}.pdf`)}
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
