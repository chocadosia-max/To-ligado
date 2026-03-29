import { motion } from 'framer-motion';
import { Gift, LockKeyhole, Heart, CheckCircle2, Trophy } from 'lucide-react';

interface WifeRewardsProps {
  score: number;
  rewardOptions: string[];
  selectedReward: string | null;
  onSelectReward: (reward: string) => void;
}

export function WifeRewards({ score, rewardOptions, selectedReward, onSelectReward }: WifeRewardsProps) {
  const target = 200;
  const isUnlocked = score >= target;

  const rewards = rewardOptions.map((title, i) => ({
    id: i + 1,
    title,
    icon: i === 0 ? <Gift className="w-5 h-5" /> : i === 1 ? <Trophy className="w-5 h-5" /> : <Heart className="w-5 h-5" />
  }));

  return (
    <div className="bg-gradient-to-br from-brand-lilac/5 to-transparent border border-brand-lilac/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl mt-8">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-pink/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center bg-gradient-to-r from-brand-pink to-brand-lilac text-transparent bg-clip-text">
            <Gift className="w-6 h-6 mr-3 text-brand-pink" />
            Recompensa Real
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-sm">
            Atingiu {target} pontos? A Patroa liberou 3 escolhas. Escolha a sua recompensa com sabedoria.
          </p>
        </div>
        
        {!isUnlocked ? (
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Status do Resgate</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-warning font-black">{score.toLocaleString()}</span>
              <span className="text-white/20">/</span>
              <span className="text-lg text-white font-black">{target.toLocaleString()} pts</span>
            </div>
          </div>
        ) : (
          <div className="text-right flex flex-col items-end">
             <Trophy className="w-8 h-8 text-brand-success animate-bounce mb-2" />
             <p className="text-xs font-bold text-brand-success uppercase tracking-widest">Recompensa Liberada!</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {rewards.map((reward, i) => {
          const isSelected = selectedReward === reward.title;
          const otherSelected = selectedReward && !isSelected;
          
          return (
            <motion.div 
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileHover={isUnlocked && !otherSelected ? { scale: 1.02, y: -5 } : {}}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-b from-brand-success/20 to-black/40 border-brand-success/50 shadow-[0_0_30px_rgba(52,199,89,0.2)]'
                  : isUnlocked && !otherSelected
                    ? 'bg-black/40 border-white/10 hover:border-brand-pink/50'
                    : 'bg-black/60 border-white/5 opacity-80 grayscale-[50%]'
              }`}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] z-20">
                  <div className="flex flex-col items-center">
                    <LockKeyhole className="w-8 h-8 text-white/20 mb-2" />
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                       {target - score} pts restantes
                    </span>
                  </div>
                </div>
              )}

              {otherSelected && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-20">
                   <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Outro resgatado</span>
                </div>
              )}

              <div className={`p-3 rounded-xl mb-4 inline-block ${
                isUnlocked && !otherSelected ? 'bg-gradient-to-br from-brand-pink to-brand-lilac text-white' : 'bg-white/5 text-white/40'
              }`}>
                {reward.icon}
              </div>

              <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-brand-success' : ''}`}>{reward.title}</h3>
              <p className="text-xs text-white/50 mb-6">
                {isSelected ? 'Parabéns! Reivindique com ela agora.' : 'Opção definida pela Suprema Comandante.'}
              </p>

              <button 
                onClick={() => onSelectReward(reward.title)}
                disabled={!isUnlocked || (!!selectedReward && !isSelected)}
                className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                  isSelected 
                    ? 'bg-brand-success text-black' 
                    : isUnlocked && !otherSelected
                      ? 'bg-white/10 hover:bg-brand-pink text-white'
                      : 'bg-transparent text-white/20'
                }`}
              >
                {isSelected ? (
                   <>
                     <CheckCircle2 className="w-4 h-4" />
                     Resgatado
                   </>
                ) : 'Resgatar Este'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {!!selectedReward && (
        <motion.div 
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: 'auto' }}
           className="mt-6 p-4 bg-brand-success/10 border border-brand-success/30 rounded-xl flex items-center justify-center gap-3 border-dashed"
        >
           <CheckCircle2 className="w-5 h-5 text-brand-success" />
           <p className="text-sm font-bold text-brand-success">
             RECOMPENSA ATIVADA: Cobre seu prêmio: "{selectedReward}"!
           </p>
        </motion.div>
      )}
    </div>
  );
}
