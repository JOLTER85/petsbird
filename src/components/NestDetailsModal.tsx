import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { Bird, Nest, Egg } from '../types';
import { cn } from '../lib/utils';
import { INCUBATION_PERIODS } from '../constants';

export const NestDetailsModal = ({ isOpen, onClose, nest, birds, onUpdate }: { 
  isOpen: boolean, 
  onClose: () => void, 
  nest: Nest,
  birds: Bird[],
  onUpdate: (nestId: string, data: Partial<Nest>) => void
}) => {
  const { t } = useLanguage();
  const [newEggDate, setNewEggDate] = useState(new Date().toISOString().split('T')[0]);
  const male = birds.find(b => b.id === nest.maleId);
  const female = birds.find(b => b.id === nest.femaleId);
  const species = male?.species || female?.species || 'Canary';
  const incubationDays = INCUBATION_PERIODS[species] || 14;

  if (!isOpen) return null;

  const handleAddEgg = () => {
    const newEgg: Egg = {
      id: Math.random().toString(36).substr(2, 9),
      layingDate: newEggDate,
      status: 'Laying'
    };
    const updatedEggs = [...(nest.eggs || []), newEgg];
    onUpdate(nest.id, { 
      eggs: updatedEggs,
      eggsCount: updatedEggs.length,
      firstEggDate: nest.firstEggDate || newEgg.layingDate
    });
  };

  const handleUpdateEggDate = (eggId: string, date: string) => {
    const updatedEggs = (nest.eggs || []).map(egg => {
      if (egg.id === eggId) {
        return { ...egg, layingDate: date };
      }
      return egg;
    });
    
    onUpdate(nest.id, { 
      eggs: updatedEggs,
      firstEggDate: updatedEggs.length > 0 ? updatedEggs[0].layingDate : undefined
    });
  };

  const handleUpdateEggStatus = (eggId: string, status: Egg['status']) => {
    const updatedEggs = (nest.eggs || []).map(egg => {
      if (egg.id === eggId) {
        const updatedEgg = { ...egg, status };
        if (status === 'Hatched') {
          updatedEgg.hatchDate = new Date().toISOString().split('T')[0];
        }
        return updatedEgg;
      }
      return egg;
    });
    
    const chicksCount = updatedEggs.filter(e => e.status === 'Hatched').length;
    onUpdate(nest.id, { 
      eggs: updatedEggs,
      chicksCount
    });
  };

  const handleRemoveEgg = (eggId: string) => {
    const updatedEggs = (nest.eggs || []).filter(egg => egg.id !== eggId);
    const chicksCount = updatedEggs.filter(e => e.status === 'Hatched').length;
    onUpdate(nest.id, { 
      eggs: updatedEggs,
      eggsCount: updatedEggs.length,
      chicksCount,
      firstEggDate: updatedEggs.length > 0 ? updatedEggs[0].layingDate : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex-1 mr-4">
            <input 
              type="text"
              className="text-2xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-600 focus:outline-none transition-all w-full"
              value={nest.pairName}
              onChange={(e) => onUpdate(nest.id, { pairName: e.target.value })}
              placeholder={t('pairName')}
            />
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{t(nest.status.toLowerCase())}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 shadow-sm">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Parents Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{t('male')}</p>
              <p className="font-black text-slate-900 text-lg">{male?.ringNumber || t('unknown')}</p>
              <p className="text-xs text-slate-500 font-bold">{male?.mutation || male?.species}</p>
            </div>
            <div className="p-6 bg-pink-50 rounded-3xl border-2 border-pink-100">
              <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-2">{t('female')}</p>
              <p className="font-black text-slate-900 text-lg">{female?.ringNumber || t('unknown')}</p>
              <p className="text-xs text-slate-500 font-bold">{female?.mutation || female?.species}</p>
            </div>
          </div>

          {/* Nest Notes */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">{t('notesLabel')}</label>
            <textarea 
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-bold h-24 resize-none"
              value={nest.notes || ''}
              onChange={(e) => onUpdate(nest.id, { notes: e.target.value })}
              placeholder={t('notesPlaceholder')}
            />
          </div>

          {/* Nest Status Control */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">{t('nestStatus')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Laying', 'Incubating', 'Hatching', 'Fledging'].map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate(nest.id, { status: s as any })}
                  className={cn(
                    "py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                    nest.status === s 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200"
                  )}
                >
                  {t(s.toLowerCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Eggs Management */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h4 className="text-xl font-black text-slate-900 tracking-tight">{t('eggsManagement')}</h4>
              <div className="flex items-center gap-3">
                <input 
                  type="date" 
                  value={newEggDate}
                  onChange={(e) => setNewEggDate(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600 transition-all"
                />
                <button 
                  onClick={handleAddEgg}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  <Plus size={16} />
                  {t('addEgg')}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {(nest.eggs || []).map((egg, index) => {
                const layingDate = parseISO(egg.layingDate);
                const expectedHatchDate = addDays(layingDate, incubationDays);
                const formattedHatchDate = format(expectedHatchDate, 'yyyy-MM-dd');
                const isOverdue = new Date() > expectedHatchDate && egg.status !== 'Hatched' && egg.status !== 'Failed';

                return (
                  <div key={egg.id} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <span className="font-black text-lg">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('layingDate')}</p>
                        <input 
                          type="date" 
                          value={egg.layingDate}
                          onChange={(e) => handleUpdateEggDate(egg.id, e.target.value)}
                          className="font-bold text-slate-900 bg-transparent border-none focus:outline-none p-0"
                        />
                      </div>
                      <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('expectedHatch')}</p>
                        <p className={cn("font-bold", isOverdue ? "text-red-600" : "text-slate-900")}>
                          {formattedHatchDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select 
                        value={egg.status}
                        onChange={(e) => handleUpdateEggStatus(egg.id, e.target.value as any)}
                        className={cn(
                          "px-4 py-2 rounded-xl border-2 font-bold text-xs focus:outline-none transition-all",
                          egg.status === 'Hatched' ? "bg-green-50 border-green-200 text-green-600" :
                          egg.status === 'Failed' ? "bg-red-50 border-red-200 text-red-600" :
                          "bg-white border-slate-200 text-slate-600"
                        )}
                      >
                        <option value="Laying">{t('laying')}</option>
                        <option value="Incubating">{t('incubating')}</option>
                        <option value="Hatched">{t('hatched')}</option>
                        <option value="Failed">{t('failed')}</option>
                      </select>
                      <button 
                        onClick={() => handleRemoveEgg(egg.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
