import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Provider, Driver, Unit, ServiceOrder, ServiceOrderProduct } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
    clients: Client[];
    providers: Provider[];
    drivers: Driver[];
    units: Unit[];
    orders: ServiceOrder[];
    isLoading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
    addOrder: (order: Partial<ServiceOrder>) => Promise<ServiceOrder | null>;
    updateOrder: (id: string, order: Partial<ServiceOrder>) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;
    addClient: (client: Omit<Client, 'id'>) => Promise<void>;
    updateClient: (id: string, client: Omit<Client, 'id'>) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    addProvider: (provider: Omit<Provider, 'id'>) => Promise<void>;
    updateProvider: (id: string, provider: Omit<Provider, 'id'>) => Promise<void>;
    deleteProvider: (id: string) => Promise<void>;
    addDriver: (driver: Driver) => Promise<void>;
    updateDriver: (id: string, driver: Driver) => Promise<void>;
    deleteDriver: (id: string) => Promise<void>;
    addUnit: (unit: Unit) => Promise<void>;
    updateUnit: (id: string, unit: Unit) => Promise<void>;
    deleteUnit: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mappers
const mapDbToClient = (row: any): Client => ({
    id: row.id,
    client: row.name,
    deliveryAddress: row.delivery_address,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    destination: row.destination_default,
    deliveryMethod: row.delivery_method_default,
    insurance: row.insurance_default,
    pickupRequired: row.pickup_required_default ? 'SI' : 'NO'
});

const mapClientToDb = (client: Partial<Client>) => ({
    name: client.client,
    delivery_address: client.deliveryAddress,
    contact_name: client.contactName,
    phone: client.phone,
    email: client.email,
    destination_default: client.destination,
    delivery_method_default: client.deliveryMethod,
    insurance_default: client.insurance,
    pickup_required_default: client.pickupRequired === 'SI'
});

const mapDbToProvider = (row: any): Provider => ({
    id: row.id,
    provider: row.name,
    address: row.address,
    contactName: row.contact_name,
    phone: row.phone,
    products: row.products || []
});

const mapProviderToDb = (provider: Partial<Provider>) => ({
    name: provider.provider,
    address: provider.address,
    contact_name: provider.contactName,
    phone: provider.phone,
    products: provider.products
});

const mapDbToDriver = (row: any): Driver => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    license: row.license,
    rfc: row.rfc,
    status: row.status,
    photourl: row.photo_url
});

const mapDriverToDb = (driver: Partial<Driver>) => ({
    name: driver.name,
    phone: driver.phone,
    license: driver.license,
    rfc: driver.rfc,
    status: driver.status,
    photo_url: driver.photourl
});

const mapDbToUnit = (row: any): Unit => ({
    id: row.id,
    plates: row.plates,
    brand: row.brand,
    color: row.color,
    type: row.unit_type,
    status: row.status,
    loc: row.current_location,
    colorCode: row.color_code
});

const mapUnitToDb = (unit: Partial<Unit>) => ({
    id: unit.id,
    plates: unit.plates,
    brand: unit.brand,
    color: unit.color,
    unit_type: unit.type,
    status: unit.status,
    current_location: unit.loc,
    color_code: unit.colorCode
});

// Helper to map DB row to ServiceOrder interface
const mapDbToOrder = (row: any, products: any[] = []): ServiceOrder => {
    return {
        id: row.id,
        client: row.client_snapshot?.name || 'Unknown',
        provider: row.provider_snapshot?.name || 'Unknown',
        status: row.status,
        driverId: row.driver_id,
        unitId: row.unit_id,
        assignedUnit: row.units ? mapDbToUnit(row.units) : undefined, // Joined from Supabase
        assignedDriver: row.drivers ? mapDbToDriver(row.drivers) : undefined, // Joined from Supabase
        general: {
            guideNumber: row.guide_number,
            sheetName: row.sheet_name,
            tripNumber: row.trip_number,
            destination: row.destination,
            deliveryMethod: row.delivery_method,
            origin: row.origin,
            receptionDate: row.reception_date,
            conservationSystem: row.conservation_system,
            shippingUnitRefrigeration: row.shipping_unit_refrigeration,
            reception: row.reception,
            delivery: row.delivery,
            secondDelivery: row.second_delivery, // Fixed typo from previous turn
            observations: row.observations,
            estDeparture: row.est_departure,
            estArrival: row.est_arrival,
            receptionTemp: row.reception_temp,
            ...row.client_snapshot,
            ...row.provider_snapshot
        },
        products: products.map(p => ({
            name: p.name,
            temperature: p.temperature,
            weight: p.weight,
            volume: p.volume,
            pieces: p.pieces,
            unitMeasure: p.unit_measure,
            others: p.others
        })),
        documentation: {
            insurance: row.insurance,
            clientInvoice: row.client_invoice,
            invoiceValue: parseFloat(row.invoice_value),
            shippingMethod: row.shipping_method,
            paymentMethod: row.payment_method,
            requiresInvoice: row.requires_invoice
        },
        logistics: {
            palletWeight: parseFloat(row.pallet_weight),
            palletCount: row.pallet_count
        },
        workflow: {
            includesPickup: row.includes_pickup,
            includesShipping: row.includes_shipping,
            includesDelivery: row.includes_delivery
        },
        attachments: row.attachments?.map((a: any) => a.file_url) || []
    };
};

// Helper to map ServiceOrder interface to DB row
const mapOrderToDb = (order: Partial<ServiceOrder>) => {
    const dbRow: any = {};
    if (order.status) dbRow.status = order.status;
    if (order.driverId) dbRow.driver_id = order.driverId;
    if (order.unitId) dbRow.unit_id = order.unitId;

    if (order.general) {
        dbRow.guide_number = order.general.guideNumber;
        dbRow.sheet_name = order.general.sheetName;
        dbRow.trip_number = order.general.tripNumber;
        dbRow.destination = order.general.destination;
        dbRow.delivery_method = order.general.deliveryMethod;
        dbRow.origin = order.general.origin;
        dbRow.reception_date = order.general.receptionDate;
        dbRow.conservation_system = order.general.conservationSystem;
        dbRow.shipping_unit_refrigeration = order.general.shippingUnitRefrigeration;
        dbRow.reception = order.general.reception;
        dbRow.delivery = order.general.delivery;
        dbRow.second_delivery = order.general.secondDelivery;
        dbRow.observations = order.general.observations;
        dbRow.est_departure = order.general.estDeparture;
        dbRow.est_arrival = order.general.estArrival;
        dbRow.reception_temp = order.general.receptionTemp;

        // Snapshots
        dbRow.client_snapshot = {
            name: order.client,
            address: order.general.clientAddress,
            contact: order.general.clientContact,
            phone: order.general.clientPhone
        };
        dbRow.provider_snapshot = {
            name: order.provider,
            address: order.general.providerAddress,
            contact: order.general.providerContact,
            phone: order.general.providerPhone
        };
    }

    if (order.documentation) {
        dbRow.insurance = order.documentation.insurance;
        dbRow.client_invoice = order.documentation.clientInvoice;
        dbRow.invoice_value = order.documentation.invoiceValue;
        dbRow.shipping_method = order.documentation.shippingMethod;
        dbRow.payment_method = order.documentation.paymentMethod;
        dbRow.requires_invoice = order.documentation.requiresInvoice;
    }

    if (order.logistics) {
        dbRow.pallet_weight = order.logistics.palletWeight;
        dbRow.pallet_count = order.logistics.palletCount;
    }

    if (order.workflow) {
        dbRow.includes_pickup = order.workflow.includesPickup;
        dbRow.includes_shipping = order.workflow.includesShipping;
        dbRow.includes_delivery = order.workflow.includesDelivery;
    }

    return dbRow;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshData = async () => {
        try {
            setIsLoading(true);
            const [
                { data: clientsData, error: clientsError },
                { data: providersData, error: providersError },
                { data: driversData, error: driversError },
                { data: unitsData, error: unitsError },
                { data: ordersData, error: ordersError }
            ] = await Promise.all([
                supabase.from('clients').select('*').order('name'),
                supabase.from('providers').select('*').order('name'),
                supabase.from('drivers').select('*').order('name'),
                supabase.from('units').select('*').order('id'),
                supabase.from('service_orders').select(`
                    *,
                    units (*),
                    drivers (*),
                    service_order_products (*),
                    service_order_attachments (*)
                `).order('created_at', { ascending: false })
            ]);

            if (clientsError) throw clientsError;
            if (providersError) throw providersError;
            if (driversError) throw driversError;
            if (unitsError) throw unitsError;
            if (ordersError) throw ordersError;

            setClients((clientsData || []).map(mapDbToClient));
            setProviders((providersData || []).map(mapDbToProvider));
            setDrivers((driversData || []).map(mapDbToDriver));
            setUnits((unitsData || []).map(mapDbToUnit));

            if (ordersData) {
                const mappedOrders = ordersData.map(o => mapDbToOrder(o, o.service_order_products));
                setOrders(mappedOrders);
            }
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const addOrder = async (order: Partial<ServiceOrder>): Promise<ServiceOrder | null> => {
        try {
            const dbRow = mapOrderToDb(order);
            const { data: orderData, error: orderError } = await supabase
                .from('service_orders')
                .insert([dbRow])
                .select(`
                    *,
                    units (*),
                    drivers (*),
                    service_order_products (*),
                    service_order_attachments (*)
                `)
                .single();

            if (orderError) throw orderError;

            // Insert products
            if (order.products && order.products.length > 0) {
                const productsRow = order.products.map(p => ({
                    order_id: orderData.id,
                    name: p.name,
                    temperature: p.temperature,
                    weight: p.weight,
                    volume: p.volume,
                    pieces: p.pieces,
                    unit_measure: p.unitMeasure,
                    others: p.others
                }));
                const { error: prodError } = await supabase.from('service_order_products').insert(productsRow);
                if (prodError) throw prodError;
            }

            const fullOrder = mapDbToOrder(orderData, order.products || []);
            setOrders([fullOrder, ...orders]);
            return fullOrder;
        } catch (err: any) {
            console.error('Error adding order:', err);
            setError(err.message);
            return null;
        }
    };

    const updateOrder = async (id: string, order: Partial<ServiceOrder>) => {
        try {
            const dbRow = mapOrderToDb(order);
            const { error: orderError } = await supabase.from('service_orders').update(dbRow).eq('id', id);
            if (orderError) throw orderError;
            await refreshData();
        } catch (err: any) {
            console.error('Error updating order:', err);
            setError(err.message);
        }
    };

    const deleteOrder = async (id: string) => {
        try {
            const { error } = await supabase.from('service_orders').delete().eq('id', id);
            if (error) throw error;
            setOrders(orders.filter(o => o.id !== id));
        } catch (err: any) {
            console.error('Error deleting order:', err);
            setError(err.message);
        }
    };

    // --- Master Data CRUD ---
    const addClient = async (client: Omit<Client, 'id'>) => {
        const dbRow = mapClientToDb(client);
        const { error } = await supabase.from('clients').insert([dbRow]);
        if (error) throw error;
        await refreshData();
    };
    const updateClient = async (id: string, client: Omit<Client, 'id'>) => {
        const dbRow = mapClientToDb(client);
        const { error } = await supabase.from('clients').update(dbRow).eq('id', id);
        if (error) throw error;
        await refreshData();
    };
    const deleteClient = async (id: string) => {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const addProvider = async (provider: Omit<Provider, 'id'>) => {
        const dbRow = mapProviderToDb(provider);
        const { error } = await supabase.from('providers').insert([dbRow]);
        if (error) throw error;
        await refreshData();
    };
    const updateProvider = async (id: string, provider: Omit<Provider, 'id'>) => {
        const dbRow = mapProviderToDb(provider);
        const { error } = await supabase.from('providers').update(dbRow).eq('id', id);
        if (error) throw error;
        await refreshData();
    };
    const deleteProvider = async (id: string) => {
        const { error } = await supabase.from('providers').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const addDriver = async (driver: Driver) => {
        const dbRow = mapDriverToDb(driver);
        const { error } = await supabase.from('drivers').insert([dbRow]);
        if (error) throw error;
        await refreshData();
    };
    const updateDriver = async (id: string, driver: Driver) => {
        const dbRow = mapDriverToDb(driver);
        const { error } = await supabase.from('drivers').update(dbRow).eq('id', id);
        if (error) throw error;
        await refreshData();
    };
    const deleteDriver = async (id: string) => {
        const { error } = await supabase.from('drivers').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const addUnit = async (unit: Unit) => {
        const dbRow = mapUnitToDb(unit);
        const { error } = await supabase.from('units').insert([dbRow]);
        if (error) throw error;
        await refreshData();
    };
    const updateUnit = async (id: string, unit: Unit) => {
        const dbRow = mapUnitToDb(unit);
        const { error } = await supabase.from('units').update(dbRow).eq('id', id);
        if (error) throw error;
        await refreshData();
    };
    const deleteUnit = async (id: string) => {
        const { error } = await supabase.from('units').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    return (
        <DataContext.Provider value={{
            clients,
            providers,
            drivers,
            units,
            orders,
            isLoading,
            error,
            refreshData,
            addOrder,
            updateOrder,
            deleteOrder,
            addClient,
            updateClient,
            deleteClient,
            addProvider,
            updateProvider,
            deleteProvider,
            addDriver,
            updateDriver,
            deleteDriver,
            addUnit,
            updateUnit,
            deleteUnit
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
