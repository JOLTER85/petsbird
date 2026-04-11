import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Activity, 
  Shield, 
  Info, 
  Newspaper, 
  ArrowRight,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';
import { Button } from './ui/Button';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { cn } from '../lib/utils';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface LandingPageProps {
  user: any;
  userProfile: UserProfile | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user, userProfile }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isInstallable, installPWA, isIOS, isStandalone, hasPrompt } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const isRTL = language === 'ar' || language === 'darija';

  const handleInstallClick = async () => {
    const isInsideIframe = window.self !== window.top;
    
    if (isInsideIframe) {
      window.open(window.location.href, '_blank');
      return;
    }

    if (isIOS) {
      setIsModalOpen(true);
      return;
    }
    
    if (hasPrompt) {
      const success = await installPWA();
      if (!success) setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };
  
  return (
    <div className="bg-white min-h-screen text-slate-900 overflow-hidden font-sans">
      <Navbar user={user} userProfile={userProfile} />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs sm:text-sm font-bold mb-6 sm:mb-8">
              <CheckCircle2 size={16} />
              <span>{t('trustedBy')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 sm:mb-8 leading-[1.1] tracking-tight text-slate-900">
              {t('heroTitle')}
            </h1>
            <p className="text-base sm:text-xl text-slate-600 mb-8 sm:mb-10 leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button 
                variant="primary" 
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg bg-[#0056b3] hover:bg-[#004494]" 
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
              >
                {t('getStarted')}
              </Button>
              <Button variant="outline" className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg border-[#0056b3] text-[#0056b3] hover:bg-blue-50" onClick={() => navigate('/advice')}>
                {t('viewSolutions')}
              </Button>
            </div>

            {!isStandalone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all group"
                >
                  <Download size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Download App</span>
                </button>
              </motion.div>
            )}
            
            <div className="mt-10 sm:mt-12 flex items-center gap-6 sm:gap-8">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-slate-900">99.9%</span>
                <span className="text-[10px] sm:text-sm text-slate-500 font-medium">{t('accuracyRate')}</span>
              </div>
              <div className="w-px h-8 sm:h-10 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-slate-900">24/7</span>
                <span className="text-[10px] sm:text-sm text-slate-500 font-medium">{t('expertSupport')}</span>
              </div>
              <div className="w-px h-8 sm:h-10 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-slate-900">5k+</span>
                <span className="text-[10px] sm:text-sm text-slate-500 font-medium">{t('birdsManaged')}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-blue-100/50 blur-3xl rounded-full -z-10"></div>
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white"
            >
              <img 
                src="https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=1000" 
                alt="Professional Bird Management" 
                className="w-full h-[300px] sm:h-[600px] object-cover hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            {/* Floating Card */}
            <motion.div 
              animate={{ 
                y: [0, 15, 0],
                x: [0, -10, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className={cn(
                "absolute -bottom-6 sm:-bottom-10 bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-slate-100 max-w-[180px] sm:max-w-xs hidden xs:block",
                isRTL ? "-right-6 sm:-right-10" : "-left-6 sm:-left-10"
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 text-green-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{t('healthMonitor')}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">{t('realTimeTracking')}</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[85%]"></div>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-700">85% {t('optimalCondition')}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-[#0056b3] font-bold uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4">{t('ourSolutions')}</h2>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-6 text-slate-900 tracking-tight">{t('expertManagement')}</h2>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
              {t('solutionsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                title: t('birdControlTitle'), 
                desc: t('birdControlDesc'), 
                icon: Shield, 
                color: "bg-blue-50 text-[#0056b3]" 
              },
              { 
                title: t('expertAdvice'), 
                desc: t('adviceDesc'), 
                icon: Info, 
                color: "bg-green-50 text-[#28a745]" 
              },
              { 
                title: t('latestNews'), 
                desc: t('latestNewsDesc'), 
                icon: Newspaper, 
                color: "bg-orange-50 text-orange-600" 
              }
            ].map((solution, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-2xl transition-all"
              >
                <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8", solution.color)}>
                  <solution.icon size={32} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900">{solution.title}</h3>
                <p className="text-slate-500 leading-relaxed text-base sm:text-lg mb-6">{solution.desc}</p>
                <button 
                  onClick={() => navigate(i === 2 ? '/news' : '/advice')}
                  className="inline-flex items-center gap-2 text-[#0056b3] font-bold hover:gap-3 transition-all text-sm sm:text-base"
                >
                  {t('learnMore')} <ArrowRight size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto bg-[#0056b3] rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 blur-[80px] sm:blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-6xl font-extrabold mb-6 sm:mb-8 tracking-tight">{t('readyToOptimize')}</h2>
            <p className="text-blue-100 text-lg sm:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              {t('joinThousands')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Button variant="primary" className="w-full sm:w-auto bg-white text-[#0056b3] hover:bg-blue-50 px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg" onClick={() => navigate('/auth')}>
                {t('startNowFree')}
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto text-white hover:bg-white/10 px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg border border-white/20" onClick={() => navigate('/contact')}>
                {t('contactSales')}
              </Button>
            </div>
            
            {!isStandalone && (
              <div className="mt-8">
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-2xl font-bold text-lg shadow-xl hover:bg-green-50 transition-all group"
                >
                  <Download size={22} className="group-hover:scale-110 transition-transform" />
                  <span>Download App Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <PWAInstallModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isIOS={isIOS}
        onInstall={installPWA}
      />
      <Footer />
    </div>
  );
};
