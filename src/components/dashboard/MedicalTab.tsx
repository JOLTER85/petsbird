import React from 'react';
import { motion } from 'motion/react';
import { Activity, Plus, Heart, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { MedicalRecord, Bird } from '../../types';
import { cn } from '../../lib/utils';

interface MedicalTabProps {
  t: (key: string) => string;
  medicalRecords: MedicalRecord[];
  birds: Bird[];
  setIsAddMedicalModalOpen: (open: boolean) => void;
}

export const MedicalTab: React.FC<MedicalTabProps> = ({
  t,
  medicalRecords,
  birds,
  setIsAddMedicalModalOpen,
}) => {
  return (
    <motion.div
      key="medical"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('medicalCenter')}</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('medicalCenterDesc')}</p>
        </div>
        <Button 
          variant="primary" 
          className="gap-2 px-6 sm:px-8 py-2 sm:py-4 text-xs sm:text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 rounded-xl sm:rounded-2xl"
          onClick={() => setIsAddMedicalModalOpen(true)}
        >
          <Plus size={24} />
          {t('newRecord')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {medicalRecords.map((record) => {
          const bird = birds.find(b => b.id === record.birdId);
          return (
            <motion.div 
              key={record.id} 
              whileHover={{ y: -5 }}
              className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-all group border border-slate-100/50"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-tight">{record.type}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{bird?.name || bird?.ringNumber || 'Unknown Bird'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    record.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  )}>
                    {t(record.status.toLowerCase())}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 font-medium">
                <Calendar size={14} className="text-slate-400" />
                {record.date}
              </div>

              <p className="text-sm text-slate-600 mb-6 line-clamp-2 font-medium">
                {record.notes}
              </p>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-emerald-600 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('viewDetails')}</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          );
        })}
        {medicalRecords.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Heart size={40} />
            </div>
            <p className="text-slate-500 font-bold text-lg">{t('noMedicalRecords') || 'No medical records found'}</p>
            <p className="text-slate-400 text-sm mt-2">{t('medicalCenterDesc')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
