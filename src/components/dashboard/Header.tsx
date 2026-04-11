import React from 'react';
import { Search, Bell, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageSelector } from '../LanguageSelector';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from '../PWAInstallModal';

interface HeaderProps {
  t: (key: string) => string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  user: any;
  userProfile: any;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  searchTerm,
  setSearchTerm,
  isNotificationsOpen,
  setIsNotificationsOpen,
  user,
  userProfile,
  setActiveTab,
}) => {
  const { isInstallable, installPWA, isIOS, isStandalone, hasPrompt } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleInstallClick = async () => {
    const isInsideIframe = window.self !== window.top;
    
    if (isInsideIframe) {
      window.open(window.location.href, '_blank');
      return;
    }

    if (isIOS) {
      setIsModalOpen(true);
      return;
    }
    
    if (hasPrompt) {
      const success = await installPWA();
      if (!success) setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <header className="h-20 sm:h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t('searchBirds')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 ml-4">
        {!isStandalone && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all group"
          >
            <Download size={16} className="sm:w-4 sm:h-4 w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden min-[450px]:inline">Install App</span>
            <span className="min-[450px]:hidden">Install</span>
          </button>
        )}
        <LanguageSelector />
        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 sm:p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl sm:rounded-2xl relative transition-all"
          >
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
          </button>
          
          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50"
              >
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{t('notifications')}</h4>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Bell size={32} />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{t('noNotifications')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
        <div className="flex items-center gap-3 sm:gap-4 pl-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('settings')}>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">{userProfile?.displayName || user?.displayName || 'User'}</p>
            <p className="text-xs text-slate-500">{t('aviaryAdmin')}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
            <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="Avatar" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
      <PWAInstallModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isIOS={isIOS}
        onInstall={installPWA}
      />
    </header>
  );
};
