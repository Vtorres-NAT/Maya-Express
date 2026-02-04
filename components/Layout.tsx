import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: 'insights' },
    { path: '/ops-hub', label: t('nav.ops_hub'), icon: 'dashboard' },
    { path: '/tracking', label: t('nav.tracking'), icon: 'location_on' },
    { path: '/orders', label: t('nav.orders'), icon: 'description' },
    { path: '/billing', label: t('nav.billing'), icon: 'receipt_long' },
    { path: '/finance', label: t('nav.finance'), icon: 'account_balance_wallet' },
    { path: '/clients-providers', label: t('nav.clients'), icon: 'groups' },
    { path: '/data', label: t('nav.data'), icon: 'dataset' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 h-full bg-brand-navy border-r border-white/10 z-30 hidden lg:block text-white transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-24' : 'w-72'}`}>
        <div className={`flex flex-col h-full bg-brand-navy`}>
          {/* Logo Section */}
          <div className="p-6 h-20 flex items-center border-b border-white/5">
            {!isCollapsed ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-[0.4em] text-blue-400 font-black opacity-80">CONSOLIDADOS</span>
                <h1 className="font-black text-xl leading-none tracking-tight">
                  MAYA <span className="text-blue-400">EXPRESS</span>
                </h1>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <span className="text-blue-400 font-black text-xl tracking-tighter">CME</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : ''}
                  className={`
                    flex items-center gap-4 rounded-xl transition-all duration-200 group
                    ${isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'px-4 py-3'}
                    ${active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <span className={`material-symbols-outlined transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Toggle - Repositioned and Animated */}
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-50">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-500 transition-all border-2 border-brand-navy animate-breathe"
            >
              <span className="material-symbols-outlined text-base font-black">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="flex-shrink-0 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${language === 'es' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ESP
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ENG
              </button>
            </div>
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
                <p className="text-sm font-bold text-brand-navy leading-none">{profile?.fullName || t('common.user')}</p>
                <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-widest">{profile?.role || t('common.guest')}</p>
              </div>
              <div className="relative group">
                <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 overflow-hidden cursor-pointer">
                  <img alt="User" src={profile?.avatarUrl || "https://picsum.photos/seed/erp/100/100"} />
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={async () => {
                      try {
                        await signOut();
                      } catch (err) {
                        console.error('Logout failed:', err);
                      }
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-all font-bold"
                  >
                    <span className="material-symbols-outlined text-lg font-bold">logout</span>
                    {t('nav.sign_out')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 p-8 lg:p-10 max-w-[1600px] mx-auto w-full min-w-0 overflow-y-auto custom-scrollbar flex flex-col">
          {children}
        </section>
      </main>
    </div>
  );
};

export default Layout;
