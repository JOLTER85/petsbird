import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { SupplyItem } from '../types';
import { Button } from './ui/Button';

export const AddSupplyModal = ({ isOpen, onClose, onAdd }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (item: Omit<SupplyItem, 'id' | 'ownerId'>) => void 
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    unit: 'kg',
    minLevel: 5,
    category: 'Food' as SupplyItem['category']
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
        <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('addSupply')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-600 mb-2 block">{t('name')}</span>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-600 mb-2 block">{t('stock')}</span>
              <input 
                type="number" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                value={formData.stock}
                onChange={e => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-600 mb-2 block">{t('unit')}</span>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                value={formData.unit}
                onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-slate-600 mb-2 block">{t('category')}</span>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
            >
              <option value="Food">{t('food')}</option>
              <option value="Medicine">{t('medicine')}</option>
              <option value="Equipment">{t('equipment')}</option>
              <option value="Other">{t('other')}</option>
            </select>
          </label>
          <Button variant="primary" className="w-full py-4 mt-4">{t('save')}</Button>
        </form>
      </motion.div>
    </div>
  );
};
