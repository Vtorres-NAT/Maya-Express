import { supabase } from './lib/supabase.ts';
import { MOCK_DRIVERS, MOCK_UNITS } from './data/mockData.ts';

// Mock Data from DataContext.tsx
const MOCK_CLIENTS = [
    { name: "Supermercados Del Caribe", delivery_address: "Av. Tulum 505, Cancún", contact_name: "Maria Garcia", phone: "998-555-0123", destination_default: "Cancún Centro", delivery_method_default: "DOMICILIO", insurance_default: "SI" },
    { name: "Hoteles Riviera Maya", delivery_address: "Carr. Federal 307 km 50", contact_name: "Juan Rodriguez", phone: "984-555-0987", destination_default: "Playa del Carmen", delivery_method_default: "OCURRE", insurance_default: "NO" },
];

const MOCK_PROVIDERS = [
    {
        name: "AgroFresco Yucatán",
        address: "Carr. Mérida-Uman km 15",
        contact_name: "Pedro Sanchez",
        phone: "999-123-4567",
        products: [
            { name: "Frutas Tropicales", temperature: "REFRIGERADO" },
            { name: "Verduras", temperature: "REFRIGERADO" }
        ]
    },
    {
        name: "Carnicos del Sureste",
        address: "Parque Industrial Tizimín",
        contact_name: "Luis Torres",
        phone: "986-987-6543",
        products: [
            { name: "Carne de Res", temperature: "CONGELADO" }
        ]
    },
];

async function seed() {
    console.log('🚀 Starting seed...');

    // 1. Clients
    const { error: clientError } = await supabase.from('clients').insert(MOCK_CLIENTS);
    if (clientError) console.error('Error seeding clients:', clientError);
    else console.log('✅ Clients seeded');

    // 2. Providers
    const { error: providerError } = await supabase.from('providers').insert(MOCK_PROVIDERS);
    if (providerError) console.error('Error seeding providers:', providerError);
    else console.log('✅ Providers seeded');

    // 3. Drivers
    const driversToSeed = MOCK_DRIVERS.map(d => ({
        name: d.name,
        phone: d.phone,
        license: d.license,
        rfc: d.rfc,
        status: 'disponible',
        photo_url: d.photourl
    }));
    const { error: driverError } = await supabase.from('drivers').insert(driversToSeed);
    if (driverError) console.error('Error seeding drivers:', driverError);
    else console.log('✅ Drivers seeded');

    // 4. Units
    const unitsToSeed = MOCK_UNITS.map(u => ({
        id: u.id,
        plates: u.plates,
        brand: u.brand,
        color: u.color,
        unit_type: u.type,
        status: 'disponible',
        current_location: u.loc,
        color_code: u.colorCode
    }));
    const { error: unitError } = await supabase.from('units').insert(unitsToSeed);
    if (unitError) console.error('Error seeding units:', unitError);
    else console.log('✅ Units seeded');

    console.log('🏁 Seed finished!');
}

seed();
