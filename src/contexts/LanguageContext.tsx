import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../translations';

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string | any, params?: any) => string;
}>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('petsbird_lang');
    return (saved as Language) || 'en';
  });
  
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('petsbird_lang', lang);
  };

  const t = (key: string | any, params?: any) => {
    let text = translations[language]?.[key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{{${param}}}`, params[param]);
      });
    }
    return text;
  };

  useEffect(() => {
    document.dir = language === 'ar' || language === 'darija' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
