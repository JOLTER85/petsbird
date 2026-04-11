import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bird as BirdIcon, Egg as EggIcon, TrendingUp, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface AuthPageProps {
  onAuthSuccess: (email: string, pass: string, name?: string, aviary?: string) => Promise<void>;
  onGoogleLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onGoogleLogin }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', aviary: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await onAuthSuccess(formData.email, formData.password);
      } else {
        await onAuthSuccess(formData.email, formData.password, formData.name, formData.aviary);
      }
    } catch (err: any) {
      setError(err.message || t('authFailed'));
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError(t('enterEmailFirst'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetSent(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || t('authFailed'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6 font-sans">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-4 p-2">
          <div className="w-full h-full bg-[#f97316] rounded-2xl flex items-center justify-center text-white">
            <BirdIcon size={40} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">PetsBird</h1>
        <p className="text-slate-500 text-lg">— {t('heroSubtitle').split('.')[0]} —</p>
        
        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="flex flex-col items-center gap-1">
            <div className="text-[#00a86b]"><BirdIcon size={24} /></div>
            <span className="text-xs font-medium text-slate-500">{t('yourBirds')}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-[#00a86b]"><EggIcon size={24} /></div>
            <span className="text-xs font-medium text-slate-500">{t('nests')}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-[#00a86b]"><TrendingUp size={24} /></div>
            <span className="text-xs font-medium text-slate-500">{t('stats')}</span>
          </div>
        </div>
      </div>

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl p-6 sm:p-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{t('welcome')}</h2>
        <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8">{t('welcomeSubtitle')}</p>

        {/* Toggle */}
        <div className="bg-[#e5e7eb] p-1 rounded-xl sm:rounded-2xl flex mb-6 sm:mb-8">
          <button 
            onClick={() => setMode('signin')}
            className={cn(
              "flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all text-sm sm:text-base",
              mode === 'signin' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            )}
          >
            {t('signIn')}
          </button>
          <button 
            onClick={() => setMode('signup')}
            className={cn(
              "flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all text-sm sm:text-base",
              mode === 'signup' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            )}
          >
            {t('signUp')}
          </button>
        </div>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-900">{t('fullName')}</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full bg-[#eef2ff] border-none rounded-xl sm:rounded-2xl py-3.5 sm:py-4 px-5 sm:px-6 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-900">{t('aviaryName')}</label>
                <input
                  required
                  value={formData.aviary}
                  onChange={(e) => setFormData({ ...formData, aviary: e.target.value })}
                  placeholder={t('aviaryNamePlaceholder')}
                  className="w-full bg-[#eef2ff] border-none rounded-xl sm:rounded-2xl py-3.5 sm:py-4 px-5 sm:px-6 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-900">{t('email')}</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('emailPlaceholder')}
              className="w-full bg-[#eef2ff] border-none rounded-xl sm:rounded-2xl py-3.5 sm:py-4 px-5 sm:px-6 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-900">{t('password')}</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#eef2ff] border-none rounded-xl sm:rounded-2xl py-3.5 sm:py-4 px-5 sm:px-6 pr-14 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs sm:text-sm font-medium text-center">{error}</p>}
          {resetSent && <p className="text-green-600 text-xs sm:text-sm font-medium text-center">{t('resetEmailSent')}</p>}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00a86b] text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-[#008f5b] transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (mode === 'signin' ? t('signIn') : t('signUp'))}
          </button>

          <div className="text-center">
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className="text-[#00a86b] font-bold hover:underline text-xs sm:text-sm"
            >
              {t('forgotPassword')}
            </button>
          </div>
        </form>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-100">
          <button 
            onClick={onGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 sm:py-4 bg-white border border-slate-200 text-slate-700 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 text-sm sm:text-base"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            {t('signInWithGoogle')}
          </button>
        </div>
      </motion.div>
      
      <button 
        onClick={() => navigate('/')}
        className="mt-8 text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2"
      >
        <ArrowLeft size={18} />
        {t('backToHome')}
      </button>
    </div>
  );
};
