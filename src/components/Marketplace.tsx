import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bird as BirdIcon, Search, ShoppingBag, Filter, ArrowRight, Shield, LayoutGrid, LayoutList } from 'lucide-react';
import { db, collection, query, where, onSnapshot } from '../firebase';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Bird } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const Marketplace = () => {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';

  useEffect(() => {
    const q = query(collection(db, 'birds'), where('isForSale', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const birdsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bird[];
      setBirds(birdsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredBirds = birds.filter(bird => {
    const matchesSearch = bird.ringNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bird.mutation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecies === 'All' || bird.species === filterSpecies;
    return matchesSearch && matchesFilter;
  });

  const speciesList = ['All', ...Array.from(new Set(birds.map(b => b.species)))];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Section */}
      <section className="bg-indigo-600 text-white py-24 px-6 relative overflow-hidden">
        <div className={cn(
          "absolute top-0 w-1/3 h-full bg-white/5 -translate-y-1/4",
          isRTL ? "left-0 -skew-x-12" : "right-0 skew-x-12"
        )}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6 text-indigo-200 font-bold uppercase tracking-widest text-sm">
            <ShoppingBag size={20} />
            {t('proMarketplaceTitle')}
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tight">{t('findNextChampion')}</h1>
          <p className="text-xl text-indigo-100 max-w-2xl leading-relaxed">
            {t('marketplaceHeroDesc')}
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto -mt-10 px-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100 flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 text-slate-400",
              isRTL ? "right-6" : "left-6"
            )} size={20} />
            <input 
              type="text" 
              placeholder={t('searchMarketplacePlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg font-medium",
                isRTL ? "pr-16 pl-6" : "pl-16 pr-6"
              )}
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutList size={20} />
              </button>
            </div>
            <select 
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="flex-1 lg:w-48 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            >
              {speciesList.map(s => <option key={s as string} value={s as string}>{s === 'All' ? t('allSpecies') : t((s as string).toLowerCase())}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Bird List */}
      <main className="max-w-7xl mx-auto p-6 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredBirds.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "grid gap-8",
                  viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                )}
              >
                {filteredBirds.map((bird) => (
                  <motion.div
                    key={bird.id}
                    layout
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/bird/${bird.id}`)}
                    className={cn(
                      "bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all cursor-pointer group",
                      viewMode === 'list' ? "flex flex-col md:flex-row h-auto md:h-64" : ""
                    )}
                  >
                    <div className={cn(
                      "relative overflow-hidden",
                      viewMode === 'grid' ? "aspect-square" : "w-full md:w-64 h-64 md:h-full"
                    )}>
                      <img 
                        src={bird.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${bird.id}`} 
                        alt={bird.ringNumber}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className={cn(
                        "absolute top-4",
                        isRTL ? "left-4" : "right-4"
                      )}>
                        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-indigo-600 shadow-lg border border-white">
                          ${bird.salePrice || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
                          <Shield size={12} />
                          {t('verifiedListing')}
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{bird.ringNumber}</h4>
                        <p className="text-slate-500 font-medium mb-4">{t(bird.species.toLowerCase())} • {bird.mutation}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                            {bird.sex === 'Male' ? t('male') : bird.sex === 'Female' ? t('female') : t('unknown')}
                          </span>
                          <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                            {bird.origin === 'Bred by me' ? t('bredByMe') : t('purchased')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${bird.ownerId}`} alt="Breeder" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('proBreeder')}</span>
                        </div>
                        <ArrowRight size={20} className={cn(
                          "text-slate-300 transition-all",
                          isRTL ? "rotate-180 group-hover:text-indigo-600 group-hover:-translate-x-2" : "group-hover:text-indigo-600 group-hover:translate-x-2"
                        )} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="py-40 text-center bg-white border border-dashed border-slate-200 rounded-[4rem]">
                <BirdIcon size={64} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('noBirdsForSale')}</h3>
                <p className="text-slate-500">{t('checkBackLater')}</p>
              </div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};
