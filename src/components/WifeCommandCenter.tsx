import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Bomb, Target, AlertTriangle, Send, Gift } from 'lucide-react';

interface WifeCommandCenterProps {
  onAddMission: (title: string, pts: number) => void;
  onAddAgendaItem: (title: string, date: string, dangerLevel: 'low'|'medium'|'high') => void;
  onUpdateRewards: (options: string[]) => void;
  totalScore: number;
  rewardOptions: string[];
}

export function WifeCommandCenter({ onAddMission, onAddAgendaItem, onUpdateRewards, totalScore, rewardOptions }: WifeCommandCenterProps) {
  const [missionTitle, setMissionTitle] = useState('');
  const [missionPts, setMissionPts] = useState<number>(30);
  
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaDate, setAgendaDate] = useState('');
  const [agendaDanger, setAgendaDanger] = useState<'low'|'medium'|'high'>('high');

  const handleAddMission = () => {
    if (!missionTitle) return;
    onAddMission(missionTitle, missionPts);
    setMissionTitle('');
  };

  const handleAddAgenda = () => {
    if (!agendaTitle || !agendaDate) return;
    onAddAgendaItem(agendaTitle, agendaDate, agendaDanger);
    setAgendaTitle('');
    setAgendaDate('');
  };

  const [localRewards, setLocalRewards] = useState<string[]>(rewardOptions || ['', '', '']);

  const handleUpdateReward = (index: number, value: string) => {
    const next = [...localRewards];
    next[index] = value;
    setLocalRewards(next);
  };

  const saveRewards = () => {
    onUpdateRewards(localRewards);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Patroa */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900/40 to-black border border-red-500/30 p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <Flame className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Painel da Patroa</h2>
              <p className="text-red-400 font-bold tracking-widest uppercase text-xs mt-1">Nível de Acesso: Supremo</p>
            </div>
          </div>
          
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center md:text-right min-w-[150px]">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Produtividade Dele</p>
            <p className="text-2xl font-black text-brand-warning">{totalScore.toLocaleString()} pts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Delegar Missão */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-card/50 border border-brand-lilac/20 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-brand-lilac/40 transition-colors"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-brand-lilac" />
            <h3 className="text-xl font-bold tracking-tight">Delegar Nova Missão</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">A Ordem</label>
              <input 
                type="text" 
                placeholder="Ex: Lavar a louça sem reclamar" 
                value={missionTitle}
                onChange={e => setMissionTitle(e.target.value)}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-lilac/50 transition-colors"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block">Pontuação (Recompensa)</label>
              <div className="flex gap-2">
                {[10, 30, 50, 100].map(pt => (
                  <button 
                    key={pt}
                    onClick={() => setMissionPts(pt)}
                    className={`flex-1 py-2 rounded-lg font-black text-sm transition-all ${missionPts === pt ? 'bg-brand-lilac text-white shadow-[0_0_15px_rgba(180,159,220,0.4)] scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    +{pt}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAddMission}
              disabled={!missionTitle}
              className="w-full mt-4 bg-brand-lilac hover:bg-purple-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Ordem
            </button>
          </div>
        </motion.div>

        {/* Plantar Campo Minado */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-card/50 border border-red-500/20 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-red-500/40 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-red-500/10 transition-colors" />
          
          <div className="flex items-center space-x-3 mb-6 relative z-10">
            <Bomb className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-bold tracking-tight">Plantar Campo Minado</h3>
          </div>
          <p className="text-xs text-red-400 mb-4 font-bold tracking-widest uppercase">Adiciona direto na Agenda dele</p>
          
          <div className="space-y-4 relative z-10">
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">A Ameaça / Evento</label>
              <input 
                type="text" 
                placeholder="Ex: Almoço na Sogra" 
                value={agendaTitle}
                onChange={e => setAgendaTitle(e.target.value)}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-1 block">Data</label>
                <input 
                  type="date"
                  value={agendaDate}
                  onChange={e => setAgendaDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-1 block">Risco</label>
                <select 
                  value={agendaDanger}
                  onChange={e => setAgendaDanger(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors appearance-none"
                >
                  <option value="low">Baixo (Tranquilo)</option>
                  <option value="medium">Médio (Atenção)</option>
                  <option value="high">ALTO (Perigo de Vida)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleAddAgenda}
              disabled={!agendaTitle || !agendaDate}
              className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center disabled:opacity-50 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Plantar Bomba
            </button>
          </div>
        </motion.div>

      </div>

      {/* Definir Recompensas Reais */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-brand-lilac/10 to-transparent border border-brand-lilac/30 rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Gift className="w-6 h-6 text-brand-pink" />
          <h3 className="text-xl font-bold tracking-tight">Definir Recompensas Reais</h3>
        </div>
        <p className="text-sm text-white/50 mb-6 max-w-lg">
          Quando ele atingir a pontuação, ele terá que escolher UMA destas 3 opções que você definir agora. Seja criativa (ou cruel).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {localRewards.map((opt, i) => (
            <div key={i}>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Opção {i + 1}</label>
              <input 
                type="text" 
                placeholder={`Ex: Rebeca ganhará...`}
                value={opt}
                onChange={e => handleUpdateReward(i, e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-pink/50 transition-colors"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={saveRewards}
          className="mt-6 px-8 py-3 bg-brand-pink hover:bg-brand-pink/80 text-white font-black rounded-xl uppercase tracking-widest text-[10px] transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,97,166,0.3)]"
        >
          Confirmar Opções de Presente
        </button>
      </motion.div>
    </div>
  );
}
