import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Check, X, BellRing } from 'lucide-react';

interface MedicineProps {
  lastTime?: string;
  onCheck: () => void;
}

export interface MedItem {
  id: string;
  child: string;
  medicine: string;
  time: string;
  lastGiven?: string | null;
}

export function MedicineAlerts({ onCheck }: MedicineProps) {
  const [alerts, setAlerts] = useState<MedItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newChild, setNewChild] = useState('');
  const [newMed, setNewMed] = useState('');
  const [newTime, setNewTime] = useState('');
  
  // Load local data
  useEffect(() => {
    const saved = localStorage.getItem('tl_meds');
    if (saved) {
      try { setAlerts(JSON.parse(saved)); } catch (e) {}
    } else {
      // Seed default
      setAlerts([
        { id: '1', child: 'Joãozinho', medicine: 'Amoxicilina (5ml)', time: '18:00', lastGiven: null }
      ]);
    }
  }, []);

  const saveToLocal = (data: MedItem[]) => {
    setAlerts(data);
    localStorage.setItem('tl_meds', JSON.stringify(data));
  };

  const handleAdd = () => {
    if (!newChild || !newMed || !newTime) return;
    const newItem: MedItem = {
      id: Date.now().toString(),
      child: newChild,
      medicine: newMed,
      time: newTime,
      lastGiven: null
    };
    saveToLocal([...alerts, newItem]);
    setNewChild('');
    setNewMed('');
    setNewTime('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveToLocal(alerts.filter(a => a.id !== id));
  };

  const handleGive = (id: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Update local state and trigger global app check
    saveToLocal(alerts.map(a => a.id === id ? { ...a, lastGiven: timeStr } : a));
    onCheck(); // This triggers Supabase timeline/lastMed updates in parent
  };

  return (
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="h-full flex flex-col justify-between p-4 rounded-3xl bg-gradient-to-br from-brand-warning/10 to-brand-card/50 border border-brand-warning/20 shadow-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-warning/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-50" />

      <div className="flex items-center justify-between mb-6 relative z-10 w-full">
        <h3 className="text-lg font-black tracking-tight text-white flex items-center">
            <Pill className="w-5 h-5 mr-2 text-brand-warning" />
            Enfermaria
        </h3>
        <div className="flex space-x-2">
          <span className="text-[10px] font-black px-2 py-1 bg-brand-warning/20 text-brand-warning rounded-lg uppercase tracking-widest flex items-center shadow-[0_0_10px_rgba(255,149,0,0.3)]">
            <BellRing className="w-3 h-3 mr-1" />
            Não Esquecer
          </span>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4 relative z-10"
          >
            <div className="p-4 rounded-2xl bg-black/40 border border-brand-warning/20 space-y-3 backdrop-blur-md">
              <input 
                type="text" 
                placeholder="Paciente (Ex: Filho)" 
                value={newChild} onChange={e => setNewChild(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input 
                type="text" 
                placeholder="Medicamento e Dose" 
                value={newMed} onChange={e => setNewMed(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <div className="flex space-x-2">
                <input 
                  type="time" 
                  value={newTime} onChange={e => setNewTime(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase"
                  style={{ colorScheme: 'dark' }}
                />
                <button 
                  onClick={handleAdd}
                  disabled={!newMed || !newChild || !newTime}
                  className="px-4 bg-brand-warning text-black font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 flex-1 relative z-10">
        {alerts.length === 0 && (
          <p className="text-center text-xs text-white/30 uppercase mt-8 font-bold tracking-widest">Nenhuma medicação ativa</p>
        )}
        {alerts.map((alert, i) => {
          const isDone = !!alert.lastGiven;
          return (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className={`group flex items-center p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
                isDone 
                  ? 'bg-brand-success/10 border-brand-success/30' 
                  : 'bg-black/40 border-brand-warning/30 hover:shadow-[0_4px_20px_rgba(255,149,0,0.15)] hover:-translate-y-1'
              }`}
            >
              {isDone && <div className="absolute inset-0 bg-brand-success/5 pointer-events-none" />}

              <div className={`p-2.5 rounded-xl mr-3 shrink-0 transition-colors ${
                isDone ? 'bg-brand-success/20 text-brand-success shadow-[0_0_15px_rgba(0,255,100,0.4)]' : 'bg-brand-warning/20 text-brand-warning shadow-inner'
              }`}>
                {isDone ? <Check className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 min-w-0 pr-2">
                <h4 className={`font-bold text-sm truncate ${isDone ? 'text-white/60 line-through' : 'text-white'}`}>{alert.child}</h4>
                <p className={`text-[11px] font-medium truncate ${isDone ? 'text-brand-success/80' : 'text-brand-warning'}`}>{alert.medicine}</p>
                <div className="flex text-[10px] items-center space-x-2 mt-1">
                   <span className="text-white/30">Alvo: {alert.time}</span>
                   {isDone && <span className="text-brand-success font-bold">Dado: {alert.lastGiven}</span>}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-2">
                {!isDone && (
                  <button 
                    onClick={() => handleGive(alert.id)}
                    className="text-[10px] px-3 py-1.5 bg-brand-warning hover:bg-amber-400 text-black font-black tracking-widest uppercase rounded-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,149,0,0.4)]"
                  >
                    Dar Agora
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(alert.id)}
                  className={`text-[10px] uppercase font-bold tracking-widest transition-colors ${isDone ? 'text-white/20 hover:text-brand-danger' : 'opacity-0 group-hover:opacity-100 text-white/20 hover:text-brand-danger'}`}
                >
                  Remover
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
