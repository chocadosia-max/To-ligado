import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';

export function MedicineAlerts() {
  const alerts = [
    {
      id: 1,
      child: 'Joãozinho',
      medicine: 'Amoxicilina (5ml)',
      time: '18:00',
      status: 'pending', // 'pending' | 'given' | 'late'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">🚨 Kids Medicine</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-brand-warning/20 text-brand-warning rounded-full">
          NÃO ESQUECE!
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center p-4 rounded-2xl bg-gradient-to-r from-brand-warning/10 to-brand-card border border-brand-warning/20"
          >
            <div className="bg-brand-warning/20 p-3 rounded-xl mr-4">
              <Pill className="w-6 h-6 text-brand-warning" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-white">{alert.child}</h4>
              <p className="text-sm text-brand-warning font-medium">{alert.medicine}</p>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold tracking-tighter text-white">{alert.time}</div>
              <button className="mt-1 text-xs px-3 py-1 bg-brand-warning/80 hover:bg-brand-warning text-black font-extrabold tracking-wide uppercase rounded-lg transition-colors shadow-[0_0_15px_rgba(255,149,0,0.4)]">
                DEI O REMÉDIO
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
