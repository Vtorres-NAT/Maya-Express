import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { ServiceOrder } from '../types';
import { getWorkflowEvents } from '../utils/workflow';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle Map focus
const MapFocus: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [coords, map]);
  return null;
};

const useGeocoding = () => {
  const [loading, setLoading] = useState(false);

  const geocode = useCallback(async (address: string): Promise<[number, number] | null> => {
    if (!address) return null;
    setLoading(true);
    // Clean up address (remove specific suffixes that might confuse geocoder)
    const cleanAddress = address.replace(/Hub|Base|DC|Center|Centro|Store/gi, '').trim();
    const query = `${cleanAddress}, Mexico`;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { 'User-Agent': 'MayaExpress-ERP' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  return { geocode, loading };
};

const RealTimeTracking: React.FC = () => {
  const { orders } = useData();
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeOrder, setActiveOrder] = useState<ServiceOrder | null>(null);
  const { geocode } = useGeocoding();
  const [markers, setMarkers] = useState<{ pos: [number, number]; label: string }[]>([]);

  useEffect(() => {
    const guideParam = searchParams.get('guide');
    if (guideParam && orders.length > 0) {
      const found = orders.find(o => o.general.guideNumber.toLowerCase() === guideParam.toLowerCase());
      if (found) {
        setActiveOrder(found);
      }
    }
  }, [searchParams, orders]);

  useEffect(() => {
    const updateMarkers = async () => {
      if (!activeOrder) {
        setMarkers([]);
        return;
      }

      // Process sequentially to be gentler on Nominatim and ensure state updates correctly
      const newMarkers = [];

      // Try Origin/Reception
      const receptionAddr = activeOrder.general.reception || activeOrder.general.origin;
      const receptionCoords = await geocode(receptionAddr);
      if (receptionCoords) {
        newMarkers.push({ pos: receptionCoords, label: 'Origen (Salida)' });
      } else if (activeOrder.general.origin) {
        // Fallback to just origin city if specific address fails
        const fallbackCoords = await geocode(activeOrder.general.origin);
        if (fallbackCoords) newMarkers.push({ pos: fallbackCoords, label: 'Origen (Ciudad)' });
      }

      // Try Destination/Delivery
      const destinationAddr = activeOrder.general.destination || activeOrder.general.delivery;
      const destinationCoords = await geocode(destinationAddr);
      if (destinationCoords) {
        newMarkers.push({ pos: destinationCoords, label: 'Destino (Llegada)' });
      } else if (activeOrder.general.destination) {
        // Fallback to just destination city if specific address fails
        const fallbackCoords = await geocode(activeOrder.general.destination);
        if (fallbackCoords) newMarkers.push({ pos: fallbackCoords, label: 'Destino (Ciudad)' });
      }

      setMarkers(newMarkers);
    };

    updateMarkers();
  }, [activeOrder, geocode]);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '--';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr.split('T')[0];

      const day = date.getDate();
      const year = date.getFullYear();

      if (language === 'es') {
        const months = [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        return `${day} de ${months[date.getMonth()]} de ${year}`;
      } else {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${months[date.getMonth()]} ${day}, ${year}`;
      }
    } catch {
      return dateStr;
    }
  };

  const events = activeOrder ? getWorkflowEvents(activeOrder) : [];

  return (
    <div className="space-y-8">
      {/* Selection Box */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tight">{t('module.tracking.title')}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('module.tracking.subtitle')}</p>
        </div>
        <div className="relative w-full max-w-sm">
          <select
            className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-brand-navy focus:border-primary focus:bg-white outline-none appearance-none cursor-pointer transition-all"
            value={activeOrder?.general.guideNumber || ''}
            onChange={(e) => {
              const found = orders.find(o => o.general.guideNumber === e.target.value);
              if (found) {
                setActiveOrder(found);
                setSearchParams({ guide: found.general.guideNumber });
              } else {
                setActiveOrder(null);
                setSearchParams({});
              }
            }}
          >
            <option value="">Seleccione un No. de Guía...</option>
            {orders.map((order) => (
              <option key={order.general.guideNumber} value={order.general.guideNumber}>
                {order.general.guideNumber} - {order.client}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeOrder && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Tracking Banner */}
          <div className="bg-brand-navy text-white rounded-3xl p-8 flex flex-wrap items-center justify-between gap-8 border-b-4 border-primary shadow-xl mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-widest">{activeOrder.status === 'transito' ? 'En Tránsito' : activeOrder.status}</span>
                <h2 className="text-2xl font-black font-mono tracking-tight">GUIA: {activeOrder.general.guideNumber}</h2>
              </div>
              <p className="text-slate-400 text-sm font-medium">Origen: {activeOrder.general.reception} → Destino: {activeOrder.general.destination}</p>
            </div>
            <div className="flex gap-10">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Estatus Actual</p>
                <p className="font-bold text-lg text-primary capitalize">{activeOrder.status}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Entrega Estimada</p>
                <p className="font-bold text-lg">{formatDate(activeOrder.general.estArrival)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Timeline */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-fit">
              <h3 className="text-sm font-black text-brand-navy uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">event_note</span> Registro de Eventos
              </h3>
              <div className="relative pl-8 border-l-2 border-slate-100 space-y-10">
                {events.map((step, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${step.status === 'completed' ? 'bg-emerald-500' :
                      step.status === 'current' ? 'bg-primary animate-pulse' : 'bg-slate-200'
                      }`}>
                      <span className="material-symbols-outlined text-white text-[12px] font-bold">{step.icon}</span>
                    </div>
                    <p className={`text-xs font-black uppercase ${step.status === 'current' ? 'text-primary' : 'text-brand-navy'}`}>{step.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">--</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaflet Map */}
            <div className="col-span-12 lg:col-span-8 bg-slate-100 rounded-3xl h-[600px] overflow-hidden border border-slate-200 shadow-inner relative z-0">
              <MapContainer
                key={activeOrder?.id}
                center={[23.626, -102.537]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker, idx) => (
                  <Marker key={idx} position={marker.pos}>
                    <Popup>
                      <div className="text-xs font-bold text-brand-navy uppercase tracking-tight">
                        {marker.label}
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <MapFocus coords={markers.map(m => m.pos)} />
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {!activeOrder && (
        <div className="h-[600px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
          <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">event_note</span>
          <p className="font-bold text-lg uppercase tracking-widest">Ingrese un número de guía para consultar eventos</p>
        </div>
      )}
    </div>
  );
};

export default RealTimeTracking;
