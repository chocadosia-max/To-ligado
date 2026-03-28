import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';

interface MedicineProps {
  lastTime: string;
  onCheck: () => void;
}

export function MedicineAlerts({ lastTime, onCheck }: MedicineProps) {
  const alerts = [
    {
      id: 1,
      child: 'Joãozinho',
      medicine: 'Amoxicilina (5ml)',
      time: '18:00',
      status: 'pending', 
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-white flex items-center">
            <Pill className="w-5 h-5 mr-2 text-brand-warning" />
            Remédios
        </h3>
        <span className="text-[10px] font-black px-2 py-0.5 bg-brand-warning/20 text-brand-warning rounded-full uppercase">
          NÃO ESQUECE!
        </span>
      </div>

      <div className="space-y-3 flex-1">
        {alerts.map((alert, i) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center p-4 rounded-2xl bg-gradient-to-r from-brand-warning/10 to-brand-card border border-brand-warning/20"
          >
            <div className="bg-brand-warning/20 p-2 rounded-xl mr-4 shrink-0">
              <Pill className="w-5 h-5 text-brand-warning" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm">{alert.child}</h4>
              <p className="text-[11px] text-brand-warning font-medium">{alert.medicine}</p>
              <p className="text-[10px] text-white/30 mt-1">Último: {lastTime || '--:--'}</p>
            </div>

            <div className="text-right">
              <div className="text-lg font-black tracking-tighter text-white">{alert.time}</div>
              <button 
                onClick={onCheck}
                className="mt-1 text-[10px] px-2 py-1 bg-brand-warning/80 hover:bg-brand-warning text-black font-extrabold tracking-wide uppercase rounded-lg transition-colors shadow-[0_0_15px_rgba(255,149,0,0.3)]"
              >
                DEI AGORA
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
