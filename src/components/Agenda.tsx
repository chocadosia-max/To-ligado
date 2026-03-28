import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, AlertTriangle, PartyPopper } from 'lucide-react';
import type { AgendaItem } from '../hooks/useSupabaseData';

interface AgendaProps {
  items: AgendaItem[];
}

export function Agenda({ items }: AgendaProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Campos Minados (Agenda)</h2>
        <p className="text-sm text-white/50 mt-1">Datas que você finge que esqueceu, mas nós lembramos.</p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center p-4 rounded-2xl bg-brand-card/50 border backdrop-blur-sm ${
              item.status === 'urgente' ? 'border-brand-danger/30 shadow-[0_4px_20px_rgba(255,59,48,0.15)]' : 
              item.status === 'pendente' ? 'border-brand-warning/30' : 
              'border-brand-success/30'
            }`}
          >
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border w-16 h-16 mr-4 bg-brand-dark ${
              item.status === 'urgente' ? 'border-brand-danger/50 text-brand-danger' : 
              item.status === 'pendente' ? 'border-brand-warning/50 text-brand-warning' : 
              'border-brand-success/50 text-brand-success'
            }`}>
              <span className="text-lg font-black leading-none">{item.day}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.month}</span>
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-lg text-white/90 flex items-center">
                {item.title}
                <span className="ml-2">
                  {item.status === 'urgente' && <AlertTriangle className="w-5 h-5 text-brand-danger" />}
                  {item.status === 'pendente' && <CalendarIcon className="w-5 h-5 text-brand-warning" />}
                  {item.status === 'safe' && <PartyPopper className="w-5 h-5 text-brand-success" />}
                </span>
              </h4>
              <p className={`text-sm mt-1 ${
                item.status === 'urgente' ? 'text-brand-danger/90' : 'text-white/60'
              }`}>{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

