import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';
import { Button } from './ui/Button';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { cn } from '../lib/utils';

interface StaticPageProps {
  type: string;
  user: any;
  userProfile: UserProfile | null;
}

export const StaticPage: React.FC<StaticPageProps> = ({ type, user, userProfile }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';
  
  const content: Record<string, { title: string, subtitle: string, body: React.ReactNode }> = {
    news: {
      title: t('latestAviaryNews'),
      subtitle: t('stayUpdatedNews'),
      body: (
        <div className="space-y-12">
          {[
            { date: t('newsDate1'), title: t('newsTitle1'), excerpt: t('newsExcerpt1') },
            { date: t('newsDate2'), title: t('newsTitle2'), excerpt: t('newsExcerpt2') },
            { date: t('newsDate3'), title: t('newsTitle3'), excerpt: t('newsExcerpt3') },
            { date: t('newsDate4'), title: t('newsTitle4'), excerpt: t('newsExcerpt4') }
          ].map((item, i) => (
            <article key={i} className="border-b border-slate-100 pb-8">
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{item.date}</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">{item.excerpt}</p>
              <Button variant="ghost" className="text-indigo-600 p-0 font-bold">{t('readMore')} →</Button>
            </article>
          ))}
        </div>
      )
    },
    about: {
      title: t('aboutTitle'),
      subtitle: t('aboutSubtitle'),
      body: (
        <div className="space-y-8">
          <p className="text-slate-600 text-lg leading-relaxed">
            {t('aboutDesc')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-8 bg-slate-50 rounded-3xl">
              <h4 className="font-bold text-slate-900 mb-2">{t('ourVision')}</h4>
              <p className="text-slate-600 text-sm">{t('ourVisionDesc')}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl">
              <h4 className="font-bold text-slate-900 mb-2">{t('ourValues')}</h4>
              <p className="text-slate-600 text-sm">{t('ourValuesDesc')}</p>
            </div>
          </div>
        </div>
      )
    },
    contact: {
      title: t('contactUs'),
      subtitle: t('contactSubtitle'),
      body: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Mail size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">{t('emailSupport')}</p>
                <p className="text-slate-500">support@petsbird.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <Phone size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">{t('phoneSupport')}</p>
                <p className="text-slate-500">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">{t('headquarters')}</p>
                <p className="text-slate-500">123 Aviary Way, Bird City, BC 12345</p>
              </div>
            </div>
          </div>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert(t('messageSent')); }}>
            <input type="text" placeholder={t('yourName')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" required />
            <input type="email" placeholder={t('emailAddress')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" required />
            <textarea placeholder={t('yourMessage')} rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" required></textarea>
            <Button variant="primary" type="submit" className="w-full py-4">{t('sendMessage')}</Button>
          </form>
        </div>
      )
    },
    terms: {
      title: t('termsConditions'),
      subtitle: t('termsSubtitle'),
      body: (
        <div className="prose prose-slate max-w-none">
          <p>{t('termsText')}</p>
          <h4 className="font-bold mt-6">{t('termsSection1Title')}</h4>
          <p>{t('termsSection1Text')}</p>
          <h4 className="font-bold mt-6">{t('termsSection2Title')}</h4>
          <p>{t('termsSection2Text')}</p>
        </div>
      )
    },
    privacy: {
      title: t('privacyPolicy'),
      subtitle: t('privacySubtitle'),
      body: (
        <div className="prose prose-slate max-w-none">
          <p>{t('privacyText')}</p>
          <h4 className="font-bold mt-6">{t('privacySection1Title')}</h4>
          <p>{t('privacySection1Text')}</p>
          <h4 className="font-bold mt-6">{t('privacySection2Title')}</h4>
          <p>{t('privacySection2Text')}</p>
        </div>
      )
    },
    complaints: {
      title: t('complaintsProcedure'),
      subtitle: t('complaintsSubtitle'),
      body: (
        <div className="space-y-6">
          <p className="text-slate-600">{t('complaintsText')}</p>
          <ol className="list-decimal list-inside space-y-4 text-slate-600">
            <li>{t('complaintsStep1')}</li>
            <li>{t('complaintsStep2')}</li>
            <li>{t('complaintsStep3')}</li>
            <li>{t('complaintsStep4')}</li>
          </ol>
        </div>
      )
    },
    disclaimer: {
      title: t('disclaimer'),
      subtitle: t('disclaimerSubtitle'),
      body: (
        <div className="prose prose-slate max-w-none">
          <p>{t('disclaimerText')}</p>
          <p className="mt-4 italic">{t('vetAdviceDisclaimer')}</p>
        </div>
      )
    },
    accessibility: {
      title: t('accessibility'),
      subtitle: t('accessibilitySubtitle'),
      body: (
        <div className="space-y-6">
          <p className="text-slate-600">{t('accessibilityDesc')}</p>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>{t('accessibilityPoint1')}</li>
            <li>{t('accessibilityPoint2')}</li>
            <li>{t('accessibilityPoint3')}</li>
          </ul>
        </div>
      )
    },
    sitemap: {
      title: t('sitemap'),
      subtitle: t('sitemapSubtitle'),
      body: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4 className="font-bold text-slate-900 mb-4">{t('mainPages')}</h4>
            <ul className="space-y-2 text-indigo-600">
              <li><button onClick={() => navigate('/')}>{t('home')}</button></li>
              <li><button onClick={() => navigate('/dashboard')}>{t('birdControl')}</button></li>
              <li><button onClick={() => navigate('/advice')}>{t('advice')}</button></li>
              <li><button onClick={() => navigate('/news')}>{t('news')}</button></li>
              <li><button onClick={() => navigate('/about')}>{t('aboutUs')}</button></li>
              <li><button onClick={() => navigate('/contact')}>{t('contactUs')}</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">{t('legal')}</h4>
            <ul className="space-y-2 text-indigo-600">
              <li><button onClick={() => navigate('/terms')}>{t('termsConditions')}</button></li>
              <li><button onClick={() => navigate('/privacy')}>{t('privacyPolicy')}</button></li>
              <li><button onClick={() => navigate('/disclaimer')}>{t('disclaimer')}</button></li>
              <li><button onClick={() => navigate('/complaints')}>{t('complaintsProcedure')}</button></li>
              <li><button onClick={() => navigate('/accessibility')}>{t('accessibility')}</button></li>
            </ul>
          </div>
        </div>
      )
    }
  };

  const page = content[type] || content.about;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar user={user} userProfile={userProfile} />
      <main className="pt-24 sm:pt-40 pb-16 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight text-slate-900">{page.title}</h1>
            <p className="text-base sm:text-xl text-slate-500 leading-relaxed">{page.subtitle}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-100 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 shadow-2xl shadow-slate-100/50"
          >
            {page.body}
          </motion.div>
          
          <div className="mt-10 sm:mt-16 text-center">
            <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} className={cn(isRTL && "rotate-180")} /> {t('goBack')}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
