import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Client, Provider, ProductItem } from '../types';

const ClientsProviders: React.FC = () => {
    const {
        clients,
        providers,
        addClient,
        updateClient,
        deleteClient,
        addProvider,
        updateProvider,
        deleteProvider
    } = useData();

    const [activeTab, setActiveTab] = useState<'clients' | 'providers'>('clients');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const initialClientState: Omit<Client, 'id'> = {
        client: '', deliveryAddress: '', contactName: '', phone: '', destination: '', deliveryMethod: '', insurance: '', pickupRequired: ''
    };

    const initialProviderState: Omit<Provider, 'id'> = {
        provider: '', address: '', contactName: '', phone: '', products: []
    };

    const [formDataClient, setFormDataClient] = useState<Omit<Client, 'id'>>(initialClientState);
    const [formDataProvider, setFormDataProvider] = useState<Omit<Provider, 'id'>>(initialProviderState);

    // Temporary state for adding a new product line inside the form
    const [newProduct, setNewProduct] = useState<ProductItem>({ name: '', temperature: '' });

    // Handlers
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormDataClient(initialClientState);
        setFormDataProvider(initialProviderState);
        setNewProduct({ name: '', temperature: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: Client | Provider, type: 'clients' | 'providers') => {
        setEditingId(item.id);
        if (type === 'clients') {
            const client = item as Client;
            setFormDataClient({
                client: client.client,
                deliveryAddress: client.deliveryAddress,
                contactName: client.contactName,
                phone: client.phone,
                destination: client.destination,
                deliveryMethod: client.deliveryMethod,
                insurance: client.insurance,
                pickupRequired: client.pickupRequired || '',
                email: client.email || ''
            });
        } else {
            const provider = item as Provider;
            setFormDataProvider({
                provider: provider.provider,
                address: provider.address,
                contactName: provider.contactName,
                phone: provider.phone,
                products: provider.products
            });
            setNewProduct({ name: '', temperature: '' });
        }
        setIsModalOpen(true);
    };

    const handleDeleteClientAction = (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
            deleteClient(id);
        }
    };

    const handleDeleteProviderAction = (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
            deleteProvider(id);
        }
    };

    const handleAddProduct = () => {
        if (newProduct.name && newProduct.temperature) {
            setFormDataProvider({
                ...formDataProvider,
                products: [...formDataProvider.products, newProduct]
            });
            setNewProduct({ name: '', temperature: '' });
        }
    };

    const handleRemoveProduct = (index: number) => {
        const updatedProducts = [...formDataProvider.products];
        updatedProducts.splice(index, 1);
        setFormDataProvider({
            ...formDataProvider,
            products: updatedProducts
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'clients') {
            if (editingId) {
                updateClient(editingId, formDataClient);
            } else {
                addClient(formDataClient);
            }
        } else {
            if (editingId) {
                updateProvider(editingId, formDataProvider);
            } else {
                addProvider(formDataProvider);
            }
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in-up relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-brand-navy tracking-tight">Directorio Comercial</h1>
                    <p className="text-slate-500 mt-1">Gestión centralizada de Clientes y Proveedores</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'clients'
                            ? 'bg-brand-navy text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        Clientes
                    </button>
                    <button
                        onClick={() => setActiveTab('providers')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'providers'
                            ? 'bg-brand-navy text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        Proveedores
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder={`Buscar ${activeTab === 'clients' ? 'Cliente' : 'Proveedor'}...`}
                            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Nuevo {activeTab === 'clients' ? 'Cliente' : 'Proveedor'}
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                <th className="p-4 w-16 text-center">#</th>
                                <th className="p-4">{activeTab === 'clients' ? 'Cliente' : 'Proveedor'}</th>
                                <th className="p-4">{activeTab === 'clients' ? 'Dir. Entrega' : 'Dirección'}</th>
                                <th className="p-4">Contacto</th>
                                <th className="p-4">{activeTab === 'clients' ? 'Detalles Logísticos' : 'Productos / Temperaturas'}</th>
                                <th className="p-4 w-24 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm md:text-base">
                            {activeTab === 'clients' ? (
                                clients.filter(c => c.client.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 text-center font-mono text-slate-400">#{item.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-brand-navy">{item.client}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{item.email || 'No email registered'}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 max-w-xs truncate" title={item.deliveryAddress}>
                                            {item.deliveryAddress}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {item.contactName.charAt(0)}
                                                </div>
                                                <span className="text-slate-700 font-medium">{item.contactName}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 ml-8 mt-0.5">{item.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">{item.destination}</span>
                                                <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">{item.deliveryMethod}</span>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.insurance === 'SI' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    Seguro: {item.insurance}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.pickupRequired === 'SI' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    Recolección: {item.pickupRequired || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenEdit(item, 'clients')}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                    onClick={() => handleDeleteClientAction(item.id)}
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                providers.filter(p => p.provider.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 text-center font-mono text-slate-400">#{item.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-brand-navy">{item.provider}</div>
                                        </td>
                                        <td className="p-4 text-slate-600">{item.address}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                                                    {item.contactName.charAt(0)}
                                                </div>
                                                <span className="text-slate-700 font-medium">{item.contactName}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 ml-8 mt-0.5">{item.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5">
                                                {item.products.map((prod, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        <span className="text-slate-700 font-medium">{prod.name}</span>
                                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${prod.temperature === 'CONGELADO' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                                                            prod.temperature === 'REFRIGERADO' ? 'border-cyan-200 bg-cyan-50 text-cyan-600' :
                                                                'border-orange-200 bg-orange-50 text-orange-600'
                                                            }`}>
                                                            {prod.temperature}
                                                        </span>
                                                    </div>
                                                ))}
                                                {item.products.length === 0 && <span className="text-slate-400 text-xs italic">Sin productos asignados</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenEdit(item, 'providers')}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                    onClick={() => handleDeleteProviderAction(item.id)}
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {((activeTab === 'clients' && clients.length === 0) || (activeTab === 'providers' && providers.length === 0)) && (
                        <div className="p-10 text-center text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_off</span>
                            <p>No hay registros encontrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-black text-brand-navy">
                                {editingId ? 'Editar' : 'Nuevo'} {activeTab === 'clients' ? 'Cliente' : 'Proveedor'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                                type="button"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {activeTab === 'clients' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataClient.client}
                                                onChange={(e) => setFormDataClient({ ...formDataClient, client: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataClient.phone}
                                                onChange={(e) => setFormDataClient({ ...formDataClient, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Dirección Entrega</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            value={formDataClient.deliveryAddress}
                                            onChange={(e) => setFormDataClient({ ...formDataClient, deliveryAddress: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Contacto</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataClient.contactName}
                                                onChange={(e) => setFormDataClient({ ...formDataClient, contactName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Destino</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataClient.destination}
                                                onChange={(e) => setFormDataClient({ ...formDataClient, destination: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Forma de Entrega</label>
                                            <select
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataClient.deliveryMethod}
                                                onChange={(e) => setFormDataClient({ ...formDataClient, deliveryMethod: e.target.value })}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="OCURRE">OCURRE</option>
                                                <option value="DOMICILIO">DOMICILIO</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Seguro</label>
                                            <select
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataClient.insurance}
                                                onChange={(e) => setFormDataClient({ ...formDataClient, insurance: e.target.value })}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="SI">SI</option>
                                                <option value="NO">NO</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Recolección</label>
                                            <select
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataClient.pickupRequired || ''}
                                                onChange={(e) => setFormDataClient({ ...formDataClient, pickupRequired: e.target.value })}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="SI">SI</option>
                                                <option value="NO">NO</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Proveedor</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataProvider.provider}
                                                onChange={(e) => setFormDataProvider({ ...formDataProvider, provider: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={formDataProvider.phone}
                                                onChange={(e) => setFormDataProvider({ ...formDataProvider, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            value={formDataProvider.address}
                                            onChange={(e) => setFormDataProvider({ ...formDataProvider, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Contacto</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            value={formDataProvider.contactName}
                                            onChange={(e) => setFormDataProvider({ ...formDataProvider, contactName: e.target.value })}
                                        />
                                    </div>

                                    <div className="border-t border-slate-100 pt-4 mt-2">
                                        <label className="text-xs font-bold text-brand-navy uppercase block mb-3">Productos y Temperaturas</label>

                                        {/* List of added products */}
                                        <div className="space-y-2 mb-4">
                                            {formDataProvider.products.map((prod, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-slate-700 text-sm">{prod.name}</span>
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${prod.temperature === 'CONGELADO' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                                                            prod.temperature === 'REFRIGERADO' ? 'border-cyan-200 bg-cyan-50 text-cyan-600' :
                                                                'border-orange-200 bg-orange-50 text-orange-600'
                                                            }`}>
                                                            {prod.temperature}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveProduct(idx)}
                                                        className="text-slate-400 hover:text-red-500 p-1"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">cancel</span>
                                                    </button>
                                                </div>
                                            ))}
                                            {formDataProvider.products.length === 0 && (
                                                <p className="text-xs text-slate-400 italic">No hay productos agregados</p>
                                            )}
                                        </div>

                                        {/* Add new product inputs */}
                                        <div className="flex flex-col sm:flex-row gap-2 items-end bg-slate-50/50 p-2 rounded-xl">
                                            <div className="flex-1 space-y-1 w-full">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre Producto</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    value={newProduct.name}
                                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                    placeholder="Ej: Carne de Res"
                                                />
                                            </div>
                                            <div className="w-full sm:w-40 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Temp.</label>
                                                <select
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    value={newProduct.temperature}
                                                    onChange={(e) => setNewProduct({ ...newProduct, temperature: e.target.value })}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="CONGELADO">CONGELADO</option>
                                                    <option value="SECO">SECO</option>
                                                    <option value="REFRIGERADO">REFRIGERADO</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddProduct}
                                                disabled={!newProduct.name || !newProduct.temperature}
                                                className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-navy text-white hover:bg-brand-navy/90 shadow-lg shadow-blue-900/20 transition-all"
                                >
                                    {editingId ? 'Guardar Cambios' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsProviders;
