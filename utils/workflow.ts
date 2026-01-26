import { ServiceOrder } from '../types';

export interface WorkflowEvent {
    id: string;
    title: string;
    status: 'completed' | 'current' | 'pending';
    icon: string;
}

export const getWorkflowEvents = (order: ServiceOrder): WorkflowEvent[] => {
    const events: WorkflowEvent[] = [];
    const { includesPickup, includesShipping, includesDelivery } = order.workflow;
    const currentStatus = order.status; // We might use this to determine 'current' vs 'completed'

    // 1. [Inicio] -> [Crear Guía] (Evento: guia_creada)
    events.push({ id: 'guia_creada', title: 'Guía Creada', status: 'completed', icon: 'description' });

    // 2. ¿Incluye RECOLECCIÓN?
    if (includesPickup) {
        // Sí
        events.push({ id: 'recolectado', title: 'Recolectado', status: 'completed', icon: 'local_shipping' });
        events.push({ id: 'ingreso_bodega_origen', title: 'Ingreso Bodega Origen', status: 'completed', icon: 'warehouse' });
    } else {
        // No -> Direct to Ingreso Bodega Origen (Client drops off?)
        events.push({ id: 'ingreso_bodega_origen', title: 'Ingreso Bodega Origen', status: 'completed', icon: 'warehouse' });
    }

    // 3. ¿Incluye ENVÍO?
    if (includesShipping) {
        // Sí
        events.push({ id: 'salida_bodega_origen', title: 'Salida Bodega Origen', status: 'completed', icon: 'logout' });
        events.push({ id: 'en_transporte', title: 'En Transporte', status: 'current', icon: 'local_shipping' }); // Assuming this is typical active state
        events.push({ id: 'arribo_bodega_destino', title: 'Arribo Bodega Destino', status: 'pending', icon: 'login' });
        events.push({ id: 'ingreso_bodega_destino', title: 'Ingreso Bodega Destino', status: 'pending', icon: 'warehouse' });

        // 4. ¿Incluye ENTREGA FINAL? (At Destination)
        if (includesDelivery) {
            // Sí
            events.push({ id: 'entregado', title: 'Entregado', status: 'pending', icon: 'check_circle' });
        } else {
            // No
            events.push({ id: 'en_resguardo_bodega_destino', title: 'En Resguardo (Destino)', status: 'pending', icon: 'inventory' });
            events.push({ id: 'fin_operativo', title: 'Fin Operativo', status: 'pending', icon: 'flag' });
        }

    } else {
        // No (Remains in Origin) -> Decision: Includes Delivery (at Origin)?
        if (includesDelivery) {
            // Sí (Local delivery from Origin Hub)
            events.push({ id: 'entregado', title: 'Entregado (Local)', status: 'pending', icon: 'check_circle' });
        } else {
            // No
            events.push({ id: 'en_resguardo_bodega_origen', title: 'En Resguardo (Origen)', status: 'pending', icon: 'inventory' });
            events.push({ id: 'fin_operativo', title: 'Fin Operativo', status: 'pending', icon: 'flag' });
        }
    }

    // Simple logic to set status based on order status for demo purposes
    // In a real app, strict event timestamps would determine this.
    // Here we just map 'current' based on list position or matching string.

    return events.map(e => {
        // Override status logic if needed, for MVP we return the static structure
        // and let the UI highlight based on index or hardcoded 'current'
        return e;
    });
};
