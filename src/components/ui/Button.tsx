import React from 'react';
import { cn } from '../../lib/utils';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  onClick, 
  type = 'button', 
  disabled 
}: { 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost', 
  className?: string, 
  onClick?: () => void, 
  type?: 'button' | 'submit', 
  disabled?: boolean 
}) => {
  const variants = {
    primary: 'bg-[#0056b3] text-white hover:bg-[#004494] shadow-lg shadow-blue-500/20',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20',
    outline: 'border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-50'
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};
