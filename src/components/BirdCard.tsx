import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Bird } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface BirdCardProps {
  bird: Bird;
  onClick: (id: string) => void;
}

export const BirdCard: React.FC<BirdCardProps> = ({ bird, onClick }) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';

  return (
    <motion.div
      whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      onClick={() => onClick(bird.id)}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-all cursor-pointer group border border-slate-100/50"
    >
      <div className="aspect-square relative overflow-hidden bg-slate-50/50">
        <img 
          src={bird.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${bird.id}`} 
          alt={bird.ringNumber}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-4"
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute top-6 flex flex-col gap-2 items-end",
          isRTL ? "left-6" : "right-6"
        )}>
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md",
            bird.sex === 'Male' ? "bg-blue-500/10 text-blue-600 border-blue-200/50" : 
            bird.sex === 'Female' ? "bg-pink-500/10 text-pink-600 border-pink-200/50" : 
            "bg-slate-500/10 text-slate-600 border-slate-200/50"
          )}>
            {bird.sex === 'Male' ? t('male') : bird.sex === 'Female' ? t('female') : t('unknown')}
          </span>
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md",
            bird.availability === 'For Sale' ? "bg-emerald-500/10 text-emerald-600 border-emerald-200/50" : "bg-orange-500/10 text-orange-600 border-orange-200/50"
          )}>
            {bird.availability === 'For Sale' ? t('forSale') : t('bred')}
          </span>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">#{bird.ringNumber.slice(-3)}</span>
          <h4 className="text-lg sm:text-xl font-display font-black text-slate-900 truncate">{bird.name || bird.ringNumber}</h4>
        </div>
        <p className="text-sm text-slate-500 font-medium truncate">{t(bird.species.toLowerCase())} • {bird.mutation}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{bird.origin === 'Bred by me' ? t('bredByMe') : t('purchased')}</p>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
