import React from 'react';
import { motion } from 'motion/react';
import { Search, FileDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Bird } from '../../types';
import { PedigreeNode } from '../PedigreeNode';

interface PedigreeTabProps {
  t: (key: string) => string;
  birds: Bird[];
  pedigreeTargetId: string | null;
  setPedigreeTargetId: (id: string | null) => void;
}

export const PedigreeTab: React.FC<PedigreeTabProps> = ({
  t,
  birds,
  pedigreeTargetId,
  setPedigreeTargetId,
}) => {
  return (
    <motion.div
      key="pedigree"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 min-h-[600px]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('pedigreeExplorer')}</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('pedigreeDesc')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            className="px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700 text-sm"
            value={pedigreeTargetId || ''}
            onChange={(e) => setPedigreeTargetId(e.target.value)}
          >
            <option value="">{t('selectBird')}</option>
            {birds.map(b => (
              <option key={b.id} value={b.id}>{b.ringNumber} ({b.mutation})</option>
            ))}
          </select>
          <Button 
            variant="ghost" 
            className="border border-slate-100 rounded-2xl px-6 font-bold text-slate-600 hover:bg-slate-50 gap-2" 
            onClick={() => window.print()}
          >
            <FileDown size={20} />
            {t('exportPdf')}
          </Button>
        </div>
      </div>

      <div className="relative p-8 sm:p-12 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 overflow-x-auto min-h-[500px] flex items-center justify-center">
        {pedigreeTargetId ? (
          <div className="min-w-max p-10">
            <PedigreeNode 
              bird={birds.find(b => b.id === pedigreeTargetId)} 
              label={t('targetBird')} 
              depth={0} 
              birds={birds} 
              t={t} 
            />
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-sm">
              <Search size={48} />
            </div>
            <div>
              <p className="text-slate-500 font-bold text-xl">{t('selectBirdToViewPedigree')}</p>
              <p className="text-slate-400 text-sm mt-2">{t('pedigreeDesc')}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
