import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Bird, Nest } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

export const AddNestModal = ({ isOpen, onClose, onAdd, birds, nests }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (nest: Omit<Nest, 'id' | 'ownerId'>) => void,
  birds: Bird[],
  nests: Nest[]
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';
  const [maleId, setMaleId] = useState('');
  const [femaleId, setFemaleId] = useState('');
  const [pairName, setPairName] = useState('');

  // Get IDs of birds already in a nest
  const birdsInNests = new Set([
    ...nests.map(n => n.maleId).filter(Boolean),
    ...nests.map(n => n.femaleId).filter(Boolean)
  ]);

  const selectedMale = birds.find(b => b.id === maleId);
  const selectedFemale = birds.find(b => b.id === femaleId);

  const availableMales = birds.filter(b => 
    b.sex === 'Male' && 
    !birdsInNests.has(b.id) && 
    (!selectedFemale || b.species === selectedFemale.species)
  );
  
  const availableFemales = birds.filter(b => 
    b.sex === 'Female' && 
    !birdsInNests.has(b.id) && 
    (!selectedMale || b.species === selectedMale.species)
  );

  useEffect(() => {
    const male = birds.find(b => b.id === maleId);
    const female = birds.find(b => b.id === femaleId);
    if (male && female) {
      setPairName(`${male.ringNumber} x ${female.ringNumber}`);
    } else {
      setPairName('');
    }
  }, [maleId, femaleId, birds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maleId || !femaleId) return;
    
    onAdd({
      maleId,
      femaleId,
      pairName: pairName || `${birds.find(b => b.id === maleId)?.ringNumber} x ${birds.find(b => b.id === femaleId)?.ringNumber}`,
      status: 'Laying',
      eggsCount: 0,
      chicksCount: 0,
      firstEggDate: new Date().toISOString().split('T')[0]
    });
    onClose();
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
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('newNest')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>{t('selectMale')}</label>
            <select 
              required
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-bold"
              value={maleId}
              onChange={(e) => setMaleId(e.target.value)}
            >
              <option value="">{t('chooseMale')}</option>
              {availableMales.map(bird => (
                <option key={bird.id} value={bird.id}>{bird.ringNumber} ({bird.mutation})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>{t('selectFemale')}</label>
            <select 
              required
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-bold"
              value={femaleId}
              onChange={(e) => setFemaleId(e.target.value)}
            >
              <option value="">{t('chooseFemale')}</option>
              {availableFemales.map(bird => (
                <option key={bird.id} value={bird.id}>{bird.ringNumber} ({bird.mutation})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>{t('pairName')}</label>
            <input 
              type="text"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-bold"
              value={pairName}
              onChange={(e) => setPairName(e.target.value)}
              placeholder={t('enterPairName')}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
            <Button variant="primary" className="flex-1 bg-indigo-600" type="submit" disabled={!maleId || !femaleId}>
              {t('createPair')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
