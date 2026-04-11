import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { GeneticsPredictor } from '../GeneticsPredictor';

interface GeneticsTabProps {
  t: (key: string) => string;
}

export const GeneticsTab: React.FC<GeneticsTabProps> = ({
  t,
}) => {
  return (
    <motion.div
      key="genetics"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50"
    >
      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] sm:rounded-2xl shadow-sm">
          <Zap size={32} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('geneticsPredictor')}</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('geneticsDesc')}</p>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-[2rem] p-6 sm:p-10 border border-slate-100/50">
        <GeneticsPredictor />
      </div>
    </motion.div>
  );
};
