import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface WifePinGateProps {
  storedPin: string | null;
  onPinSet: (pin: string) => void;
  children: React.ReactNode;
}

export function WifePinGate({ storedPin, onPinSet, children }: WifePinGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const pinData = typeof storedPin === 'string' ? storedPin : '';
  const [isSettingMode, setIsSettingMode] = useState(!pinData);

  useEffect(() => {
    setIsSettingMode(!pinData);
  }, [pinData]);

  const handleCharClick = (char: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + char);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length !== 4) return;

    if (isSettingMode) {
      onPinSet(pin);
      setIsUnlocked(true);
    } else {
      if (pin === storedPin) {
        setIsUnlocked(true);
      } else {
        setError(true);
        setPin('');
      }
    }
  };

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="max-w-md mx-auto min-h-[60vh] flex flex-col items-center justify-center p-6 bg-brand-dark/50 backdrop-blur-xl border border-red-500/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(220,38,38,0.1)] relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center relative z-10 w-full"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 mb-4 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            {isSettingMode ? <Lock className="w-8 h-8 text-red-500" /> : <Shield className="w-8 h-8 text-red-500" />}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
            {isSettingMode ? 'Configurar Pin de Acesso' : 'Área Restrita (Patroa)'}
          </h2>
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em] mt-2">
            {isSettingMode ? 'Escolha 4 dígitos para segurança extrema' : 'Acesso Biométrico ou Pin Necessário'}
          </p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-12 h-16 border-2 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                error 
                  ? 'border-red-500 bg-red-500/20' 
                  : (pin && pin[i]) 
                    ? 'border-red-500 bg-red-500/10 text-white' 
                    : 'border-white/10 bg-white/5'
              }`}
            >
              {(pin && pin[i]) ? (
                <div className="w-3 h-3 bg-white rounded-full" />
              ) : null}
            </div>
          ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs font-bold text-red-400">Senha incorreta. O marido foi notificado da tentativa de invasão (mentira, mas quase).</p>
          </motion.div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button 
              key={num}
              onClick={() => handleCharClick(num)}
              className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xl font-black transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button 
             onClick={handleBackspace}
             className="py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-sm font-black uppercase tracking-widest text-red-400 active:scale-95"
          >
            DEL
          </button>
          <button 
             onClick={() => handleCharClick('0')}
             className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xl font-black transition-all active:scale-95"
          >
            0
          </button>
          <button 
             onClick={handleSubmit}
             disabled={pin.length !== 4}
             className={`py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center ${
               pin.length === 4 
                 ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                 : 'bg-white/5 text-white/20'
             }`}
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>

        {!isSettingMode && (
          <p className="mt-8 text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">
            Identificação biométrica (fingida) solicitada
          </p>
        )}
      </motion.div>
    </div>
  );
}
