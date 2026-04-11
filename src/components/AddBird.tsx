import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Users, Heart, Info, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Bird, Nest } from '../types';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { SPECIES_IMAGES } from '../constants';

export const AddBirdModal = ({ isOpen, onClose, onAdd, birds, nests }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (bird: any) => Promise<void> | void,
  birds: Bird[],
  nests: Nest[]
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createCouple, setCreateCouple] = useState(false);
  const [partnerRingNumber, setPartnerRingNumber] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    ringNumber: '',
    species: 'Canary',
    sex: 'Unknown' as 'Male' | 'Female' | 'Unknown',
    mutation: '',
    birthDate: new Date().toISOString().split('T')[0],
    notes: '',
    healthStatus: 'Healthy',
    origin: 'Bred by me' as 'Bred by me' | 'Purchased',
    availability: 'Bred' as 'For Sale' | 'Bred',
    photoFile: null as File | null,
    photoPreview: ''
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photoFile: file,
          photoPreview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ringNumber.trim()) {
      alert(t('ringNumberLabel') + ' ' + t('required'));
      return;
    }
    if (createCouple && !partnerRingNumber.trim()) {
      alert(t('partnerRingNumber') || 'Partner Ring Number is required for pairing');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        ...formData,
        createCouple,
        partnerRingNumber
      });
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative bg-white w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 sm:px-12 py-6 sm:py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{t('addNewBird')}</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">{t('birdRegistration') || 'Bird Registration'}</p>
          </div>
          <button onClick={onClose} className="p-3 sm:p-4 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Ring Number Field */}
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('ringNumberLabel')} *
                </label>
                <input 
                  type="text" 
                  placeholder={t('ringNumberPlaceholder')} 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-[#0056b3] transition-all text-base font-bold" 
                  value={formData.ringNumber}
                  onChange={(e) => setFormData({ ...formData, ringNumber: e.target.value })}
                  required
                />
              </div>

              {/* Species Field */}
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('speciesLabel')}
                </label>
                <div className="relative">
                  <select 
                    className={cn(
                      "w-full py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-[#0056b3] transition-all text-base font-bold appearance-none cursor-pointer",
                      isRTL ? "pr-6 pl-12" : "pl-6 pr-12"
                    )}
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  >
                    {Object.keys(SPECIES_IMAGES).map(species => (
                      <option key={species} value={species}>{t(species.toLowerCase())}</option>
                    ))}
                  </select>
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400",
                    isRTL ? "left-6" : "right-6"
                  )}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              {/* Gender Field */}
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('genderLabel')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Male', label: t('male'), icon: Users, color: 'blue' },
                    { id: 'Female', label: t('female'), icon: Heart, color: 'pink' },
                    { id: 'Unknown', label: t('unknown'), icon: Info, color: 'slate' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, sex: g.id as any })}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1",
                        formData.sex === g.id 
                          ? `bg-${g.color}-50 border-${g.color}-500 text-${g.color}-600` 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <g.icon size={18} />
                      <span className="font-black text-[9px] uppercase tracking-widest">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Date Field */}
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('birthDate')}
                </label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-[#0056b3] transition-all text-base font-bold" 
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              {/* Mutation Field */}
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('mutationLabel') || 'Mutation / Color'}
                </label>
                <input 
                  type="text" 
                  placeholder={t('mutationPlaceholder') || 'e.g. Lutino, Opaline'} 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-[#0056b3] transition-all text-base font-bold" 
                  value={formData.mutation}
                  onChange={(e) => setFormData({ ...formData, mutation: e.target.value })}
                />
              </div>

              {/* Source Field */}
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('sourceLabel') || 'Source'}
                </label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-[#0056b3] transition-all text-base font-bold appearance-none cursor-pointer"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value as any })}
                >
                  <option value="Bred by me">{t('bredByMe')}</option>
                  <option value="Purchased">{t('purchased')}</option>
                </select>
              </div>

              {/* Status Field */}
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('statusLabel') || 'Status'}
                </label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-[#0056b3] transition-all text-base font-bold appearance-none cursor-pointer"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                >
                  <option value="Bred">{t('active') || 'Active'}</option>
                  <option value="For Sale">{t('forSale')}</option>
                  <option value="Sold">{t('sold') || 'Sold'}</option>
                </select>
              </div>

              {/* Name Field (Optional) */}
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('birdName')} ({t('optional')})
                </label>
                <input 
                  type="text" 
                  placeholder={t('birdNamePlaceholder')} 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-[#0056b3] transition-all text-base font-bold" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Photo Upload Field */}
              <div className="space-y-3 md:col-span-2">
                <label className={cn("text-xs font-black text-slate-900 uppercase tracking-widest", isRTL ? "mr-1" : "ml-1")}>
                  {t('birdPhoto') || 'Bird Photo'}
                </label>
                <div className="flex items-center gap-6 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-indigo-400 transition-all group cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-24 h-24 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                    {formData.photoPreview ? (
                      <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Plus size={32} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 tracking-tight">{t('uploadPhoto') || 'Upload Photo'}</p>
                    <p className="text-xs text-slate-500 font-bold">{t('uploadPhotoDesc') || 'Select a clear photo of your bird'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Pair Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 tracking-tight">{t('createPairNow') || 'Create Pair Now'}</h4>
                    <p className="text-xs text-slate-500 font-bold">{t('createPairDesc') || 'Instantly create a breeding pair with this bird'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateCouple(!createCouple)}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative",
                    createCouple ? "bg-indigo-600" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm",
                    createCouple ? (isRTL ? "right-7" : "left-7") : (isRTL ? "right-1" : "left-1")
                  )} />
                </button>
              </div>

              <AnimatePresence>
                {createCouple && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-6 bg-white border-2 border-indigo-100 rounded-[2rem] space-y-4">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">
                        {t('partnerRingNumber') || 'Partner Ring Number'} *
                      </label>
                      <input 
                        type="text" 
                        placeholder={t('partnerRingPlaceholder') || 'Enter partner ring number'} 
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-indigo-600 transition-all text-base font-bold" 
                        value={partnerRingNumber}
                        onChange={(e) => setPartnerRingNumber(e.target.value)}
                        required={createCouple}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-6">
              <Button 
                variant="primary" 
                type="submit" 
                className="w-full py-6 text-xl font-black rounded-[2rem] shadow-xl shadow-indigo-200 bg-[#0056b3] hover:bg-[#004494]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t('saving') || 'Saving...' : t('saveBird')}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
