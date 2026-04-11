import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AdvicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const articles = [
    {
      id: 'canary-breeding-guide',
      title: t('canaryBreedingGuideTitle'),
      description: t('canaryBreedingGuideDesc'),
      content: (
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-black mb-8">{t('canaryBreedingGuideTitle')}</h1>
          <p className="text-lg text-slate-600 mb-8">{t('canaryBreedingGuideContent')}</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('canaryBreedingStep1Title')}</h2>
          <p className="text-slate-600 mb-6">{t('canaryBreedingStep1Text')}</p>
          <ul className="list-disc pl-6 mb-8 text-slate-600 space-y-2">
            <li><strong>{t('canaryBreedingStep1Point1').split(':')[0]}:</strong>{t('canaryBreedingStep1Point1').split(':')[1]}</li>
            <li><strong>{t('canaryBreedingStep1Point2').split(':')[0]}:</strong>{t('canaryBreedingStep1Point2').split(':')[1]}</li>
            <li><strong>{t('canaryBreedingStep1Point3').split(':')[0]}:</strong>{t('canaryBreedingStep1Point3').split(':')[1]}</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('canaryBreedingStep2Title')}</h2>
          <p className="text-slate-600 mb-6">{t('canaryBreedingStep2Text')}</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('canaryBreedingStep3Title')}</h2>
          <p className="text-slate-600 mb-6">{t('canaryBreedingStep3Text')}</p>
        </div>
      )
    },
    {
      id: 'optimal-bird-nutrition',
      title: t('optimalNutritionTitle'),
      description: t('optimalNutritionDesc'),
      content: (
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-black mb-8">{t('optimalNutritionTitle')}</h1>
          <p className="text-lg text-slate-600 mb-8">{t('optimalNutritionContent')}</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('optimalNutritionStep1Title')}</h2>
          <p className="text-slate-600 mb-6">{t('optimalNutritionStep1Text')}</p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('optimalNutritionStep2Title')}</h2>
          <p className="text-slate-600 mb-6">{t('optimalNutritionStep2Text')}</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('optimalNutritionStep3Title')}</h2>
          <p className="text-slate-600 mb-6">{t('optimalNutritionStep3Text')}</p>
        </div>
      )
    },
    {
      id: 'preventing-bird-diseases',
      title: t('preventingDiseasesTitle'),
      description: t('preventingDiseasesDesc'),
      content: (
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-black mb-8">{t('preventingDiseasesTitle')}</h1>
          <p className="text-lg text-slate-600 mb-8">{t('preventingDiseasesContent')}</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('preventingDiseasesStep1Title')}</h2>
          <p className="text-slate-600 mb-6">{t('preventingDiseasesStep1Text')}</p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('preventingDiseasesStep2Title')}</h2>
          <p className="text-slate-600 mb-6">{t('preventingDiseasesStep2Text')}</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('preventingDiseasesStep3Title')}</h2>
          <p className="text-slate-600 mb-6">{t('preventingDiseasesStep3Text')}</p>
        </div>
      )
    }
  ];

  const currentArticle = articles.find(a => a.id === id);

  if (id && !currentArticle) {
    return <Navigate to="/advice" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(id ? '/advice' : '/')} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            {id ? t('backToAdvice') : t('backToHome')}
          </button>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
            {id ? currentArticle?.title : t('expertAdvice')}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            {id ? currentArticle?.description : t('adviceSubtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {id ? (
          <div className="max-w-4xl mx-auto">
            {currentArticle?.content}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <div 
                key={article.id}
                onClick={() => navigate(`/advice/${article.id}`)}
                className="group cursor-pointer bg-slate-50 rounded-[2.5rem] p-8 border-2 border-transparent hover:border-indigo-600 transition-all flex flex-col h-full"
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-slate-500 mb-8 line-clamp-3 flex-1">
                  {article.description}
                </p>
                <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-xs">
                  {t('readMore')}
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
