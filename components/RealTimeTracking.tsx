import React, { useEffect, useState } from 'react';
import { APIProvider, Map, useMapsLibrary, useMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ServiceOrder } from '../types';
import { getWorkflowEvents } from '../utils/workflow';

// Component to handle Directions Service
const Directions = () => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map, suppressMarkers: true })); // Custom markers
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    directionsService.route({
      origin: { lat: 19.377, lng: -99.041 }, // CDMX
      destination: { lat: 21.045, lng: -86.852 }, // Cancun
      waypoints: [{ location: { lat: 20.968, lng: -89.630 }, stopover: true }], // Merida
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    }).then(response => {
      directionsRenderer.setDirections(response);
      setRoutes(response.routes);
    }).catch(e => console.error("Directions request failed", e));
  }, [directionsService, directionsRenderer]);

  return null;
};

const RealTimeTracking: React.FC = () => {
  const { orders } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    const guideParam = searchParams.get('guide');
    if (guideParam && orders.length > 0) {
      const found = orders.find(o => o.general.guideNumber.toLowerCase() === guideParam.toLowerCase());
      if (found) {
        setActiveOrder(found);
      }
    }
  }, [searchParams, orders]);


  // Get dynamic events
  const events = activeOrder ? getWorkflowEvents(activeOrder) : [];

  // Markers config
  const markers = [
    { position: { lat: 19.377, lng: -99.041 }, label: 'CDMX', color: '#10b981' },
    { position: { lat: 20.968, lng: -89.630 }, label: 'Merida', color: '#3b82f6' },
    { position: { lat: 21.045, lng: -86.852 }, label: 'Cancun', color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Selection Box */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl font-black text-brand-navy uppercase tracking-tight">Seguimiento de Orden</h1>
          <p className="text-xs text-slate-400 font-bold uppercase">Monitor de Eventos</p>
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
                <p className="font-bold text-lg">18:45 PM</p>
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

            {/* Google Map */}
            <div className="col-span-12 lg:col-span-8 bg-slate-100 rounded-3xl h-[600px] overflow-hidden border border-slate-200 shadow-inner relative z-0">
              <APIProvider apiKey={""} onLoad={() => console.log('Maps API Loaded')}>
                <Map
                  defaultCenter={{ lat: 19.377, lng: -99.041 }}
                  defaultZoom={5}
                  mapId="DEMO_MAP_ID"
                  className="w-full h-full"
                  fullscreenControl={false}
                >
                  <Directions />
                  {markers.map((marker, idx) => (
                    <AdvancedMarker key={idx} position={marker.position}>
                      <Pin background={marker.color} borderColor={'#ffffff'} glyphColor={'#ffffff'} scale={1.2} />
                    </AdvancedMarker>
                  ))}
                </Map>
              </APIProvider>
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
