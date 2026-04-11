import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bird as BirdIcon, ArrowLeft, Shield, CheckCircle2, History, Share2, Printer } from 'lucide-react';
import { db, doc, getDoc } from '../firebase';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface Bird {
  id: string;
  ringNumber: string;
  species: string;
  mutation: string;
  sex: string;
  birthDate: string;
  photoURL?: string;
  notes?: string;
  fatherId?: string;
  motherId?: string;
  origin: string;
  healthStatus: string;
  availability: string;
  isForSale?: boolean;
  salePrice?: number;
}

export const PublicBirdProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';
  const [bird, setBird] = useState<Bird | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBird = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'birds', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Bird;
          // Check if public profile is enabled or if it's for sale
          if (data.isForSale || (data as any).publicProfileEnabled) {
            setBird({ ...data, id: docSnap.id });
          } else {
            setError(t('profilePrivate'));
          }
        } else {
          setError(t('birdNotFound'));
        }
      } catch (err) {
        console.error("Error fetching public bird profile:", err);
        setError(t('failedToLoadBirdProfile'));
      } finally {
        setLoading(false);
      }
    };

    fetchBird();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !bird) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6">
          <BirdIcon size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{error || t('profileUnavailable')}</h2>
        <p className="text-slate-500 mb-8 max-w-md">{t('profileUnavailableDesc')}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          {t('backToHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <BirdIcon size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">{t('petsBirdPassport')}</span>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={() => window.print()}
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              title={t('printPassport')}
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={() => {
                navigator.share({
                  title: `${t('digitalPassport')}: ${bird.ringNumber}`,
                  text: t('shareBirdText', { species: t(bird.species.toLowerCase()) }),
                  url: window.location.href
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert(t('linkCopied'));
                });
              }}
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              title={t('shareProfile')}
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square relative">
              <img 
                src={bird.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${bird.id}`} 
                alt={bird.ringNumber}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {bird.isForSale && (
                <div className={cn(
                  "absolute top-6 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg",
                  isRTL ? "right-6" : "left-6"
                )}>
                  {t('availableForSale')}
                </div>
              )}
            </div>
            <div className="p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-4">
                <Shield size={16} />
                {t('digitalPassport')}
              </div>
              <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">{bird.ringNumber}</h1>
              <p className="text-xl text-slate-500 font-medium mb-8">{t(bird.species.toLowerCase())} • {bird.mutation}</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('genderLabel')}</p>
                  <p className="font-bold text-slate-900">{bird.sex === 'Male' ? t('male') : bird.sex === 'Female' ? t('female') : t('unknown')}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('birthDateLabel')}</p>
                  <p className="font-bold text-slate-900">{bird.birthDate}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technical Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={20} />
                {t('technicalSpecifications')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: t('originLabel'), value: bird.origin === 'Bred by me' ? t('bredByMe') : t('purchased') },
                  { label: t('healthStatusLabel'), value: t(bird.healthStatus.toLowerCase()) },
                  { label: t('availabilityLabel'), value: bird.availability === 'Bred' ? t('bred') : t('forSale') },
                  { label: t('mutationDetails'), value: bird.mutation },
                ].map((item, i) => (
                  <div key={i} className="border-b border-slate-50 pb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {bird.notes && (
              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{t('breederNotes')}</h3>
                <p className="text-slate-600 leading-relaxed">{bird.notes}</p>
              </section>
            )}
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <History className="text-indigo-600" size={20} />
                {t('lineage')}
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t('sireFather')}</p>
                  <p className="font-bold text-blue-900">{bird.fatherId || t('unknown')}</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100">
                  <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">{t('damMother')}</p>
                  <p className="font-bold text-pink-900">{bird.motherId || t('unknown')}</p>
                </div>
              </div>
            </section>

            {bird.isForSale && bird.salePrice && (
              <section className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white text-center">
                <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2">{t('askingPrice')}</p>
                <h3 className="text-4xl font-black mb-6">${bird.salePrice}</h3>
                <button 
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(t('inquiryText', { ringNumber: bird.ringNumber }))}`, '_blank')}
                  className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
                >
                  {t('inquireNow')}
                </button>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-center">
        <p className="text-slate-400 text-sm font-medium">{t('verifiedBySystem')}</p>
      </footer>
    </div>
  );
};
