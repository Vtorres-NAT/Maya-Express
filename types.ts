
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
