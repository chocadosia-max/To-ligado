import { useState, useEffect } from 'react';
import { Download, Share } from 'lucide-react';

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const checkIsIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIsIOS);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("Para instalar no iPhone/iPad:\n\n1. Toque no botão de Compartilhar do Safari (canto inferior).\n2. Escolha 'Adicionar à Tela de Início'.");
      return;
    }

    if (!deferredPrompt) {
       alert("No seu celular (Android): Vá no menu do Chrome (3 pontos no canto superior direito) e procure por 'Adicionar à tela inicial' ou 'Instalar Aplicativo'.\n\n[AVISO]: NÃO clique na setinha de download do meio, procure pela opção escrita!");
       return;
    }
    
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    
    // reset prompt
    setDeferredPrompt(null);
  };

  if (compact) {
    return (
      <button 
        onClick={handleInstallClick}
        className="p-2 rounded-full bg-brand-success/20 hover:bg-brand-success/40 transition-colors pointer-events-auto shadow-lg shadow-brand-success/20 animate-pulse"
      >
        <Download className="w-5 h-5 text-brand-success" />
      </button>
    );
  }

  return (
    <button 
      onClick={handleInstallClick}
      className="hidden md:flex flex-col items-center lg:flex-row lg:justify-start lg:w-full lg:px-4 space-y-1 lg:space-y-0 lg:space-x-3 transition-colors p-2 rounded-xl text-brand-success hover:bg-brand-success/10 font-bold"
    >
      {isIOS ? <Share className="w-6 h-6 lg:w-5 lg:h-5" /> : <Download className="w-6 h-6 lg:w-5 lg:h-5" />}
      <span className="text-[10px] lg:text-sm font-bold min-w-max">Baixar App</span>
    </button>
  );
}

