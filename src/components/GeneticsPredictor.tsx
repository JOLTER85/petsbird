import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dna, X, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';

export const GeneticsPredictor = () => {
  const { t } = useLanguage();
  const [maleMutation, setMaleMutation] = useState('');
  const [femaleMutation, setFemaleMutation] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const predict = () => {
    // Mock prediction logic
    setResults([
      { mutation: 'Normal', probability: 25, sex: 'Both' },
      { mutation: maleMutation || 'Normal', probability: 25, sex: 'Both' },
      { mutation: femaleMutation || 'Normal', probability: 25, sex: 'Both' },
      { mutation: 'Split', probability: 25, sex: 'Males' },
    ]);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('maleMutation')}</label>
          <input 
            type="text"
            className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-bold"
            value={maleMutation}
            onChange={(e) => setMaleMutation(e.target.value)}
            placeholder="e.g. Opaline"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('femaleMutation')}</label>
          <input 
            type="text"
            className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 transition-all font-bold"
            value={femaleMutation}
            onChange={(e) => setFemaleMutation(e.target.value)}
            placeholder="e.g. Cinnamon"
          />
        </div>
      </div>

      <Button variant="primary" className="w-full py-4 bg-indigo-600" onClick={predict}>
        {t('predictResults')}
      </Button>

      {results.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-900">{t('expectedOffspring')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((res, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{res.mutation}</p>
                  <p className="text-xs text-slate-500">{res.sex}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-indigo-600">{res.probability}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
