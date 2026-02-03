import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LoadingScreen: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center font-sans relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin shadow-2xl shadow-blue-500/20"></div>
                <div className="text-center">
                    <h2 className="text-white text-[10px] font-black uppercase tracking-[4px] animate-pulse">{t('common.loading')}</h2>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
