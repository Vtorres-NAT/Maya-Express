
export enum OrderStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface KPI {
  label: string;
  value: string | number;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface Shipment {
  id: string;
  client: string;
  origin: string;
  destination: string;
  status: OrderStatus;
  temperature?: string;
  eta: string;
  progress: number;
}

export interface Alert {
  id: string;
  type: 'Critical' | 'Warning' | 'Info';
  message: string;
  timestamp: string;
  unitId?: string;
}

export interface PhysicalData {
  weight: number;
  volume: number;
  pieces: number;
  unitMeasure: string;
  others?: string;
}

export interface Driver {
  name: string;
  phone: string;
  license?: string;
  rfc?: string;
}

export interface Unit {
  id: string; // e.g. PERMON 117
  plates: string;
  brand?: string;
  color?: string;
  type?: string; // e.g. Refrigerado, Seco
}

export interface ServiceOrder {
  id: string; // Internal ID
  client: string; // Client Name (kept for UI consistency)
  status: 'transito' | 'bodega' | 'confirmada' | 'borrador' | 'cerrada';

  // 1. General
  general: {
    guideNumber: string; // 1. No. Guía
    sheetName: string; // 2. Nombre de hoja
    destination: string; // 3. Destino
    deliveryMethod: string; // 4. Forma de entrega
    unit: string; // 5. Unidad (Simple display name)
    reception: string; // 6. Recepción
    delivery: string; // 7. Entrega
    secondDelivery?: string; // 8. Entrega (segunda)
  };

  // Detailed Fleet Info (New)
  assignedUnit?: Unit;
  assignedDriver?: Driver;

  // 9-13. Datos físicos – Recepción
  physicalReception: PhysicalData;

  // 14-18. Datos físicos – Entrega
  physicalDelivery: PhysicalData;

  // 19-23. Datos físicos – Entrega final
  physicalFinal: PhysicalData;

  // 24-27. Información de la mercancía
  merchandise: {
    product: string; // 24. Producto
    isRefrigerated: boolean; // 25. Unidad cuenta con refrigeración
    receptionConservation: string; // 26. Conservación en recepción
    type: string; // 27. Tipo
  };

  // 28-34. Documentación y control
  documentation: {
    receptionDate: string; // 28. Fecha de recepción de mercancía
    insurance: string; // 29. Seguro
    clientInvoice: string; // 30. Factura del cliente
    invoiceValue: number; // 31. Valor de factura
    shippingMethod: string; // 32. Forma de envío
    paymentMethod: string; // 33. Forma de pago
    requiresInvoice: boolean; // 34. Requiere factura
  };

  // 35-38. Logística adicional
  logistics: {
    palletWeight: number; // 35. Peso de tarima
    palletCount: number; // 37. Número de tarimas
    observations?: string; // 38. Observaciones
  };

  // Workflow Config (Flowchart Logic)
  workflow: {
    includesPickup: boolean; // ¿Incluye RECOLECCIÓN?
    includesShipping: boolean; // ¿Incluye ENVÍO?
    includesDelivery: boolean; // ¿Incluye ENTREGA FINAL?
  };
}

export interface FleetUnit {
  id: string; // Unit ID / Permon
  status: 'In Transit' | 'At Dock' | 'Maintenance' | 'Idle' | 'Loading';
  type: 'Refrigerado' | 'Congelado' | 'Seco';
  brand: string;
  plates: string;
  color: string;
  driver: {
    name: string;
    phone: string;
    license?: string;
    rfc?: string;
  };
  loc: string;
  colorCode: 'emerald' | 'blue' | 'amber' | 'slate' | 'primary';
}
