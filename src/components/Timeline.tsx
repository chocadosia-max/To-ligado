import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ChevronDown, ListEnd, Trash2 } from 'lucide-react';
import type { TimelineEvent } from '../hooks/useSupabaseData';

interface TimelineProps {
  events: TimelineEvent[];
  onClear: () => void;
}

export function Timeline({ events, onClear }: TimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Limita a exibição inicial a 5 itens para não poluir a tela principal
  const INITIAL_LIMIT = 4;
  const visibleEvents = isExpanded ? events : events.slice(0, INITIAL_LIMIT);
  const hiddenCount = events.length - INITIAL_LIMIT;

  return (
    <div className="space-y-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold tracking-tight text-white flex items-center">
          Registro Oficial (Provas)
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/40 tracking-widest font-bold">
            {events.length} REGISTRO(S)
          </span>
          {events.length > 0 && (
            <button 
              onClick={onClear}
              className="text-white/20 hover:text-brand-danger hover:bg-brand-danger/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Apagar Evidências"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative border-l-2 border-white/10 ml-4 space-y-6 pb-2 transition-all">
        <AnimatePresence initial={false}>
          {visibleEvents.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.05, type: 'spring' }}
              className="relative pl-6"
            >
              {/* Dot on timeline */}
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-brand-dark ${
                event.status === 'done' ? 'bg-brand-success ring-brand-success/20' : 
                event.status === 'critical' ? 'bg-brand-danger animate-pulse' : 
                'bg-brand-pink'
              }`} />

              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                    event.status === 'done' ? 'bg-brand-success/20 text-brand-success' : 
                    event.status === 'critical' ? 'bg-brand-danger text-white' : 
                    'bg-brand-lilac/20 text-brand-lilac'
                  }`}>
                    {event.tag}
                  </span>
                  <span className="text-xs text-white/40 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.time}
                  </span>
                </div>
                
                <p className={`text-sm ${event.status === 'done' ? 'text-white/40 line-through' : 'text-white/90'}`}>
                  "{event.content}"
                </p>

                {event.status === 'pending' && (
                  <button className="flex items-center text-xs text-brand-success mt-1 font-medium hover:text-white transition-colors">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Fiz isso (espero)
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {events.length === 0 && (
        <div className="text-center py-6">
          <ListEnd className="w-8 h-8 mx-auto text-white/10 mb-2" />
          <p className="text-xs text-white/30 font-bold tracking-widest uppercase">O PASSADO ESTÁ LIMPO</p>
        </div>
      )}

      {/* Fade out and expand button if there are many events */}
      {!isExpanded && hiddenCount > 0 && (
        <div className="relative pt-4 -mt-16">
          <div className="absolute inset-x-0 bottom-full h-20 bg-gradient-to-t from-brand-card/90 via-brand-card/50 to-transparent pointer-events-none" />
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full relative z-10 py-3 mt-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex items-center justify-center text-xs font-bold text-white/60 tracking-widest gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            DESCLASSIFICAR ARQUIVOS ({hiddenCount} ANTIGOS)
          </button>
        </div>
      )}

      {isExpanded && hiddenCount > 0 && (
        <div className="pt-4 border-t border-white/5">
          <button 
            onClick={() => setIsExpanded(false)}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex items-center justify-center text-xs font-bold text-white/60 tracking-widest gap-2"
          >
            OCULTAR EVIDÊNCIAS
          </button>
        </div>
      )}
    </div>
  );
}
