import React from 'react';
import { motion } from 'motion/react';
import { EggIcon, Plus, Trash2, Bell, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Nest, Bird } from '../../types';
import { cn } from '../../lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { OperationType, handleFirestoreError } from '../../lib/firestoreUtils';

interface NestsTabProps {
  t: (key: string) => string;
  nests: Nest[];
  birds: Bird[];
  setIsAddNestModalOpen: (open: boolean) => void;
  setSelectedNestId: (id: string | null) => void;
  isSupabaseConfigured: boolean;
  supabase: any;
  fetchNests: () => Promise<void>;
}

export const NestsTab: React.FC<NestsTabProps> = ({
  t,
  nests,
  birds,
  setIsAddNestModalOpen,
  setSelectedNestId,
  isSupabaseConfigured,
  supabase,
  fetchNests,
}) => {
  return (
    <motion.div
      key="nests"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('smartBreedingJournal')}</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('breedingJournalDesc')}</p>
        </div>
        <Button 
          variant="primary" 
          className="gap-2 px-6 sm:px-8 py-2 sm:py-4 text-xs sm:text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 rounded-xl sm:rounded-2xl"
          onClick={() => setIsAddNestModalOpen(true)}
        >
          <Plus size={24} />
          {t('newNest')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {nests.map((nest) => {
          const male = birds.find(b => b.id === nest.maleId);
          const female = birds.find(b => b.id === nest.femaleId);
          const alerts = [];
          if (nest.firstEggDate) {
            const firstEgg = parseISO(nest.firstEggDate);
            const today = new Date();
            const daysSince = differenceInDays(today, firstEgg);

            if (daysSince >= 5 && daysSince < 6) alerts.push({ title: t('eggFertilityCheck'), desc: t('eggFertilityDesc'), color: "bg-amber-50 text-amber-600 border-amber-100" });
            if (daysSince >= 13 && daysSince < 15) alerts.push({ title: t('hatchingImminent'), desc: t('hatchingImminentDesc'), color: "bg-red-50 text-red-600 border-red-100" });
            if (daysSince >= 19 && daysSince < 22) alerts.push({ title: t('ringingChicks'), desc: t('ringingChicksDesc'), color: "bg-emerald-50 text-emerald-600 border-emerald-100" });
          }

          return (
            <motion.div 
              key={nest.id} 
              whileHover={{ y: -5 }}
              onClick={() => setSelectedNestId(nest.id)}
              className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-all group cursor-pointer border border-slate-100/50"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <EggIcon size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-tight">{nest.pairName}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{male?.species || female?.species || 'Canary'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    nest.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-100"
                  )}>
                    {t(nest.status.toLowerCase())}
                  </span>
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm(t('confirmDelete'))) return;
                      try {
                        if (isSupabaseConfigured && supabase) {
                          const { error } = await supabase
                            .from('pairs')
                            .delete()
                            .eq('id', isNaN(parseInt(nest.id)) ? nest.id : parseInt(nest.id));
                          if (error) console.error('Supabase Error deleting pair:', error);
                          else await fetchNests();
                        }
                        await deleteDoc(doc(db, 'nests', nest.id));
                      } catch (e) {
                        handleFirestoreError(e, OperationType.DELETE, 'nests');
                      }
                    }}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      nest.eggsCount === 0 && nest.chicksCount === 0 
                        ? "text-red-500 bg-red-50 hover:bg-red-100" 
                        : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                    )}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                {t('firstEgg')}: {nest.firstEggDate || t('notSet')}
              </div>
              
              {alerts.length > 0 && (
                <div className="space-y-3 mb-6">
                  {alerts.map((alert, i) => (
                    <div key={i} className={cn("p-4 rounded-2xl border flex items-center gap-3", alert.color)}>
                      <Bell size={16} className="shrink-0" />
                      <div>
                        <p className="text-xs font-bold">{alert.title}</p>
                        <p className="text-[10px] opacity-80 font-medium">{alert.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50/50 p-4 rounded-2xl text-center border border-slate-100/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('eggs')}</p>
                  <p className="text-xl font-display font-black text-slate-900">{nest.eggsCount}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl text-center border border-slate-100/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('chicks')}</p>
                  <p className="text-xl font-display font-black text-slate-900">{nest.chicksCount}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-emerald-600 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('viewDetails')}</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          );
        })}
        {nests.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <EggIcon size={40} />
            </div>
            <p className="text-slate-500 font-bold text-lg">{t('noNestsFound') || 'No active nests found'}</p>
            <p className="text-slate-400 text-sm mt-2">{t('breedingJournalDesc')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
