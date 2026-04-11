import React from 'react';
import { 
  LayoutDashboard, 
  Bird, 
  Users, 
  Heart, 
  Egg as EggIcon, 
  Sparkles, 
  ShoppingBag, 
  BookOpen, 
  Newspaper, 
  Info, 
  Mail, 
  Settings, 
  LogOut,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DashboardTab } from '../../types';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from '../PWAInstallModal';

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold" 
        : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "group-hover:text-primary")} />
    <span className="text-sm">{label}</span>
  </button>
);

interface SidebarProps {
  t: (key: string) => string;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  navigate: (path: string) => void;
  onLogout: () => void;
  userProfile?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  t,
  activeTab,
  setActiveTab,
  navigate,
  onLogout,
  userProfile
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
    <aside className="w-72 bg-sidebar text-white flex flex-col p-6 fixed h-screen z-50 overflow-y-auto custom-scrollbar hidden lg:flex">
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Bird className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold font-display leading-none">PetsBird</h1>
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">.com</span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="mb-10 px-2 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
          {userProfile?.displayName?.[0] || 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{userProfile?.displayName || 'User'}</p>
          <p className="text-[10px] text-slate-500 truncate">{userProfile?.aviaryName || 'Aviary'}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="flex items-center gap-2 px-4 mb-4">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</span>
        </div>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
        <SidebarItem icon={Users} label="My Birds" active={activeTab === "My Birds"} onClick={() => setActiveTab("My Birds")} />
        <SidebarItem icon={Heart} label="Couples" active={activeTab === "Couples"} onClick={() => setActiveTab("Couples")} />
        <SidebarItem icon={EggIcon} label="Eggs" active={activeTab === "Eggs"} onClick={() => setActiveTab("Eggs")} />
        <SidebarItem icon={Sparkles} label="AI Genetics" active={activeTab === "AI Genetics"} onClick={() => setActiveTab("AI Genetics")} />
        <SidebarItem icon={ShoppingBag} label="Marketplace" active={activeTab === "Marketplace"} onClick={() => setActiveTab("Marketplace")} />
        
        {/* Resources Section */}
        <div className="pt-8 pb-4 px-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resources</span>
        </div>
        <SidebarItem icon={BookOpen} label="Advice" active={activeTab === "Advice"} onClick={() => setActiveTab("Advice")} />
        <SidebarItem icon={Newspaper} label="News" active={activeTab === "News"} onClick={() => setActiveTab("News")} />
        <SidebarItem icon={Info} label="About Us" active={activeTab === "About Us"} onClick={() => setActiveTab("About Us")} />
        <SidebarItem icon={Mail} label="Contact Us" active={activeTab === "Contact Us"} onClick={() => setActiveTab("Contact Us")} />
        
        {!isStandalone && (
          <div className="mt-8 px-2">
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all group"
            >
              <Download size={20} className="group-hover:scale-110 transition-transform" />
              <span>Download App</span>
            </button>
          </div>
        )}

        {/* System Section */}
        <div className="pt-8 pb-4 px-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</span>
        </div>
        <SidebarItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
        <SidebarItem icon={LogOut} label="Logout" onClick={onLogout} />
      </nav>

      <PWAInstallModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isIOS={isIOS}
        onInstall={installPWA}
      />
    </aside>
  );
};
