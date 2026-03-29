import { motion } from 'framer-motion';
import { Trophy, ArrowDown, ArrowUp, Minus, Skull, Flame, ShieldAlert, Zap } from 'lucide-react';
import type { AppConfig } from '../hooks/useSupabaseData';

interface RankingProps {
  config: AppConfig;
  totalScore: number;
}

export function Ranking({ config, totalScore }: RankingProps) {
  // Gera oponentes fictícios com base nos dados do usuário para causar atrito cômico
  const ranking = [
    { 
      id: 'rob', name: 'Roberto (O Perfeito)', score: 1240, status: 'up', 
      title: `Marido Ideal da amiga da ${config?.wifeName || 'Patroa'}`, icon: <Flame className="w-5 h-5 text-amber-500" />
    },
    { 
      id: 'me', name: config?.userName || 'Você', score: totalScore, status: totalScore > 100 ? 'up' : 'down', 
      title: totalScore > 1000 ? 'Quase um Roberto' : totalScore > 300 ? 'Sobrevivente' : 'Em Apuros Graves', 
      isMe: true 
    },
    { 
      id: 'cunhado', name: 'Seu Cunhado (O Encosto)', score: 120, status: 'same', 
      title: 'Vive de Promessas', icon: <ShieldAlert className="w-4 h-4 text-brand-warning" />
    },
    { 
      id: 'pedro', name: 'Pedro (Recém-Casado)', score: 20, status: 'down', 
      title: 'Ainda acha que manda', icon: <Skull className="w-4 h-4 text-brand-danger" />
    },
    { 
      id: 'vizinho', name: 'O Vizinho Misterioso', score: 850, status: 'up', 
      title: 'Sempre lavando o carro', icon: <Zap className="w-4 h-4 text-blue-400" />
    },
  ];

  const sortedRanking = [...ranking]
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const myPos = sortedRanking.find(r => r.isMe);
  const isLeader = myPos?.rank === 1;

  return (
    <div className="relative w-full min-h-full -mt-6 pt-6 -mx-6 px-6 md:-mx-8 md:px-8">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,97,166,0.06)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-pink/10 rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-lilac/10 rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 pb-20 space-y-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-white/50 text-transparent bg-clip-text">O Placar da Humilhação</h2>
          <p className="text-sm text-brand-pink/80 uppercase font-bold tracking-widest mt-2">
            Comparando você para causar atrito
          </p>
        </div>

        {/* Hero Card: Sua Posição */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.02, rotateX: 2, rotateY: 5 }}
          style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
          className={`relative p-8 rounded-3xl border backdrop-blur-xl overflow-hidden shadow-2xl ${
            isLeader 
              ? 'bg-gradient-to-br from-amber-500/20 to-amber-700/10 border-amber-500/50' 
              : 'bg-gradient-to-br from-brand-lilac/10 to-transparent border-brand-lilac/30'
          }`}
        >
          <Trophy className={`absolute -right-8 -top-8 w-48 h-48 opacity-20 rotate-12 ${isLeader ? 'text-amber-400' : 'text-brand-lilac'}`} />
          
          <div className="relative z-10">
            <p className={`text-xs font-bold mb-2 uppercase tracking-widest ${isLeader ? 'text-amber-400' : 'text-brand-lilac'}`}>
              Radar Conjugal
            </p>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black text-white drop-shadow-lg">#{myPos?.rank}</span>
              <span className="text-2xl font-bold text-white/50 pb-2">/ {sortedRanking.length}</span>
            </div>
            <p className="text-sm text-white/80 mt-4 font-medium max-w-[80%]">
              {myPos?.rank === 1 
                ? 'Você é a lenda urbana que as esposas cobram os maridos. Roberto chora no banho.' 
                : myPos?.rank === 2
                ? 'Quase lá. Só falta parar de respirar alto quando ela dorme.'
                : myPos?.rank === sortedRanking.length
                ? `Fim de jogo. ${config?.wifeName || 'Ela'} já está baixando o Tinder.`
                : 'Você não fede nem cheira. A mediocridade é sua melhor defesa.'}
            </p>
          </div>
        </motion.div>

        {/* Learderboard List */}
        <div className="space-y-4">
          {sortedRanking.map((user, index) => {
            const isTop3 = user.rank <= 3;
            return (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.01, x: 5 }}
                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                  user.isMe 
                    ? 'bg-brand-pink/10 shadow-[0_0_20px_rgba(255,97,166,0.15)] border-brand-pink/50 backdrop-blur-md' 
                    : isTop3 
                      ? 'bg-black/40 border-white/10 backdrop-blur-sm'
                      : 'bg-black/20 border-transparent opacity-80'
                }`}
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg ${
                    user.rank === 1 ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 
                    user.rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black shadow-lg' : 
                    user.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-lg' : 
                    'bg-white/5 text-white/40 border border-white/10'
                  }`}>
                    {user.rank}
                  </div>
                  
                  <div className="truncate pr-4">
                    <h4 className="font-bold text-white flex items-center gap-2 text-base md:text-lg">
                      <span className="truncate">{user.name}</span>
                      {user.icon}
                      {user.isMe && (
                        <span className="shrink-0 text-[10px] bg-brand-pink px-2 py-0.5 rounded-full text-white tracking-widest shadow-[0_0_10px_rgba(255,97,166,0.5)]">
                          VOCÊ
                        </span>
                      )}
                    </h4>
                    <p className={`text-xs md:text-sm truncate ${user.isMe ? 'text-brand-pink/80 font-medium' : 'text-white/40'}`}>
                      {user.title}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className={`text-xl md:text-2xl font-black font-mono tracking-tighter ${
                    user.isMe ? 'text-brand-pink' : 
                    user.rank === 1 ? 'text-amber-400' : 
                    'text-white'
                  }`}>
                    {user.score.toLocaleString()}
                  </span>
                  <span className="flex items-center text-[10px] md:text-xs mt-1 font-bold">
                    {user.status === 'up' && <><ArrowUp className="w-3 h-3 text-brand-success mr-1" /><span className="text-brand-success uppercase tracking-widest">Subiu</span></>}
                    {user.status === 'down' && <><ArrowDown className="w-3 h-3 text-brand-danger mr-1" /><span className="text-brand-danger uppercase tracking-widest">Caiu</span></>}
                    {user.status === 'same' && <><Minus className="w-3 h-3 text-white/30 mr-1" /><span className="text-white/30 uppercase tracking-widest">Estável</span></>}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
