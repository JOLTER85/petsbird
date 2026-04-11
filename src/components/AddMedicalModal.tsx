import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { Bird, MedicalRecord } from '../types';
import { Button } from './ui/Button';

export const AddMedicalModal = ({ isOpen, onClose, onAdd, birds }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (record: Omit<MedicalRecord, 'id' | 'ownerId'>) => void,
  birds: Bird[]
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    birdId: '',
    treatment: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Upcoming' as MedicalRecord['status'],
    type: 'Checkup' as MedicalRecord['type'],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
        className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8"
      >
        <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('addMedicalRecord')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-600 mb-2 block">{t('bird')}</span>
            <select 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
              value={formData.birdId}
              onChange={e => setFormData(prev => ({ ...prev, birdId: e.target.value }))}
            >
              <option value="">{t('selectBird')}</option>
              {birds.map(b => (
                <option key={b.id} value={b.id}>{b.ringNumber}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600 mb-2 block">{t('treatment')}</span>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
              value={formData.treatment}
              onChange={e => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-600 mb-2 block">{t('date')}</span>
              <input 
                type="date" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-600 mb-2 block">{t('type')}</span>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <option value="Checkup">{t('checkup')}</option>
                <option value="Vaccination">{t('vaccination')}</option>
                <option value="Treatment">{t('treatment')}</option>
              </select>
            </label>
          </div>
          <Button variant="primary" className="w-full py-4 mt-4">{t('save')}</Button>
        </form>
      </motion.div>
    </div>
  );
};
