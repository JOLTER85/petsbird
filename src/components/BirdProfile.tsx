import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Bird as BirdIcon, 
  Shield, 
  CheckCircle2, 
  History, 
  Share2, 
  Printer, 
  Trash2, 
  Edit2, 
  Plus, 
  ChevronRight,
  Eye,
  EyeOff,
  ShoppingBag,
  Globe,
  Archive,
  Box,
  LayoutGrid
} from 'lucide-react';
import { db, doc, updateDoc, deleteDoc, setDoc, collection, addDoc } from '../firebase';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { Bird, ProductionRecord } from '../types';
import { Button } from './ui/Button';
import { PedigreeNode } from './PedigreeNode';
import { QRCodeSVG } from 'qrcode.react';

export const BirdProfile = ({ bird, onClose, birds, productionRecords, onUpdate, onDelete }: { 
  bird: Bird, 
  onClose: () => void, 
  birds: Bird[],
  productionRecords: ProductionRecord[],
  onUpdate: (id: string, data: Partial<Bird>) => void,
  onDelete: (id: string) => Promise<void> | void
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'pedigree' | 'production' | 'marketplace'>('info');
  const [formData, setFormData] = useState({ ...bird });
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [newProduction, setNewProduction] = useState({
    year: new Date().getFullYear(),
    clutchNumber: 1,
    eggsCount: 0,
    hatchedCount: 0,
    weanedCount: 0,
    notes: ''
  });

  const handleSave = () => {
    onUpdate(bird.id, formData);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, upload to storage and get URL
    // For now, use a placeholder
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate(bird.id, { photoURL: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-0 z-[150] bg-slate-50 flex flex-col"
    >
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
            <X size={24} />
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <BirdIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{bird.ringNumber}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(bird.species.toLowerCase())}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            title={t('printPassport')}
          >
            <Printer size={20} />
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              isEditing ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <Edit2 size={20} />
          </button>
          <button 
            onClick={() => {
              if (window.confirm(t('confirmDeleteBird'))) {
                onDelete(bird.id);
                onClose();
              }
            }}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Image & Quick Stats */}
            <div className="lg:col-span-4 space-y-8">
              <div className="relative group">
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white">
                  <img 
                    src={bird.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${bird.id}`} 
                    alt={bird.ringNumber}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-[3rem] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <div className="text-white text-center">
                      <Plus size={32} className="mx-auto mb-2" />
                      <span className="font-bold text-sm">{t('changePhoto')}</span>
                    </div>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                )}
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{t('quickStats')}</h3>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('genderLabel')}</p>
                    <p className="font-bold text-slate-900">{bird.sex === 'Male' ? t('male') : bird.sex === 'Female' ? t('female') : t('unknown')}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('ageLabel')}</p>
                    <p className="font-bold text-slate-900">1.2 {t('years')}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50 flex flex-col items-center">
                  <div className="p-4 bg-white border-2 border-slate-100 rounded-3xl mb-4">
                    <QRCodeSVG 
                      value={`${window.location.origin}/bird/${bird.id}`}
                      size={120}
                      level="H"
                    />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('scanPassport')}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Details & Tabs */}
            <div className="lg:col-span-8 space-y-8">
              {/* Navigation Tabs */}
              <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
                {[
                  { id: 'info', label: t('basicInfo'), icon: BirdIcon },
                  { id: 'pedigree', label: t('pedigree'), icon: History },
                  { id: 'production', label: t('production'), icon: LayoutGrid },
                  { id: 'marketplace', label: t('marketplace'), icon: ShoppingBag }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                      activeTab === tab.id 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 min-h-[500px]">
                {activeTab === 'info' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('ringNumberLabel')}</label>
                        <input 
                          disabled={!isEditing}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold transition-all disabled:opacity-50"
                          value={formData.ringNumber}
                          onChange={e => setFormData({ ...formData, ringNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('speciesLabel')}</label>
                        <select 
                          disabled={!isEditing}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold transition-all disabled:opacity-50"
                          value={formData.species}
                          onChange={e => setFormData({ ...formData, species: e.target.value })}
                        >
                          <option value="Canary">{t('canary')}</option>
                          <option value="Finch">{t('finch')}</option>
                          <option value="Parrot">{t('parrot')}</option>
                          <option value="Pigeon">{t('pigeon')}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('mutationLabel')}</label>
                        <input 
                          disabled={!isEditing}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold transition-all disabled:opacity-50"
                          value={formData.mutation}
                          onChange={e => setFormData({ ...formData, mutation: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('birthDateLabel')}</label>
                        <input 
                          type="date"
                          disabled={!isEditing}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold transition-all disabled:opacity-50"
                          value={formData.birthDate}
                          onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('notesLabel')}</label>
                      <textarea 
                        disabled={!isEditing}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold transition-all h-32 resize-none disabled:opacity-50"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-4 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
                        <Button variant="primary" className="flex-1 bg-indigo-600" onClick={handleSave}>{t('saveChanges')}</Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pedigree' && (
                  <div className="overflow-x-auto pb-10">
                    <div className="min-w-[800px] flex justify-center py-10">
                      <PedigreeNode bird={bird} label={t('currentBird')} depth={0} birds={birds} t={t} />
                    </div>
                  </div>
                )}

                {activeTab === 'production' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('productionHistory')}</h3>
                      <button 
                        onClick={() => setIsAddingProduction(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        <Plus size={16} />
                        {t('addRecord')}
                      </button>
                    </div>

                    {isAddingProduction && (
                      <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-indigo-100 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <input 
                              type="number" 
                              placeholder={t('year')}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                              value={newProduction.year}
                              onChange={e => setNewProduction({ ...newProduction, year: parseInt(e.target.value) })}
                            />
                            <input 
                              type="number" 
                              placeholder={t('clutchNumber')}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                              value={newProduction.clutchNumber}
                              onChange={e => setNewProduction({ ...newProduction, clutchNumber: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <input 
                              type="number" 
                              placeholder={t('eggs')}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                              value={newProduction.eggsCount}
                              onChange={e => setNewProduction({ ...newProduction, eggsCount: parseInt(e.target.value) })}
                            />
                            <input 
                              type="number" 
                              placeholder={t('hatched')}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                              value={newProduction.hatchedCount}
                              onChange={e => setNewProduction({ ...newProduction, hatchedCount: parseInt(e.target.value) })}
                            />
                            <input 
                              type="number" 
                              placeholder={t('weaned')}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                              value={newProduction.weanedCount}
                              onChange={e => setNewProduction({ ...newProduction, weanedCount: parseInt(e.target.value) })}
                            />
                          </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsAddingProduction(false)}>{t('cancel')}</Button>
                          <Button 
                            variant="primary" 
                            className="flex-1 text-xs bg-indigo-600" 
                            onClick={async () => {
                              const record = {
                                ...newProduction,
                                birdId: bird.id,
                                ownerId: bird.ownerId,
                                deleted: false
                              };
                              await addDoc(collection(db, 'production'), record);
                              setIsAddingProduction(false);
                            }}
                          >
                            {t('save')}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {productionRecords.map((record) => (
                        <div key={record.id} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                              <LayoutGrid size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{t('clutch')} #{record.clutchNumber} ({record.year})</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {record.eggsCount} {t('eggs')} • {record.hatchedCount} {t('hatched')} • {record.weanedCount} {t('weaned')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest border border-slate-100">
                              {record.eggsCount > 0 ? Math.round((record.weanedCount / record.eggsCount) * 100) : 0}%
                            </span>
                            <button 
                              onClick={async () => {
                                await updateDoc(doc(db, 'production', record.id), { deleted: true });
                              }}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {productionRecords.length === 0 && !isAddingProduction && (
                        <div className="p-10 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                          <p className="text-slate-400 font-bold">{t('noProductionHistory')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'marketplace' && (
                  <div className="space-y-10">
                    <div className="p-8 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                            <Globe size={24} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 tracking-tight">{t('publicProfile')}</h4>
                            <p className="text-xs text-slate-500 font-bold">{t('publicProfileDesc')}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => onUpdate(bird.id, { publicProfileEnabled: !(bird as any).publicProfileEnabled })}
                          className={cn(
                            "w-14 h-8 rounded-full transition-all relative",
                            (bird as any).publicProfileEnabled ? "bg-indigo-600" : "bg-slate-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
                            (bird as any).publicProfileEnabled ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                      
                      {(bird as any).publicProfileEnabled && (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-indigo-100">
                          <div className="flex-1 truncate text-xs font-bold text-slate-500">
                            {window.location.origin}/bird/{bird.id}
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/bird/${bird.id}`);
                              alert(t('linkCopied'));
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                          >
                            {t('copyLink')}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-8 bg-green-50 rounded-[2.5rem] border-2 border-green-100">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 tracking-tight">{t('marketplaceListing')}</h4>
                            <p className="text-xs text-slate-500 font-bold">{t('marketplaceListingDesc')}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => onUpdate(bird.id, { isForSale: !bird.isForSale })}
                          className={cn(
                            "w-14 h-8 rounded-full transition-all relative",
                            bird.isForSale ? "bg-green-500" : "bg-slate-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
                            bird.isForSale ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>

                      {bird.isForSale && (
                        <div className="space-y-4">
                          <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">{t('askingPrice')}</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                            <input 
                              type="number"
                              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-green-100 rounded-2xl font-black text-2xl focus:outline-none focus:border-green-500 transition-all"
                              value={bird.salePrice || ''}
                              onChange={e => onUpdate(bird.id, { salePrice: Number(e.target.value) })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
