
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

export interface ServiceOrderProduct {
  name: string;
  temperature: string;
  weight: number;
  volume: number;
  pieces: number;
  unitMeasure: string;
  others?: string;
}

export interface ServiceOrder {
  id: string; // Internal ID
  client: string; // Client Name (kept for UI consistency)
  provider?: string; // Provider Name
  status: 'transito' | 'bodega' | 'confirmada' | 'borrador' | 'cerrada';

  // 1. General
  general: {
    guideNumber: string; // 1. No. Guía
    sheetName: string; // 2. Nombre de hoja
    tripNumber?: string; // No. de Viaje
    destination: string; // 3. Destino
    deliveryMethod: string; // 4. Forma de entrega
    origin: string; // 5. ORIGEN (New)
    pickup?: string; // Recolección 'SI' | 'NO'
    receptionDate: string; // Fecha recepción (moved from documentation)
    conservationSystem: string; // SISTEMA DE CONSERVACION RECEPCION: 'SI' | 'NO'
    shippingUnitRefrigeration: string; // UNIDAD DE ENVÍO CUENTA CON REFRIERACION: 'SI' | 'NO'
    reception: string; // 6. Recepción (Address)
    delivery: string; // 7. Entrega (Address)
    secondDelivery?: string; // 8. Entrega (segunda)

    // Client Snapshot
    clientAddress?: string;
    clientContact?: string;
    clientPhone?: string;

    // Provider Snapshot
    providerAddress?: string;
    providerContact?: string;
    providerPhone?: string;

    // Logistics info (Section 3)
    observations?: string; // 38. Observaciones
    estDeparture?: string; // Fecha aprox salida origen
    estArrival?: string; // fecha aprox llega destino
    receptionTemp?: string; // Temperatura de Recepción
  };

  // Detailed Fleet Info (New)
  assignedUnit?: Unit;
  assignedDriver?: Driver;

  // Dynamic Products List (Replaces Physical Data & Merchandise)
  products: ServiceOrderProduct[];

  // 28-34. Documentación y control
  documentation: {
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

export interface Client {
  id: number;
  client: string;
  deliveryAddress: string;
  contactName: string;
  phone: string;
  destination: string;
  deliveryMethod: string;
  insurance: string;
  pickupRequired?: string; // 'SI' | 'NO'
  email?: string;
}

export interface ProductItem {
  name: string;
  temperature: string;
}

export interface Provider {
  id: number;
  provider: string;
  address: string;
  contactName: string;
  phone: string;
  products: ProductItem[];
}
