import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bird as BirdIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';
import { Button } from './ui/Button';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  user: any;
  userProfile: UserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user, userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('birdControl'), path: '/dashboard' },
    { name: t('advice'), path: '/advice' },
    { name: t('news'), path: '/news' },
    { name: t('aboutUs'), path: '/about' },
    { name: t('contactUs'), path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0056b3] rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <BirdIcon size={18} />
          </div>
          <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">PetsBird<span className="text-[#28a745]">.com</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8 text-slate-600 font-semibold">
          {navLinks.map((link) => (
            <button key={link.name} onClick={() => navigate(link.path)} className="hover:text-[#0056b3] transition-colors">{link.name}</button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSelector />
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" className="text-slate-600 font-bold" onClick={() => navigate('/dashboard')}>{t('dashboard')}</Button>
                <div 
                  className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold cursor-pointer hover:ring-2 hover:ring-indigo-500/20 transition-all"
                  onClick={() => navigate('/dashboard/settings')}
                >
                  {userProfile?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" className="text-slate-600 font-bold" onClick={() => navigate('/auth')}>{t('login')}</Button>
                <Button variant="primary" className="bg-[#0056b3] hover:bg-[#004494]" onClick={() => navigate('/auth')}>{t('startNow')}</Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="flex flex-col p-4 sm:p-6 gap-3 sm:gap-4">
              {navLinks.map((link) => (
                <button 
                  key={link.name} 
                  onClick={() => { navigate(link.path); setIsMenuOpen(false); }} 
                  className="text-left py-2.5 sm:py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition-all text-sm sm:text-base"
                >
                  {link.name}
                </button>
              ))}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 sm:mt-4 pt-4 sm:pt-6 border-t border-slate-100">
                {user ? (
                  <>
                    <Button variant="ghost" className="w-full py-3 sm:py-4 text-sm sm:text-base" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}>{t('dashboard')}</Button>
                    <Button variant="primary" className="w-full py-3 sm:py-4 bg-[#0056b3] text-sm sm:text-base" onClick={() => { navigate('/dashboard/settings'); setIsMenuOpen(false); }}>{t('settings')}</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full py-3 sm:py-4 text-sm sm:text-base" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>{t('login')}</Button>
                    <Button variant="primary" className="w-full py-3 sm:py-4 bg-[#0056b3] text-sm sm:text-base" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>{t('startNow')}</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
