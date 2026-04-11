import React from 'react';
import { Bird } from '../types';
import { cn } from '../lib/utils';

export const PedigreeNode = ({ bird, label, depth, birds, t }: { bird?: Bird, label: string, depth: number, birds: Bird[], t: any }) => {
  if (depth > 3) return null;

  const father = birds.find(b => b.ringNumber === bird?.fatherId);
  const mother = birds.find(b => b.ringNumber === bird?.motherId);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-8">
      <div className={cn(
        "p-3 sm:p-5 bg-white border-2 rounded-2xl sm:rounded-3xl shadow-sm w-32 sm:w-48 text-center transition-all hover:shadow-md",
        depth === 0 ? "border-indigo-600 shadow-lg ring-4 ring-indigo-500/10" : "border-slate-100"
      )}>
        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="font-bold text-slate-900 truncate text-xs sm:text-base">{bird?.ringNumber || '???'}</p>
        <p className="text-[8px] sm:text-[10px] text-slate-500 truncate">{bird?.mutation || 'N/A'}</p>
      </div>

      {depth < 3 && (bird?.fatherId || bird?.motherId) && (
        <div className="flex gap-4 sm:gap-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full h-4 sm:h-8 w-[2px] bg-slate-200"></div>
          <div className="absolute top-0 inset-x-1/4 h-[2px] bg-slate-200 -translate-y-4 sm:-translate-y-8"></div>
          
          <PedigreeNode 
            bird={father || (bird?.fatherId ? { ringNumber: bird.fatherId, mutation: 'Unknown' } as any : undefined)} 
            label={t('sireFather')} 
            depth={depth + 1} 
            birds={birds} 
            t={t} 
          />
          <PedigreeNode 
            bird={mother || (bird?.motherId ? { ringNumber: bird.motherId, mutation: 'Unknown' } as any : undefined)} 
            label={t('damMother')} 
            depth={depth + 1} 
            birds={birds} 
            t={t} 
          />
        </div>
      )}
    </div>
  );
};
