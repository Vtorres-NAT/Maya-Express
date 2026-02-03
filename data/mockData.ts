import { ServiceOrder, FleetUnit, Driver, Unit } from '../types';

export const MOCK_ORDERS: ServiceOrder[] = [
    {
        id: 'SO-001',
        client: 'Alimentos del Norte',
        status: 'transito',
        general: {
            guideNumber: 'SO-2024-1023',
            sheetName: 'Ticket-001',
            tripNumber: 'V-8822',
            destination: 'Mérida',
            deliveryMethod: 'FTL',
            origin: 'CDMX Hub',
            receptionDate: '2024-04-24',
            conservationSystem: 'SI',
            shippingUnitRefrigeration: 'SI',
            reception: 'Av. Industrial 123, CDMX',
            delivery: 'Calle 60, Mérida DC',
            clientAddress: 'Calle 60, Mérida DC',
            clientContact: 'Roberto Gomez',
            clientPhone: '999-123-4567',
            providerAddress: 'Av. Industrial 123, CDMX',
            providerContact: 'Carlos Ruiz',
            providerPhone: '555-987-6543',
            observations: 'Prioridad alta',
            estDeparture: '2024-04-24',
            estArrival: '2024-04-26',
            receptionTemp: '-20°C'
        },
        assignedUnit: {
            id: 'PERMON 117 / 193',
            plates: '13BE3G / 59UV6L',
            brand: 'VOLVO / UTILITY',
            color: 'BLANCO',
            type: 'REFRIGERADO MERIDA'
        },
        assignedDriver: {
            id: 'D-001',
            name: 'ERICK ALAN SANTYIESTEBAN OROZCO',
            phone: '427 107 2268',
            license: '00041834',
            rfc: 'SAOE970311JZ5'
        },
        products: [
            {
                name: 'Lácteos Congelados',
                temperature: 'CONGELADO',
                weight: 12500,
                volume: 45,
                pieces: 120,
                unitMeasure: 'Pallets',
                others: 'Manejo delicado'
            }
        ],
        documentation: { insurance: 'Cobertura Amplia', clientInvoice: 'F-9923', invoiceValue: 150000, shippingMethod: 'PAGADO', paymentMethod: 'TRANSFERENCIA', requiresInvoice: true },
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
            tripNumber: 'V-9910',
            destination: 'Querétaro',
            deliveryMethod: 'LTL',
            origin: 'Monterrey',
            receptionDate: '2024-04-24',
            conservationSystem: 'NO',
            shippingUnitRefrigeration: 'NO',
            reception: 'Parque Ind. MTY',
            delivery: 'Qro Store',
            clientAddress: 'Qro Store Base',
            clientContact: 'Maria Lopez',
            clientPhone: '442-987-6543',
            observations: 'Frágil',
            estDeparture: '2024-04-24',
            estArrival: '2024-04-25',
            receptionTemp: 'N/A'
        },
        assignedUnit: {
            id: 'FLETES EM-3',
            plates: '73BF7G / 61UL9T (ECO 2)',
            brand: 'VOLVO / GRAND DANES',
            color: 'BLANCO',
            type: 'CONGELADO'
        },
        assignedDriver: {
            id: 'D-002',
            name: 'JUAN CARLOS VERGARA VAZQUEZ',
            phone: '55 1824 9532',
            license: 'N/A'
        },
        products: [
            {
                name: 'Muebles Oficina',
                temperature: 'SECO',
                weight: 3500,
                volume: 12,
                pieces: 40,
                unitMeasure: 'Cajas'
            }
        ],
        documentation: { insurance: 'Básica', clientInvoice: 'F-221', invoiceValue: 45000, shippingMethod: 'POR COBRAR', paymentMethod: 'EFECTIVO', requiresInvoice: true },
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
            tripNumber: 'V-4431',
            destination: 'Cancún',
            deliveryMethod: 'FTL',
            origin: 'Guadalajara',
            receptionDate: '2024-04-25',
            conservationSystem: 'SI',
            shippingUnitRefrigeration: 'SI',
            reception: 'GDL Hub',
            delivery: 'Cancún Centro',
            clientAddress: 'Cancún Centro',
            clientContact: 'Pedro Martinez',
            clientPhone: '998-555-0101',
            observations: 'Cuidado con humedad',
            estDeparture: '2024-04-25',
            estArrival: '2024-04-28',
            receptionTemp: '2°C'
        },
        assignedUnit: {
            id: 'FLETES EM 3 / ECO 1',
            plates: '03AJ6J / 70UG2G',
            brand: 'BLANCO / HUNDAY',
            color: 'GRIS',
            type: 'REFRIGERADO'
        },
        assignedDriver: {
            id: 'D-003',
            name: 'JOSE ADRIAN GONZAGA RANGEL',
            phone: '5536982583',
            license: 'DF001109655'
        },
        products: [
            {
                name: 'Electrónicos',
                temperature: 'REFRIGERADO',
                weight: 8200,
                volume: 22,
                pieces: 80,
                unitMeasure: 'Pallets'
            }
        ],
        documentation: { insurance: 'Plus', clientInvoice: 'F-334', invoiceValue: 550000, shippingMethod: 'PAGADO', paymentMethod: 'TRANSFERENCIA', requiresInvoice: true },
        logistics: { palletWeight: 18, palletCount: 10 },
        workflow: { includesPickup: true, includesShipping: true, includesDelivery: true }
    }
];

// Derived from previous FLEET_DATA, now separated
export const MOCK_DRIVERS: Driver[] = [
    {
        id: 'D-001',
        name: 'ERICK ALAN SANTYIESTEBAN OROZCO',
        phone: '427 107 2268',
        license: '00041834',
        rfc: 'SAOE970311JZ5',
        status: 'Active',
        photourl: ''
    },
    {
        id: 'D-002',
        name: 'JUAN CARLOS VERGARA VAZQUEZ',
        phone: '55 1824 9532',
        status: 'Active'
    },
    {
        id: 'D-003',
        name: 'JOSE ADRIAN GONZAGA RANGEL',
        phone: '5536982583',
        license: 'DF001109655',
        status: 'Active'
    },
    {
        id: 'D-004',
        name: 'FELIPE RUVALCABA TELLEZ',
        phone: 'N/A',
        status: 'On Leave'
    },
    {
        id: 'D-005',
        name: 'GONZALO ENCARNACION VAQUEZ',
        phone: 'N/A',
        status: 'Inactive'
    }
];

export const MOCK_UNITS: Unit[] = [
    {
        id: 'PERMON 117 / 193',
        status: 'In Transit',
        type: 'Refrigerado',
        brand: 'VOLCO / UTILITY',
        plates: '13BE3G / 59UV6L',
        color: 'BLANCO',
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
        loc: 'Puebla Yard',
        colorCode: 'slate'
    }
];

// Combine for backward compatibility if needed, or we can just use the new arrays.
// For now, let's keep valid FleetUnit objects by mapping.
export const FLEET_DATA: FleetUnit[] = MOCK_UNITS.map((u, i) => ({
    ...u,
    driver: MOCK_DRIVERS[i] || MOCK_DRIVERS[0] // fallback
})) as unknown as FleetUnit[];
