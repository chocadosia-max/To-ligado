import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Baby, HeartPulse, MessagesSquare, Check } from 'lucide-react';

interface PaiPresenteProps {
  sarcasmLevel: number;
  onAction: (tag: string, content: string, status: 'pending'|'critical'|'done') => void;
}

export function PaiPresenteMode({ sarcasmLevel, onAction }: PaiPresenteProps) {
  const [isActive, setIsActive] = useState(false);
  const [copiedAction, setCopiedAction] = useState<number | null>(null);

  const quickActions = [
    { id: 1, label: 'Elogiar paciência', icon: <HeartPulse className="w-4 h-4 text-brand-pink" />, msg: 'Amor, vi o quanto você foi paciente hoje. Você é incrivel, descansa um pouco.' },
    { id: 2, label: 'Assumir B.O.', icon: <Shield className="w-4 h-4 text-brand-lilac" />, msg: 'Deixa que eu resolvo a lição de casa hoje, vai tomar um vinho.' },
    { id: 3, label: 'Pergunta Isenta', icon: <MessagesSquare className="w-4 h-4 text-brand-success" />, msg: 'Criança já comeu ou eu peço algo pra gente agora?' }
  ];

  const handleToggle = () => {
    setIsActive(!isActive);
    if (!isActive) {
      onAction('Pai Presente', 'Modo de Sobrevivência Paterna ATIVADO.', 'critical');
    } else {
      onAction('Pai Presente', 'Retornou ao modo default (Ignorância).', 'done');
    }
  };

  const handleCopy = (action: typeof quickActions[0]) => {
    navigator.clipboard.writeText(action.msg);
    setCopiedAction(action.id);
    onAction('Pai Presente', `Enviou: "${action.label}"`, 'done');
    
    setTimeout(() => {
      setCopiedAction(null);
    }, 2000);
  };

  return (
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`p-4 rounded-3xl border transition-all duration-300 w-full ${
        isActive 
          ? 'bg-gradient-to-b from-brand-lilac/30 to-brand-card shadow-[0_0_30px_rgba(180,159,220,0.3)] border-brand-lilac/50' 
          : 'bg-gradient-to-r from-brand-lilac/10 to-brand-pink/10 border-brand-lilac/20 hover:border-brand-lilac/40 shadow-lg'
      }`}
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            animate={isActive ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 3 }}
            className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-brand-lilac text-white shadow-[0_0_15px_rgba(180,159,220,0.8)]' : 'bg-brand-lilac/20 text-brand-lilac'}`}
          >
            <Baby className="w-5 h-5" />
          </motion.div>
          <div>
            <h3 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Modo Pai Presente</h3>
            <p className={`text-xs font-bold tracking-widest uppercase mt-0.5 ${isActive ? 'text-brand-success' : 'text-white/40'}`}>
              {isActive ? 'RADAR LIGADO' : `Frequência: ${sarcasmLevel > 50 ? 'Humilhação' : 'Aviso'}`}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className={`w-12 h-6 md:w-14 md:h-7 shrink-0 rounded-full relative transition-colors duration-300 ease-in-out border ${
          isActive 
            ? 'bg-brand-success border-brand-success/50 shadow-[0_0_15px_rgba(0,255,100,0.4)]' 
            : 'bg-black/40 border-white/10'
        }`}>
          <motion.div 
            layout
            className={`absolute top-0.5 bottom-0.5 w-5 md:w-6 bg-white rounded-full shadow-md`}
            initial={false}
            animate={{
              left: isActive ? 'calc(100% - 2px)' : '2px',
              x: isActive ? '-100%' : '0%'
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-brand-lilac/20">
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-3">
                Ações Rápidas (Copiar para a Patroa)
              </p>
              
              <div className="space-y-2">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleCopy(action)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 hover:bg-black/50 hover:border-brand-lilac/30 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/5 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                        {copiedAction === action.id ? <Check className="w-4 h-4 text-brand-success" /> : action.icon}
                      </div>
                      <span className={`text-sm font-medium ${copiedAction === action.id ? 'text-brand-success' : 'text-white/80'}`}>
                        {copiedAction === action.id ? 'Copiado!' : action.label}
                      </span>
                    </div>
                    {copiedAction !== action.id && (
                      <span className="text-[10px] bg-brand-lilac/20 text-brand-lilac px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest">
                        Copiar Msg
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
