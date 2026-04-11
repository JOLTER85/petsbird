import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bird as BirdIcon, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-12 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0056b3] rounded-lg sm:rounded-xl flex items-center justify-center text-white">
                <BirdIcon size={18} />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900">PetsBird.com</span>
            </div>
            <p className="text-slate-500 max-w-md text-base sm:text-lg leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4 sm:mb-6 uppercase tracking-wider text-xs sm:text-sm">{t('quickLinks')}</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-[#0056b3] transition-colors text-sm sm:text-base">{t('birdControlTitle')}</button></li>
              <li><button onClick={() => navigate('/advice')} className="text-slate-500 hover:text-[#0056b3] transition-colors text-sm sm:text-base">{t('adviceTips')}</button></li>
              <li><button onClick={() => navigate('/news')} className="text-slate-500 hover:text-[#0056b3] transition-colors text-sm sm:text-base">{t('latestNews')}</button></li>
              <li><button onClick={() => navigate('/about')} className="text-slate-500 hover:text-[#0056b3] transition-colors text-sm sm:text-base">{t('aboutUs')}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4 sm:mb-6 uppercase tracking-wider text-xs sm:text-sm">{t('contactUs')}</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-center gap-3 text-slate-500 text-sm sm:text-base">
                <Phone size={16} className="text-[#0056b3]" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 cursor-pointer text-sm sm:text-base" onClick={() => navigate('/contact')}>
                <Mail size={16} className="text-[#0056b3]" />
                <span>support@petsbird.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 sm:pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            © {new Date().getFullYear()} PetsBird.com. {t('allRightsReserved')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {[
              { name: t('terms'), path: '/terms' },
              { name: t('complaints'), path: '/complaints' },
              { name: t('disclaimer'), path: '/disclaimer' },
              { name: t('privacyPolicy'), path: '/privacy' },
              { name: t('accessibility'), path: '/accessibility' },
              { name: t('sitemap'), path: '/sitemap' },
            ].map((link) => (
              <button 
                key={link.name} 
                onClick={() => navigate(link.path)}
                className="text-slate-400 hover:text-[#0056b3] transition-colors text-xs sm:text-sm font-medium"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
