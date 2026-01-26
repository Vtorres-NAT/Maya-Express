import { ServiceOrder, FleetUnit } from '../types';

export const MOCK_ORDERS: ServiceOrder[] = [
    {
        id: 'SO-001',
        client: 'Alimentos del Norte',
        status: 'transito',
        general: {
            guideNumber: 'SO-2024-1023',
            sheetName: 'Ticket-001',
            destination: 'Mérida',
            deliveryMethod: 'FTL',
            unit: 'PERMON 117',
            reception: 'CDMX Hub',
            delivery: 'Mérida DC',
        },
        assignedUnit: {
            id: 'PERMON 117 / 193',
            plates: '13BE3G / 59UV6L',
            brand: 'VOLVO / UTILITY',
            color: 'BLANCO',
            type: 'REFRIGERADO MERIDA'
        },
        assignedDriver: {
            name: 'ERICK ALAN SANTYIESTEBAN OROZCO',
            phone: '427 107 2268',
            license: '00041834',
            rfc: 'SAOE970311JZ5'
        },
        physicalReception: { weight: 12500, volume: 45, pieces: 120, unitMeasure: 'Pallets' },
        physicalDelivery: { weight: 12450, volume: 45, pieces: 120, unitMeasure: 'Pallets' },
        physicalFinal: { weight: 12450, volume: 45, pieces: 120, unitMeasure: 'Pallets' },
        merchandise: { product: 'Lácteos Congelados', isRefrigerated: true, receptionConservation: 'Excelente', type: 'Perecederos' },
        documentation: { receptionDate: '24 abr 2024', insurance: 'Cobertura Amplia', clientInvoice: 'F-9923', invoiceValue: 150000, shippingMethod: 'Terrestre', paymentMethod: 'Crédito', requiresInvoice: true },
        logistics: { palletWeight: 25, palletCount: 20 },
        workflow: { includesPickup: true, includesShipping: true, includesDelivery: true }
    },
    {
        id: 'SO-002',
        client: 'Distribuidora Suárez',
        status: 'bodega',
        general: {
            guideNumber: 'SO-2024-1024',
            sheetName: 'Ticket-002',
            destination: 'Querétaro',
            deliveryMethod: 'LTL',
            unit: 'FLETES EM-3',
            reception: 'Monterrey',
            delivery: 'Qro Store',
        },
        assignedUnit: {
            id: 'FLETES EM-3',
            plates: '73BF7G / 61UL9T (ECO 2)',
            brand: 'VOLVO / GRAND DANES',
            color: 'BLANCO',
            type: 'CONGELADO'
        },
        assignedDriver: {
            name: 'JUAN CARLOS VERGARA VAZQUEZ',
            phone: '55 1824 9532',
            license: 'N/A'
        },
        physicalReception: { weight: 3500, volume: 12, pieces: 40, unitMeasure: 'Cajas' },
        physicalDelivery: { weight: 3500, volume: 12, pieces: 40, unitMeasure: 'Cajas' },
        physicalFinal: { weight: 3500, volume: 12, pieces: 40, unitMeasure: 'Cajas' },
        merchandise: { product: 'Muebles Oficina', isRefrigerated: false, receptionConservation: 'Buena', type: 'General' },
        documentation: { receptionDate: '24 abr 2024', insurance: 'Básica', clientInvoice: 'F-221', invoiceValue: 45000, shippingMethod: 'Terrestre', paymentMethod: 'Contado', requiresInvoice: true },
        logistics: { palletWeight: 15, palletCount: 5 },
        workflow: { includesPickup: false, includesShipping: true, includesDelivery: false }
    },
    {
        id: 'SO-003',
        client: 'Industria Santa Fe',
        status: 'confirmada',
        general: {
            guideNumber: 'SO-2024-1025',
            sheetName: 'Ticket-003',
            destination: 'Cancún',
            deliveryMethod: 'FTL',
            unit: 'ECO 1',
            reception: 'Guadalajara',
            delivery: 'Cancún Centro',
        },
        assignedUnit: {
            id: 'FLETES EM 3 / ECO 1',
            plates: '03AJ6J / 70UG2G',
            brand: 'BLANCO / HUNDAY',
            color: 'GRIS',
            type: 'REFRIGERADO'
        },
        assignedDriver: {
            name: 'JOSE ADRIAN GONZAGA RANGEL',
            phone: '5536982583',
            license: 'DF001109655'
        },
        physicalReception: { weight: 8200, volume: 22, pieces: 80, unitMeasure: 'Pallets' },
        physicalDelivery: { weight: 8200, volume: 22, pieces: 80, unitMeasure: 'Pallets' },
        physicalFinal: { weight: 8200, volume: 22, pieces: 80, unitMeasure: 'Pallets' },
        merchandise: { product: 'Electrónicos', isRefrigerated: true, receptionConservation: 'Excelente', type: 'Alto Valor' },
        documentation: { receptionDate: '25 abr 2024', insurance: 'Plus', clientInvoice: 'F-334', invoiceValue: 550000, shippingMethod: 'Terrestre', paymentMethod: 'Transferencia', requiresInvoice: true },
        logistics: { palletWeight: 18, palletCount: 10 },
        workflow: { includesPickup: true, includesShipping: true, includesDelivery: true }
    }
];

export const FLEET_DATA: FleetUnit[] = [
    {
        id: 'PERMON 117 / 193',
        status: 'In Transit',
        type: 'Refrigerado',
        brand: 'VOLCO / UTILITY',
        plates: '13BE3G / 59UV6L',
        color: 'BLANCO',
        driver: { name: 'ERICK ALAN SANTYIESTEBAN OROZCO', phone: '427 107 2268', license: '00041834', rfc: 'SAOE970311JZ5' },
        loc: 'Mérida Highway',
        colorCode: 'emerald'
    },
    {
        id: 'FLETES EM-3',
        status: 'Loading',
        type: 'Congelado',
        brand: 'VOLCO / GRAND DANES',
        plates: '73BF7G / 61UL9T (ECO 2)',
        color: 'BLANCO',
        driver: { name: 'JUAN CARLOS VERGARA VAZQUEZ', phone: '55 1824 9532' },
        loc: 'CDMX Hub',
        colorCode: 'primary'
    },
    {
        id: 'FLETES EM 3 / ECO 1',
        status: 'In Transit',
        type: 'Refrigerado',
        brand: 'BLANCO / HUNDAY',
        plates: '03AJ6J / 70UG2G',
        color: 'GRIS',
        driver: { name: 'JOSE ADRIAN GONZAGA RANGEL', phone: '5536982583', license: 'DF001109655' },
        loc: 'Bajío Route',
        colorCode: 'blue'
    },
    {
        id: 'PERMON 132 / 184',
        status: 'Maintenance',
        type: 'Congelado',
        brand: 'KENWORTH / WABASH',
        plates: '65BF5G / 78US6V',
        color: 'BLANCO',
        driver: { name: 'FELIPE RUVALCABA TELLEZ', phone: 'N/A' },
        loc: 'Service Yard',
        colorCode: 'amber'
    },
    {
        id: 'ENCARNACION',
        status: 'Idle',
        type: 'Seco',
        brand: 'PROSTAR / WABHAS',
        plates: '41AZ9E / 91TX1F',
        color: 'BLANCO Y ROJO',
        driver: { name: 'GONZALO ENCARNACION VAQUEZ', phone: 'N/A' },
        loc: 'Puebla Yard',
        colorCode: 'slate'
    }
];
