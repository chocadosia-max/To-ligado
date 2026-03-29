import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Wine, Utensils, Sparkles, LockKeyhole, Heart } from 'lucide-react';

interface WifeRewardsProps {
  score: number;
}

export function WifeRewards({ score }: WifeRewardsProps) {
  const [activeReward, setActiveReward] = useState<number | null>(null);

  const rewards = [
    { id: 1, title: 'Cupom iFood: Pizza e Paz', target: 200, icon: <Utensils className="w-5 h-5" />, code: 'COMPREIPAZ20' },
    { id: 2, title: 'Noite de Vinho Caro', target: 500, icon: <Wine className="w-5 h-5" />, code: 'MEPERDOA50' },
    { id: 3, title: 'Spa Day Completo', target: 1000, icon: <Sparkles className="w-5 h-5" />, code: 'VALEMILAGRE' },
  ];

  const highestUnlocked = Math.max(...rewards.filter(r => score >= r.target).map(r => r.target), 0);
  const nextMilestone = rewards.find(r => r.target > score);

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setActiveReward(id);
    setTimeout(() => setActiveReward(null), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-brand-lilac/5 to-transparent border border-brand-lilac/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl mt-8">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-pink/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center bg-gradient-to-r from-brand-pink to-brand-lilac text-transparent bg-clip-text">
            <Gift className="w-6 h-6 mr-3 text-brand-pink" />
            Recompensa Real (Para Ela)
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-sm">
            Chegue ao "Score de Elite" para liberar cupons de desculpas em parceiros (Vinho, iFood, Spa). Ela decide o que quer.
          </p>
        </div>
        
        {nextMilestone ? (
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Próxima Recompensa</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-warning font-black">{score.toLocaleString()}</span>
              <span className="text-white/20">/</span>
              <span className="text-lg text-white font-black">{nextMilestone.target.toLocaleString()} pts</span>
            </div>
            <div className="w-full bg-white/5 h-2 mt-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(score / nextMilestone.target) * 100}%` }}
                className="bg-brand-warning h-full rounded-full"
              />
            </div>
          </div>
        ) : (
          <div className="text-right flex flex-col items-end">
             <Heart className="w-8 h-8 text-brand-pink animate-pulse mb-2" />
             <p className="text-xs font-bold text-brand-pink uppercase tracking-widest">Master Elite Atingido</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {rewards.map((reward, i) => {
          const isUnlocked = score >= reward.target;
          
          return (
            <motion.div 
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileHover={isUnlocked ? { scale: 1.02, y: -5 } : {}}
              className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 ${
                isUnlocked 
                  ? reward.target === highestUnlocked 
                    ? 'bg-gradient-to-b from-brand-pink/20 to-black/40 border-brand-pink/50 shadow-[0_0_30px_rgba(255,97,166,0.2)] cascade-glow'
                    : 'bg-black/40 border-brand-success/30 hover:border-brand-success/50'
                  : 'bg-black/60 border-white/5 opacity-80 grayscale-[50%]'
              }`}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] z-20">
                  <div className="flex flex-col items-center">
                    <LockKeyhole className="w-8 h-8 text-white/20 mb-2" />
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                      Requer {reward.target} pts
                    </span>
                  </div>
                </div>
              )}

              <div className={`p-3 rounded-xl mb-4 inline-block ${
                isUnlocked ? 'bg-gradient-to-br from-brand-pink to-brand-lilac text-white shadow-lg shadow-brand-pink/20' : 'bg-white/5 text-white/40'
              }`}>
                {reward.icon}
              </div>

              <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
              <p className="text-xs text-white/50 mb-4 line-clamp-2">
                Libere e aplique o código na hora do checkout. 
              </p>

              <button 
                onClick={() => handleCopy(reward.code, reward.id)}
                disabled={!isUnlocked}
                className={`w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                  isUnlocked 
                    ? activeReward === reward.id 
                      ? 'bg-brand-success text-black' 
                      : 'bg-white/10 hover:bg-brand-pink text-white hover:shadow-[0_0_15px_rgba(255,97,166,0.5)]'
                    : 'bg-transparent text-white/20'
                }`}
              >
                {activeReward === reward.id ? 'Código Copiado' : isUnlocked ? 'Resgatar Código' : 'Bloqueado'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
