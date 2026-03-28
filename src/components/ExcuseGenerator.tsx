import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RefreshCcw, Lock } from 'lucide-react';

export function ExcuseGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [excuse, setExcuse] = useState<string | null>(null);

  const generateExcuse = () => {
    setIsGenerating(true);
    setExcuse(null);
    
    // Fake generation delay
    setTimeout(() => {
      const excuses = [
        "Juro que anotei na agenda, mas o app do Google fechou sozinho.",
        "A tia do café me parou pra contar da cirurgia da vizinha.",
        "Meu pneu não furou, mas o carro fez um barulho estranho e eu fiquei com medo.",
        "Eu lembrei! Mas achei que se eu fizesse agora ia estragar a surpresa que tô bolando pra 2029."
      ];
      setExcuse(excuses[Math.floor(Math.random() * excuses.length)]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-card to-brand-dark border border-brand-lilac/20 p-5 mt-6 group">
      {/* Premium Badge */}
      <div className="absolute top-0 right-0 py-1 px-3 bg-brand-warning/20 rounded-bl-xl border-l border-b border-brand-warning/20">
        <span className="text-[10px] font-black text-brand-warning tracking-widest flex items-center shadow-[0_0_10px_rgba(255,149,0,0.5)]">
          <Lock className="w-3 h-3 mr-1" /> PRO
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center text-white">
          <Wand2 className="w-5 h-5 mr-2 text-brand-pink" />
          IA de Desculpas Prontas
        </h3>
        <p className="text-sm text-white/50">Gerador plausível de historinhas (Powered by Claude)</p>
      </div>

      <button 
        onClick={generateExcuse}
        disabled={isGenerating}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-lilac to-brand-pink text-white font-bold tracking-wide flex items-center justify-center relative shadow-[0_5px_20px_rgba(255,97,166,0.3)] hover:shadow-[0_5px_30px_rgba(255,97,166,0.5)] transition-shadow overflow-hidden"
      >
        <span className="relative z-10 flex items-center">
          {isGenerating ? (
            <>
              <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
              Inventando algo crível...
            </>
          ) : (
            'Me salva, por favor'
          )}
        </span>
        
        {/* Shimmer effect */}
        {!isGenerating && (
          <motion.div
            className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-30"
            animate={{ left: '200%' }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
        )}
      </button>

      <AnimatePresence>
        {excuse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-sm italic text-white/90">"{excuse}"</p>
            <div className="mt-3 flex space-x-2">
              <button className="flex-1 py-1.5 rounded-md bg-white/10 text-xs font-semibold text-white/80 hover:bg-white/20 transition-colors">
                Copiar
              </button>
              <button onClick={generateExcuse} className="p-1.5 rounded-md bg-white/10 text-white/80 hover:bg-white/20 transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
