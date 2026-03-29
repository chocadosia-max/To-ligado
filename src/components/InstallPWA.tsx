import { useState, useEffect } from 'react';
import { Download, Share } from 'lucide-react';

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const checkIsIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (checkIsIOS && !isStandalone) {
       setIsIOS(true);
       setIsVisible(true);
    }

    if (isStandalone) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("Para instalar no iPhone/iPad:\n\n1. Toque no botão de Compartilhar do Safari (canto inferior).\n2. Escolha 'Adicionar à Tela de Início'.");
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

  if (!isVisible) return null;

  return (
    <button 
      onClick={handleInstallClick}
      className="flex flex-col items-center lg:flex-row lg:justify-start lg:w-full lg:px-4 space-y-1 lg:space-y-0 lg:space-x-3 transition-colors p-2 rounded-xl text-brand-success hover:bg-brand-success/10 font-bold"
    >
      {isIOS ? <Share className="w-6 h-6 lg:w-5 lg:h-5" /> : <Download className="w-6 h-6 lg:w-5 lg:h-5" />}
      <span className="text-[10px] lg:text-sm font-bold min-w-max">Baixar App</span>
    </button>
  );
}

