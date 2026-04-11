import React from 'react';
import { motion } from 'motion/react';
import { EggIcon, Clock, ChevronRight } from 'lucide-react';
import { Nest, Bird } from '../../types';
import { cn } from '../../lib/utils';
import { format, addDays, parseISO } from 'date-fns';
import { INCUBATION_PERIODS } from '../../constants';

interface HatchingTabProps {
  t: (key: string) => string;
  nests: Nest[];
  birds: Bird[];
}

export const HatchingTab: React.FC<HatchingTabProps> = ({
  t,
  nests,
  birds,
}) => {
  const activeNests = nests.filter(n => (n.eggs && n.eggs.length > 0) || n.status === 'Incubating' || n.status === 'Laying');

  return (
    <motion.div
      key="hatching"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('hatchingCalendar')}</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('hatchingCalendarDesc')}</p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {activeNests.map((nest) => {
          const female = birds.find(b => b.id === nest.femaleId);
          const species = female?.species || 'Canary';
          const period = INCUBATION_PERIODS[species] || 18;

          return (
            <motion.div 
              key={nest.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <EggIcon size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900">{nest.pairName}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{t(species.toLowerCase())}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100">
                    {t(nest.status.toLowerCase())}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(nest.eggs || []).map((egg, idx) => {
                  const layingDate = parseISO(egg.layingDate);
                  const expectedHatch = addDays(layingDate, period);
                  const isHatched = egg.status === 'Hatched';
                  const isFailed = egg.status === 'Failed';
                  
                  return (
                    <div key={egg.id} className={cn(
                      "p-5 rounded-2xl border flex items-center justify-between transition-all",
                      isHatched ? "bg-emerald-50/50 border-emerald-100" : 
                      isFailed ? "bg-red-50/50 border-red-100" : "bg-slate-50/50 border-slate-100"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xs font-black text-slate-400 shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('expected')}</p>
                          <p className="text-sm font-bold text-slate-900">{format(expectedHatch, 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('status')}</p>
                        <p className={cn(
                          "text-xs font-black uppercase tracking-wider",
                          isHatched ? "text-emerald-600" : isFailed ? "text-red-600" : "text-blue-600"
                        )}>{t(egg.status.toLowerCase())}</p>
                      </div>
                    </div>
                  );
                })}
                {(nest.eggs || []).length === 0 && (
                  <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm font-medium">{t('noEggsAdded')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {activeNests.length === 0 && (
          <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Clock size={40} />
            </div>
            <p className="text-slate-500 font-bold text-lg">{t('noActiveNests') || 'No active nests for hatching'}</p>
            <p className="text-slate-400 text-sm mt-2">{t('hatchingCalendarDesc')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
