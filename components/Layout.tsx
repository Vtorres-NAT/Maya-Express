
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogisticsAssistant from './LogisticsAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dash Ejecutivo', icon: 'insights' },
    { path: '/ops-hub', label: 'Hub Operativo', icon: 'dashboard' },
    { path: '/tracking', label: 'Rastreo Real-Time', icon: 'location_on' },
    { path: '/orders', label: 'Órdenes de Servicio', icon: 'description' },
    { path: '/billing', label: 'Centro de Facturación', icon: 'receipt_long' },
    { path: '/finance', label: 'Finanzas CXC/CXP', icon: 'account_balance_wallet' },
    { path: '/clients-providers', label: 'Clientes/Proveedores', icon: 'groups' },
    { path: '/data', label: 'Datos Maestros', icon: 'dataset' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-full w-72 bg-brand-navy border-r border-white/10 z-30 hidden lg:block text-white">
        <div className="p-8 border-b border-white/10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold">Logística Integral</span>
            <h1 className="font-black text-2xl leading-none tracking-tight">
              MAYA <span className="text-blue-400">EXPRESS</span>
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Enterprise Suite v3.2</p>
          </div>
        </div>
        <nav className="p-4 mt-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-lg transition-all ${isActive(item.path)
                  ? 'bg-primary/20 text-blue-400 font-bold border-l-4 border-primary'
                  : 'text-slate-300 hover:bg-white/5'
                }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider">Sistema Activo</span>
            </div>
            <p className="text-[9px] text-slate-400">CDMX – Cancún – Mérida Corridor</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-brand-navy uppercase tracking-tight">Maya Operational Dashboard</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-full transition-all relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-brand-navy leading-none">Administrador</p>
                <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tighter tracking-widest">CFO Logística</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                <img alt="User" src="https://picsum.photos/seed/erp/100/100" />
              </div>
            </div>
          </div>
        </header>

        <section className="p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </section>

        <LogisticsAssistant />
      </main>
    </div>
  );
};

export default Layout;
