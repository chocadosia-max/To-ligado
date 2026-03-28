import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';

export function Timeline() {
  const events = [
    {
      id: 1,
      tag: 'Ela Falou',
      content: 'Comprar pão na volta do trabalho.',
      time: '15:30',
      status: 'pending',
    },
    {
      id: 2,
      tag: 'Aviso Crítico',
      content: 'Aniversário da sua mãe é sexta. Não compra panela.',
      time: 'Ontem',
      status: 'critical',
    },
    {
      id: 3,
      tag: 'Missão Cumprida',
      content: 'Tirar o lixo.',
      time: '08:00',
      status: 'done',
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold tracking-tight">Registro Oficial (Provas)</h3>
      
      <div className="relative border-l-2 border-white/10 ml-4 space-y-6 pb-4">
        {events.map((event, i) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 + 0.2 }}
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
                  'bg-brand-pink/20 text-brand-pink'
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
                <button className="flex items-center text-xs text-brand-success mt-2 font-medium hover:text-white transition-colors">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Fiz isso (espero)
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
