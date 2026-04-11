import React from 'react';
import { motion } from 'motion/react';
import { Search, Plus, ArrowUpRight, Users, Heart, Info, ChevronRight } from 'lucide-react';
import { Bird } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SPECIES_IMAGES } from '../constants';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

export const BirdList = ({ 
  birds, 
  onBirdClick, 
  onAddClick,
  searchQuery,
  setSearchQuery
}: { 
  birds: Bird[], 
  onBirdClick: (id: string) => void,
  onAddClick: () => void,
  searchQuery: string,
  setSearchQuery: (query: string) => void
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';

  const filteredBirds = birds.filter(bird => 
    bird.ringNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bird.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bird.mutation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 rounded-[3rem] p-6 sm:p-10 shadow-sm min-h-[600px]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{t('yourBirds')}</h2>
          <p className="text-slate-500 mt-1">{t('manageBirdsDesc')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 sm:flex-none sm:min-w-[300px]">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 text-slate-400",
              isRTL ? "right-4" : "left-4"
            )} size={20} />
            <input 
              type="text" 
              placeholder={t('searchBirds')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700",
                isRTL ? "pr-12 pl-6" : "pl-12 pr-6"
              )}
            />
          </div>
          <Button variant="primary" onClick={onAddClick} className="flex items-center gap-2">
            <Plus size={20} />
            <span className="hidden sm:inline">{t('addBird')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBirds.map((bird, i) => (
          <motion.div
            key={bird.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onBirdClick(bird.id)}
            className="group cursor-pointer bg-slate-50 rounded-[2.5rem] p-6 border-2 border-transparent hover:border-indigo-600 transition-all flex flex-col"
          >
            <div className="relative mb-6">
              <div className="aspect-square rounded-[2rem] overflow-hidden bg-white shadow-inner">
                <img 
                  src={bird.photoURL || SPECIES_IMAGES[bird.species] || `https://images.unsplash.com/photo-1444464666168-49d633b867ad?q=80&w=400`} 
                  alt={t(bird.species.toLowerCase())}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className={cn(
                "absolute top-4 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg",
                isRTL ? "left-4" : "right-4",
                bird.sex === 'Male' ? "bg-blue-600 text-white" : 
                bird.sex === 'Female' ? "bg-pink-600 text-white" : "bg-slate-600 text-white"
              )}>
                {bird.sex === 'Male' ? t('male') : bird.sex === 'Female' ? t('female') : t('unknown')}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className={cn("text-xl font-black text-slate-900 truncate", isRTL ? "pl-2" : "pr-2")}>{bird.name || bird.ringNumber}</h3>
                <ArrowUpRight size={20} className={cn(
                  "text-slate-300 transition-all",
                  isRTL ? "rotate-[-90deg] group-hover:text-indigo-600 group-hover:-translate-x-1 group-hover:-translate-y-1" : "group-hover:text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1"
                )} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{bird.mutation}</p>
              
              <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {t(bird.healthStatus.toLowerCase())}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className={cn("flex", isRTL ? "space-x-reverse -space-x-2" : "-space-x-2")}>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                  <Users size={14} />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                  <Heart size={14} />
                </div>
              </div>
              <div className="flex items-center gap-1 text-indigo-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                {t('viewProfile')}
                <ChevronRight size={14} className={cn(isRTL && "rotate-180")} />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredBirds.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('noBirdsFound')}</h3>
            <p className="text-slate-500">{t('tryDifferentSearch')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
