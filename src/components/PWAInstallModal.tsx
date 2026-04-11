import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { Button } from './ui/Button';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  onInstall: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  onInstall
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 sm:p-10">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Download size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Install PetsBird</h3>
                  <p className="text-slate-500">Access your aviary faster and offline.</p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-6">
                  <p className="text-slate-600 leading-relaxed text-center font-medium">
                    To install on iPhone/iPad:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Share size={20} className="text-blue-500" />
                      </div>
                      <p className="text-sm text-slate-600">
                        Tap <strong>Share</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <PlusSquare size={20} className="text-slate-700" />
                      </div>
                      <p className="text-sm text-slate-600">
                        Tap <strong>Add to Home Screen</strong>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-600 leading-relaxed text-center font-medium">
                    Install for the best experience:
                  </p>
                  
                  <Button 
                    variant="primary" 
                    className="w-full py-5 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                    onClick={onInstall}
                  >
                    Install Now
                  </Button>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 text-center mb-3">Manual Install:</p>
                    <p className="text-xs text-slate-600 text-center">
                      Open browser menu <span className="font-bold">⋮</span> and select <span className="font-bold">"Install app"</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
