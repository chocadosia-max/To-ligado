import { motion } from 'framer-motion';
import { Trophy, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { AppConfig } from '../hooks/useSupabaseData';

interface RankingProps {
  config: AppConfig;
  totalScore: number;
}

export function Ranking({ config, totalScore }: RankingProps) {
  const ranking = [
    { rank: 1, name: 'Roberto (Aquele FDP)', score: 1240, status: 'up', title: 'Marido Ideal' },
    { rank: 2, name: config.userName, score: totalScore, status: totalScore > 500 ? 'up' : 'down', title: totalScore > 100 ? 'Sobrevivente' : 'Em Apuros', isMe: true },
    { rank: 3, name: 'Seu Cunhado', score: 320, status: 'same', title: 'Decepcionante' },
    { rank: 4, name: 'Pedro (Recém-Casado)', score: 80, status: 'down', title: 'Já Morreu' },
  ];

  const sortedRanking = [...ranking].sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));

  const myPos = sortedRanking.find(r => r.isMe);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">O Placar da Humilhação</h2>
        <p className="text-sm text-white/50 mt-1">Comparando você com os vizinhos para causar atrito.</p>
      </div>

      <div className="bg-gradient-to-br from-brand-lilac/10 to-transparent p-6 rounded-3xl border border-brand-lilac/30 relative overflow-hidden mb-8">
        <Trophy className="absolute -right-6 -top-6 w-32 h-32 text-brand-lilac/10 rotate-12" />
        <div className="relative">
          <p className="text-xs font-bold text-brand-lilac mb-1 uppercase tracking-widest">Sua Posição</p>
          <div className="text-4xl font-black text-white">#{myPos?.rank}</div>
          <p className="text-sm text-white/60 mt-1">
            {myPos?.rank === 1 ? 'Você é o mestre. Roberto que se cuide.' : 'Cuidado, o Roberto limpou a casa ontem de novo.'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedRanking.map((user, index) => (
          <motion.div 
            key={user.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`flex items-center justify-between p-4 rounded-2xl border ${
              user.isMe 
                ? 'bg-brand-card shadow-[0_0_20px_rgba(255,97,166,0.15)] border-brand-pink/50 backdrop-blur-md' 
                : 'bg-black/20 border-white/5'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                user.rank === 1 ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 
                user.rank === 2 ? 'bg-slate-300 text-black' : 
                user.rank === 3 ? 'bg-amber-700 text-white' : 
                'bg-white/10 text-white/50'
              }`}>
                {user.rank}
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center">
                  {user.name}
                  {user.isMe && <span className="ml-2 text-[10px] bg-brand-pink px-2 py-0.5 rounded-full text-white tracking-widest">EU</span>}
                </h4>
                <p className="text-xs text-white/50">{user.title}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className={`text-xl font-bold font-mono tracking-tighter ${user.isMe ? 'text-brand-pink' : 'text-white'}`}>
                {user.score}
              </span>
              <span className="flex items-center text-xs mt-1">
                {user.status === 'up' && <><ArrowUp className="w-3 h-3 text-brand-success mr-1" /><span className="text-brand-success">Subiu</span></>}
                {user.status === 'down' && <><ArrowDown className="w-3 h-3 text-brand-danger mr-1" /><span className="text-brand-danger">Caiu</span></>}
                {user.status === 'same' && <><Minus className="w-3 h-3 text-white/40 mr-1" /><span className="text-white/40">Manteve</span></>}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

