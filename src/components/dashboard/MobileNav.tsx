import React from 'react';
import { LayoutDashboard, Bird as BirdIcon, Info, Newspaper, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  t: (key: string) => string;
  activeTab: string;
  navigate: (path: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  t,
  activeTab,
  navigate,
}) => {
  const mobileItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: t('home'), action: () => navigate('/dashboard') },
    { id: 'My Birds', icon: BirdIcon, label: t('yourBirds'), action: () => navigate('/dashboard/birds') },
    { id: 'Advice', icon: Info, label: t('advice'), action: () => navigate('/advice') },
    { id: 'News', icon: Newspaper, label: t('news'), action: () => navigate('/news') },
    { id: 'Settings', icon: Settings, label: t('settings'), action: () => navigate('/dashboard/settings') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {mobileItems.map(item => (
        <button
          key={item.id}
          onClick={item.action}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === item.id ? "text-primary" : "text-slate-400"
          )}
        >
          <item.icon size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
