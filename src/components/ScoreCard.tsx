import { motion } from 'framer-motion';
import { Skull, TrendingUp, AlertTriangle } from 'lucide-react';

interface ScoreProps {
  score: number;
}

export function ScoreCard({ score }: ScoreProps) {
  const isDanger = score < 0;

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative overflow-hidden rounded-3xl p-6 ${
        isDanger 
          ? 'bg-gradient-to-br from-brand-danger/20 to-brand-dark border border-brand-danger/50 shadow-[0_0_30px_rgba(255,59,48,0.3)]' 
          : 'bg-brand-card shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/5'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest">Placar do Marido</h2>
          <div className="flex items-baseline mt-1 space-x-2">
            <span className={`text-5xl font-bold tracking-tighter ${isDanger ? 'text-brand-danger' : 'text-white'}`}>
              {score}
            </span>
            <span className="text-sm text-white/40">pts</span>
          </div>
        </div>
        
        {isDanger ? (
          <motion.div 
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="p-3 bg-brand-danger/20 rounded-2xl"
          >
            <Skull className="w-8 h-8 text-brand-danger" />
          </motion.div>
        ) : (
          <div className="p-3 bg-brand-lilac/10 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-brand-lilac" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-sm text-white/70 italic flex items-center">
          {isDanger ? (
            <>
              <AlertTriangle className="w-4 h-4 mr-2 text-brand-warning inline" />
              "Eu não tô brava, tô decepcionada."
            </>
          ) : (
            <>
              "Milagre. Lembra de lavar a louça."
            </>
          )}
        </p>
      </div>

      {score >= 200 && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 p-4 bg-brand-success/20 border border-brand-success/50 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-3 text-brand-success" />
            <span className="text-xs font-bold text-brand-success uppercase tracking-tighter">Prêmio Liberado! Vá resgatar.</span>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity }}
            className="w-2 h-2 bg-brand-success rounded-full shadow-[0_0_10px_rgba(52,199,89,0.8)]" 
          />
        </motion.div>
      )}
      
      {/* Background glow for style */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full ${isDanger ? 'bg-brand-danger/30' : 'bg-brand-lilac/20'}`} />
    </motion.div>
  );
}
