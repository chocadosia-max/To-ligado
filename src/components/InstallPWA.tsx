import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If it's iOS, we can detect and show a custom message since iOS doesn't support beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIOS && !isStandalone) {
       // Optional: for iOS we could show a different prompt, but for now we focus on standard PWA prompt.
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100]"
        >
          <div className="bg-gradient-to-r from-brand-lilac to-brand-pink p-[1px] rounded-2xl shadow-[0_0_30px_rgba(255,97,166,0.5)]">
            <div className="bg-brand-dark/95 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-lilac to-brand-pink flex items-center justify-center shadow-lg shrink-0">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white leading-tight">Instalar Aplicativo</h4>
                  <p className="text-[10px] font-bold text-white/60 mt-0.5">Acesso rápido no seu celular</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/90 active:scale-95 transition-all"
                >
                  Baixar
                </button>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="p-2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
