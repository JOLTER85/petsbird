import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Bird } from '../../types';

interface MarketplaceTabProps {
  t: (key: string) => string;
  birds: Bird[];
  navigate: (path: string) => void;
}

export const MarketplaceTab: React.FC<MarketplaceTabProps> = ({
  t,
  birds,
  navigate,
}) => {
  return (
    <motion.div
      key="marketplace"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('proMarketplace')}</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('marketplaceDesc')}</p>
        </div>
        <Button 
          variant="primary" 
          className="gap-2 px-6 sm:px-8 py-2 sm:py-4 text-xs sm:text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 rounded-xl sm:rounded-2xl"
          onClick={() => navigate('/marketplace')}
        >
          <Globe size={24} />
          {t('viewPublicMarketplace')}
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600">
          <ShoppingBag size={48} />
        </div>
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-4">{t('marketplaceActive')}</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-10 text-sm sm:text-base font-medium">
          {t('marketplaceActiveDesc')}
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <div className="bg-slate-50/50 px-8 py-6 rounded-[1.5rem] border border-slate-100/50 min-w-[160px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('activeListings')}</p>
            <p className="text-3xl font-display font-black text-emerald-600">{birds.filter(b => b.isForSale).length}</p>
          </div>
          <div className="bg-slate-50/50 px-8 py-6 rounded-[1.5rem] border border-slate-100/50 min-w-[160px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('marketplaceViews')}</p>
            <p className="text-3xl font-display font-black text-emerald-600">124</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
