import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle } from 'lucide-react';

export interface Mission {
  id: number;
  text: string;
  completed: boolean;
  pts: number;
}

interface MissionsProps {
  missions: Mission[];
  onToggle: (id: number) => void;
}

export function Missions({ missions, onToggle }: MissionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-brand-lilac" />
          Missões do Dia
        </h3>
        <span className="text-xs bg-brand-lilac/20 text-brand-lilac px-2 py-1 rounded-md font-bold">+Pts</span>
      </div>

      <div className="space-y-2">
        {missions.map((mission) => (
          <motion.div 
            key={mission.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggle(mission.id)}
            className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${
              mission.completed 
                ? 'bg-brand-success/10 border-brand-success/20' 
                : 'bg-brand-card border-white/5 hover:border-brand-lilac/30'
            }`}
          >
            <div className="mr-3">
              {mission.completed ? (
                <CheckCircle2 className="w-5 h-5 text-brand-success" />
              ) : (
                <Circle className="w-5 h-5 text-white/30" />
              )}
            </div>
            
            <p className={`flex-1 text-sm ${
              mission.completed ? 'text-white/40 line-through' : 'text-white/90'
            }`}>
              {mission.text}
            </p>

            <span className={`text-xs font-bold ${
              mission.completed ? 'text-brand-success/60' : 'text-brand-lilac'
            }`}>
              +{mission.pts}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
