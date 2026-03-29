import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Check, Plus, Trash2, X } from 'lucide-react';

export interface Mission {
  id: number | string;
  text: string;
  completed: boolean;
  pts: number;
}

interface MissionsProps {
  missions: Mission[];
  onToggle: (id: number | string) => void;
  onAdd: (text: string, pts: number) => Promise<any>;
  onDelete: (id: number | string) => void;
}

export function Missions({ missions, onToggle, onAdd, onDelete }: MissionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMissionText, setNewMissionText] = useState('');
  const [newMissionPts, setNewMissionPts] = useState(10);

  const handleAdd = async () => {
    if (!newMissionText.trim()) return;
    await onAdd(newMissionText, newMissionPts);
    setNewMissionText('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-brand-lilac" />
          Missões do Dia
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded-lg bg-brand-lilac/10 text-brand-lilac hover:bg-brand-lilac/20 transition-colors"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3"
          >
            <input 
              type="text" 
              value={newMissionText}
              onChange={(e) => setNewMissionText(e.target.value)}
              placeholder="Ex: Lavar a louça"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-lilac/50"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-white/40 uppercase font-bold">Valor:</span>
                <select 
                  value={newMissionPts}
                  onChange={(e) => setNewMissionPts(Number(e.target.value))}
                  className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70"
                >
                  <option value={10}>10 pts</option>
                  <option value={20}>20 pts</option>
                  <option value={50}>50 pts</option>
                </select>
              </div>
              <button 
                onClick={handleAdd}
                className="bg-brand-lilac text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-brand-lilac/80 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence>
        {missions.filter(m => !m.completed).map((mission) => (
          <motion.div 
            key={mission.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.9, height: 0, overflow: 'hidden' }}
            whileHover={{ scale: 1.01 }}
            className={`flex items-center p-2.5 rounded-xl border transition-colors group bg-brand-card border-white/5 hover:border-brand-lilac/30`}
          >
            <div className="mr-3 cursor-pointer shrink-0" onClick={() => onToggle(mission.id)}>
              {mission.completed ? (
                <div className="w-5 h-5 rounded-full bg-brand-success flex items-center justify-center">
                  <Check className="text-brand-dark w-3 h-3" strokeWidth={4} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 group-hover:border-brand-lilac/50" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium block truncate ${mission.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
                {mission.text}
              </span>
              <span className="text-[9px] font-black text-brand-lilac/70 uppercase tracking-widest">{mission.pts} pontos</span>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onDelete(mission.id)}
                className="p-1 text-white/10 hover:text-brand-danger transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

