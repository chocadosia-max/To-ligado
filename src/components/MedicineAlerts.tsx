import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, X, BellRing, Check } from 'lucide-react';

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
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  
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

  const handleGive = (id: string, hoursToAdd: number) => {
    const now = new Date();
    // Atualiza para a nova data
    now.setHours(now.getHours() + hoursToAdd);
    const newTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Atualiza na lista com o novo horário alvo!
    saveToLocal(alerts.map(a => a.id === id ? { ...a, time: newTime } : a));
    setSchedulingId(null);
    onCheck(); // Trigger Supabase timeline events (se configurado no App gerará um check)
  };

  // 1. Order by time
  const sortedAlerts = [...alerts].sort((a, b) => a.time.localeCompare(b.time));

  // 2. Group by period
  const grouped = sortedAlerts.reduce((acc, curr) => {
    const h = parseInt(curr.time.split(':')[0]);
    let period = 'Madrugada/Noite';
    if (h >= 6 && h < 12) period = 'Manhã';
    else if (h >= 12 && h < 18) period = 'Tarde';
    
    if (!acc[period]) acc[period] = [];
    acc[period].push(curr);
    return acc;
  }, {} as Record<string, MedItem[]>);

  const periods = ['Manhã', 'Tarde', 'Madrugada/Noite'];

  return (
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="h-full flex flex-col p-4 rounded-3xl bg-[#0a0500] border border-brand-warning/20 shadow-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-warning/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-50" />

      {/* Cabeçalho Horizontalmente Alinhado */}
      <div className="flex items-center justify-between mb-3 relative z-10 w-full shrink-0">
        <h3 className="text-lg font-black tracking-tight text-white flex items-center">
            <Pill className="w-5 h-5 mr-2 text-brand-warning" />
            Medicamentos
        </h3>
        <div className="flex space-x-2">
          <span className="hidden md:flex text-[10px] font-black px-3 py-1.5 bg-brand-warning/10 text-brand-warning rounded-lg uppercase tracking-widest items-center border border-brand-warning/20">
            <BellRing className="w-3 h-3 mr-1" />
            Não Esquecer
          </span>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 transition-colors"
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
            className="overflow-hidden mb-3 relative z-10 shrink-0"
          >
            <div className="p-3 rounded-2xl bg-[#140a00] border border-brand-warning/30 space-y-2">
              <input 
                type="text" 
                placeholder="Paciente (Ex: Filho)" 
                value={newChild} onChange={e => setNewChild(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-warning/50"
              />
              <input 
                type="text" 
                placeholder="Medicamento e Dose" 
                value={newMed} onChange={e => setNewMed(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-warning/50"
              />
              <div className="flex space-x-2">
                <input 
                  type="time" 
                  value={newTime} onChange={e => setNewTime(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-brand-warning/50"
                  style={{ colorScheme: 'dark' }}
                />
                <button 
                  onClick={handleAdd}
                  disabled={!newMed || !newChild || !newTime}
                  className="px-6 bg-brand-warning text-black font-black uppercase tracking-widest text-[10px] rounded-xl disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-1 relative z-10 space-y-3 custom-scrollbar">
        {alerts.length === 0 && (
          <p className="text-center text-xs text-brand-warning/40 uppercase mt-4 font-bold tracking-widest flex flex-col items-center">
             Nenhuma medicação ativa
          </p>
        )}
        
        {periods.map(period => {
          const items = grouped[period];
          if (!items || items.length === 0) return null;
          
          return (
            <div key={period} className="space-y-3">
              <h4 className="text-[10px] font-black text-brand-warning/60 uppercase tracking-widest flex items-center">
                {period === 'Manhã' ? '🌅' : period === 'Tarde' ? '☀️' : '🌙'} {period}
                <div className="flex-1 h-px bg-brand-warning/10 ml-3" />
              </h4>
              
              <AnimatePresence>
              {items.map((alert) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                  key={alert.id}
                  className="group flex flex-col md:flex-row md:items-center p-2 sm:p-3 rounded-xl bg-[#120800] border border-amber-900/40 hover:border-brand-warning/50 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex items-center flex-1 min-w-0 mb-2 md:mb-0">
                    <div className="w-10 h-10 rounded-lg bg-[#2a1400] border border-amber-900/50 flex items-center justify-center shrink-0 mr-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                      <Pill className="w-5 h-5 text-brand-warning" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-2">
                       <h4 className="font-black text-sm md:text-base text-white truncate tracking-tight">{alert.child}</h4>
                       <p className="text-[11px] md:text-xs font-bold text-brand-warning truncate mt-0.5">{alert.medicine}</p>
                       <div className="flex text-[10px] items-center space-x-2 mt-0.5">
                         <span className="text-white/40 flex items-center font-medium">
                           Alvo: {alert.time}
                         </span>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center shrink-0 ml-0 md:ml-4 gap-2">
                    {schedulingId === alert.id ? (
                      <div className="flex flex-col gap-2 w-full md:w-auto p-2 bg-[#0a0500] rounded-xl border border-brand-warning/20">
                        <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold text-center md:text-right">Próxima dose em:</span>
                        <div className="flex gap-1 justify-center md:justify-end">
                           {[6, 8, 12].map(h => (
                             <button 
                               key={h}
                               onClick={() => handleGive(alert.id, h)}
                               className="px-3 py-1.5 bg-brand-warning/10 hover:bg-brand-warning text-brand-warning hover:text-black font-black text-[10px] rounded-lg transition-colors border border-brand-warning/20 hover:border-brand-warning"
                             >
                               +{h}h
                             </button>
                           ))}
                           <button 
                             onClick={() => { handleDelete(alert.id); onCheck(); }}
                             className="px-2 py-1 bg-brand-success/10 hover:bg-brand-success/30 text-brand-success rounded-lg border border-brand-success/20 transition-colors"
                             title="Tratamento Finalizado"
                           >
                              <Check className="w-3 h-3" />
                           </button>
                           <button onClick={() => setSchedulingId(null)} className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg ml-1">
                             <X className="w-3 h-3" />
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-3">
                        <button 
                          onClick={() => handleDelete(alert.id)}
                          className="text-[10px] uppercase font-bold tracking-widest transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 text-white/20 hover:text-brand-danger hidden md:block"
                        >
                          Apagar
                        </button>
                        <button 
                          onClick={() => setSchedulingId(alert.id)}
                          className="flex-1 md:flex-none text-[10px] px-4 py-2 bg-brand-warning hover:bg-amber-400 text-black font-black tracking-widest uppercase rounded-lg transition-all shadow-[0_0_15px_rgba(255,149,0,0.2)] hover:shadow-[0_0_25px_rgba(255,149,0,0.4)]"
                        >
                          Dar Agora
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
