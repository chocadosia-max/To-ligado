import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, X } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Standard PWA (Android / Chrome)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect if already installed (Standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Detect iOS since it doesn't trigger beforeinstallprompt
    const checkIsIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (checkIsIOS && !isStandalone) {
       setIsIOS(true);
       setIsVisible(true);
    }

    // Hide if already in standalone mode
    if (isStandalone) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("Para instalar no iOS: toque no botão de Compartilhar do Safari (canto inferior) e escolha 'Adicionar à Tela de Início'.");
      return;
    }

    if (!deferredPrompt) {
       alert("Abra as opções do seu navegador Chrome e selecione 'Instalar Aplicativo'.");
       return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
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
                  <p className="text-[10px] font-bold text-white/60 mt-0.5">Acesso rápido no console</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/90 active:scale-95 transition-all flex items-center gap-1"
                >
                  {isIOS && <Share className="w-3 h-3" />}
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
