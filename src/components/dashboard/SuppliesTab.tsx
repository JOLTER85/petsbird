import React from 'react';
import { motion } from 'motion/react';
import { Box, Plus, Archive, Activity, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { SupplyItem } from '../../types';
import { cn } from '../../lib/utils';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { OperationType, handleFirestoreError } from '../../lib/firestoreUtils';

interface SuppliesTabProps {
  t: (key: string) => string;
  supplies: SupplyItem[];
  setIsAddSupplyModalOpen: (open: boolean) => void;
}

export const SuppliesTab: React.FC<SuppliesTabProps> = ({
  t,
  supplies,
  setIsAddSupplyModalOpen,
}) => {
  return (
    <motion.div
      key="supplies"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('suppliesInventory')}</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('suppliesDesc')}</p>
        </div>
        <Button 
          variant="primary" 
          className="gap-2 px-6 sm:px-8 py-2 sm:py-4 text-xs sm:text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 rounded-xl sm:rounded-2xl"
          onClick={() => setIsAddSupplyModalOpen(true)}
        >
          <Plus size={24} />
          {t('addSupply')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {supplies.map((item) => (
          <motion.div 
            key={item.id} 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-all group border border-slate-100/50"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                {item.category === 'Food' ? <Archive size={24} /> : item.category === 'Medicine' ? <Activity size={24} /> : <Box size={24} />}
              </div>
              <button 
                onClick={async () => {
                  if (!window.confirm(t('confirmDelete'))) return;
                  try {
                    await deleteDoc(doc(db, 'supplies', item.id));
                  } catch (e) {
                    handleFirestoreError(e, OperationType.DELETE, 'supplies');
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <h4 className="text-lg font-display font-bold text-slate-900 mb-1">{item.name}</h4>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-4">{t(item.category.toLowerCase())}</p>
            
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 mb-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('quantity')}</p>
                  <p className="text-xl font-display font-black text-slate-900">{item.stock} {item.unit}</p>
                </div>
                {item.stock < 5 && (
                  <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100">
                    {t('lowStock')}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-emerald-600 transition-all">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('updateStock')}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>
        ))}
        {supplies.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Box size={40} />
            </div>
            <p className="text-slate-500 font-bold text-lg">{t('noSupplies') || 'No supplies in inventory'}</p>
            <p className="text-slate-400 text-sm mt-2">{t('suppliesDesc')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
