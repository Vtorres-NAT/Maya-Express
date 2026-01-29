import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client, Provider } from '../types';

// Mock Data (Moved from ClientsProviders)
const MOCK_CLIENTS: Client[] = [
    { id: 1, client: "Supermercados Del Caribe", deliveryAddress: "Av. Tulum 505, Cancún", contactName: "Maria Garcia", phone: "998-555-0123", destination: "Cancún Centro", deliveryMethod: "DOMICILIO", insurance: "SI" },
    { id: 2, client: "Hoteles Riviera Maya", deliveryAddress: "Carr. Federal 307 km 50", contactName: "Juan Rodriguez", phone: "984-555-0987", destination: "Playa del Carmen", deliveryMethod: "OCURRE", insurance: "NO" },
];

const MOCK_PROVIDERS: Provider[] = [
    {
        id: 1,
        provider: "AgroFresco Yucatán",
        address: "Carr. Mérida-Uman km 15",
        contactName: "Pedro Sanchez",
        phone: "999-123-4567",
        products: [
            { name: "Frutas Tropicales", temperature: "REFRIGERADO" },
            { name: "Verduras", temperature: "REFRIGERADO" }
        ]
    },
    {
        id: 2,
        provider: "Carnicos del Sureste",
        address: "Parque Industrial Tizimín",
        contactName: "Luis Torres",
        phone: "986-987-6543",
        products: [
            { name: "Carne de Res", temperature: "CONGELADO" }
        ]
    },
];

interface DataContextType {
    clients: Client[];
    providers: Provider[];
    addClient: (client: Omit<Client, 'id'>) => void;
    updateClient: (id: number, client: Omit<Client, 'id'>) => void;
    deleteClient: (id: number) => void;
    addProvider: (provider: Omit<Provider, 'id'>) => void;
    updateProvider: (id: number, provider: Omit<Provider, 'id'>) => void;
    deleteProvider: (id: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);

    const addClient = (clientData: Omit<Client, 'id'>) => {
        const newId = Math.max(...clients.map(c => c.id), 0) + 1;
        setClients([...clients, { id: newId, ...clientData }]);
    };

    const updateClient = (id: number, clientData: Omit<Client, 'id'>) => {
        setClients(clients.map(c => c.id === id ? { ...c, ...clientData, id } : c));
    };

    const deleteClient = (id: number) => {
        setClients(clients.filter(c => c.id !== id));
    };

    const addProvider = (providerData: Omit<Provider, 'id'>) => {
        const newId = Math.max(...providers.map(p => p.id), 0) + 1;
        setProviders([...providers, { id: newId, ...providerData }]);
    };

    const updateProvider = (id: number, providerData: Omit<Provider, 'id'>) => {
        setProviders(providers.map(p => p.id === id ? { ...p, ...providerData, id } : p));
    };

    const deleteProvider = (id: number) => {
        setProviders(providers.filter(p => p.id !== id));
    };

    return (
        <DataContext.Provider value={{
            clients,
            providers,
            addClient,
            updateClient,
            deleteClient,
            addProvider,
            updateProvider,
            deleteProvider
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
