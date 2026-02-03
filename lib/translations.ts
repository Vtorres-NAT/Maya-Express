
export type Language = 'en' | 'es';

export const translations = {
    en: {
        // Sidebar
        'nav.dashboard': 'Executive Dash',
        'nav.ops_hub': 'Operational Hub',
        'nav.tracking': 'Real-Time Tracking',
        'nav.orders': 'Service Orders',
        'nav.billing': 'Billing Center',
        'nav.finance': 'Finance AP/AR',
        'nav.clients': 'Clients/Providers',
        'nav.data': 'Master Data',
        'nav.logistics': 'Logistics',
        'nav.corporate': 'Maya Express',
        'nav.sign_out': 'SIGN OUT',

        // Executive Dashboard
        'dash.kpi.active_shipments': 'Active Shipments',
        'dash.kpi.active_shipments_desc': 'In Route / Pending',
        'dash.kpi.units_operation': 'Operational Fleet',
        'dash.kpi.units_operation_desc': 'Assigned Units',
        'dash.kpi.warehouse_load': 'Warehouse Load',
        'dash.kpi.warehouse_load_desc': 'Current Inventory',
        'dash.kpi.efficiency': 'Global Efficiency',
        'dash.kpi.efficiency_desc': 'Closure Rate',
        'dash.chart.title': 'Operational Distribution',
        'dash.chart.subtitle': 'Current balance of the logistics network',
        'dash.recent.title': 'Recent Movements',
        'dash.recent.empty': 'No orders registered.',
        'dash.order.guide': 'Guide',
        'dash.order.status': 'Status',
        'dash.order.destination': 'Shipment to',

        // Common
        'common.loading': 'Initializing System',
        'common.user': 'User',
        'common.guest': 'Guest',
        'common.notifications': 'Notifications',
    },
    es: {
        // Sidebar
        'nav.dashboard': 'Dash Ejecutivo',
        'nav.ops_hub': 'Hub Operativo',
        'nav.tracking': 'Rastreo Real-Time',
        'nav.orders': 'Órdenes de Servicio',
        'nav.billing': 'Centro de Facturación',
        'nav.finance': 'Finanzas CXC/CXP',
        'nav.clients': 'Clientes/Proveedores',
        'nav.data': 'Datos Maestros',
        'nav.logistics': 'Logística',
        'nav.corporate': 'Maya Express',
        'nav.sign_out': 'CERRAR SESIÓN',

        // Executive Dashboard
        'dash.kpi.active_shipments': 'Envíos Principales',
        'dash.kpi.active_shipments_desc': 'En Ruta / Pendientes',
        'dash.kpi.units_operation': 'Flota Operativa',
        'dash.kpi.units_operation_desc': 'Unidades Asignadas',
        'dash.kpi.warehouse_load': 'Carga en Bodega',
        'dash.kpi.warehouse_load_desc': 'Inventario Actual',
        'dash.kpi.efficiency': 'Eficiencia Global',
        'dash.kpi.efficiency_desc': 'Tasa de Cierre',
        'dash.chart.title': 'Distribución Operativa',
        'dash.chart.subtitle': 'Balance actual de la red de logística',
        'dash.recent.title': 'Movimientos Recientes',
        'dash.recent.empty': 'No hay órdenes registradas.',
        'dash.order.guide': 'Guía',
        'dash.order.status': 'Estatus',
        'dash.order.destination': 'Envío a',

        // Common
        'common.loading': 'Iniciando Sistema',
        'common.user': 'Usuario',
        'common.guest': 'Invitado',
        'common.notifications': 'Notificaciones',
    }
};
