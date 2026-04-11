import React from 'react';
import { motion } from 'motion/react';
import { User, Globe, Save, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SettingsTabProps {
  t: (key: string) => string;
  settingsData: any;
  setSettingsData: (data: any) => void;
  handleSaveSettings: (e: React.FormEvent) => void;
  setActiveTab: (tab: string) => void;
  user: any;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  t,
  settingsData,
  setSettingsData,
  handleSaveSettings,
  setActiveTab,
  user,
}) => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 min-h-[600px]"
    >
      <div className="mb-12">
        <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">{t('aviarySettings')}</h2>
        <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">{t('settingsDesc')}</p>
      </div>

      <form className="max-w-3xl space-y-12" onSubmit={handleSaveSettings}>
        <section className="space-y-8">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <User size={20} />
            </div>
            <h4 className="text-lg font-display font-bold text-slate-900">{t('profileInfo')}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('displayName')}</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700 transition-all"
                value={settingsData.displayName}
                onChange={(e) => setSettingsData((prev: any) => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('emailAddress')}</label>
              <input 
                type="email" 
                className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-500 cursor-not-allowed font-bold"
                value={user?.email || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('firstName')}</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700 transition-all"
                value={settingsData.firstName}
                onChange={(e) => setSettingsData((prev: any) => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('lastName')}</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700 transition-all"
                value={settingsData.lastName}
                onChange={(e) => setSettingsData((prev: any) => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('phone')}</label>
              <input 
                type="tel" 
                className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700 transition-all"
                value={settingsData.phone}
                onChange={(e) => setSettingsData((prev: any) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('address')}</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700 transition-all"
                value={settingsData.address}
                onChange={(e) => setSettingsData((prev: any) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Globe size={20} />
            </div>
            <h4 className="text-lg font-display font-bold text-slate-900">{t('aviaryConfig')}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('aviaryName')}</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700 transition-all"
                value={settingsData.aviaryName}
                onChange={(e) => setSettingsData((prev: any) => ({ ...prev, aviaryName: e.target.value }))}
              />
            </div>
          </div>
        </section>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-end">
          <Button 
            type="button"
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className="gap-2 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-50"
          >
            <X size={20} />
            {t('cancel')}
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            className="gap-2 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            <Save size={20} />
            {t('saveChanges')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
