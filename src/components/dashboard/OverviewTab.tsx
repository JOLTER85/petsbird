import React from 'react';
import { motion } from 'motion/react';
import { Bird, Heart, Egg as EggIcon, Plus } from 'lucide-react';
import { BirdCard } from '../BirdCard';
import { Button } from '../ui/Button';
import { Bird as BirdType, Nest, DashboardTab } from '../../types';
import { cn } from '../../lib/utils';

interface StatCardProps {
  icon: any;
  value: number;
  label: string;
  colorClass: string;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, colorClass, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all cursor-pointer group border border-slate-100/50"
  >
    <div className="order-2 sm:order-1 mt-3 sm:mt-0">
      <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{label}</p>
      <h3 className="text-xl sm:text-3xl font-display font-black text-slate-900">{value}</h3>
    </div>
    <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl order-1 sm:order-2 flex items-center justify-center transition-transform group-hover:scale-110", colorClass)}>
      <Icon size={24} />
    </div>
  </motion.div>
);

interface OverviewTabProps {
  t: (key: string) => string;
  user: any;
  birds: BirdType[];
  nests: Nest[];
  setActiveTab: (tab: DashboardTab) => void;
  navigate: (path: string) => void;
  handleBirdClick: (id: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  t,
  user,
  birds,
  nests,
  setActiveTab,
  navigate,
  handleBirdClick,
}) => {
  const totalEggs = nests.reduce((acc, nest) => acc + (nest.eggsCount || 0), 0);
  const activeNests = nests.filter(n => n.status === 'Laying' || n.status === 'Incubating').length;

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('welcomeBack')}, {user?.displayName?.split(' ')[0] || 'User'}</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('aviaryPerformance')} {birds.length} {t('birdsFound')}.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button 
            variant="primary" 
            className="gap-2 px-6 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 rounded-xl"
            onClick={() => navigate('/dashboard/add-bird')}
          >
            <Plus size={20} />
            {t('addBird')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
        <StatCard 
          icon={Bird} 
          value={birds.length} 
          label="Bird count" 
          colorClass="bg-primary/10 text-primary" 
          onClick={() => setActiveTab("My Birds")}
        />
        <StatCard 
          icon={Heart} 
          value={activeNests} 
          label="Active nests" 
          colorClass="bg-accent-gold/10 text-accent-gold" 
          onClick={() => setActiveTab("Couples")}
        />
        <StatCard 
          icon={EggIcon} 
          value={totalEggs} 
          label="Total Eggs" 
          colorClass="bg-accent-orange/10 text-accent-orange" 
          onClick={() => setActiveTab("Eggs")}
        />
        <StatCard 
          icon={Plus} 
          value={birds.filter(b => b.origin === 'Bred by me').length} 
          label="Bred by me" 
          colorClass="bg-blue-500/10 text-blue-600" 
          onClick={() => setActiveTab("My Birds")}
        />
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold font-display text-slate-800">{t('recentBirds') || 'Recent Birds'}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {birds.slice(-4).map((bird) => (
            <BirdCard key={bird.id} bird={bird} onClick={handleBirdClick} />
          ))}
          {birds.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
              <Bird size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">{t('noBirdsFound')}</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};
