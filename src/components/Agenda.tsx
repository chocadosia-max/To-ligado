import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, AlertTriangle, PartyPopper, Plus, Trash2, X } from 'lucide-react';
import type { AgendaItem } from '../hooks/useSupabaseData';

interface AgendaProps {
  items: AgendaItem[];
  onAdd: (day: string, month: string, title: string, desc: string, status: 'urgente'|'pendente'|'safe') => Promise<any>;
  onDelete: (id: number | string) => void;
}

export function Agenda({ items, onAdd, onDelete }: AgendaProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStatus, setNewStatus] = useState<'urgente'|'pendente'|'safe'>('pendente');

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDate) return;
    
    const dateObj = new Date(newDate);
    // Para resolver fuso: pegamos dia do UTC, ou mantemos simples:
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const month = monthNames[dateObj.getMonth()];

    await onAdd(day, month, newTitle, newDesc, newStatus);
    
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setNewStatus('pendente');
    setIsAdding(false);
  };

  const urgentesCount = items.filter(i => i.status === 'urgente').length;

  return (
    <div className="relative w-full min-h-full -mt-6 pt-6 -mx-6 px-6 md:-mx-8 md:px-8">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(180,159,220,0.08)_0%,rgba(0,0,0,0)_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-danger/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-success/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="relative z-10 space-y-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campos Minados (Agenda)</h2>
          <p className="text-sm text-white/50 mt-1">
            Datas que você finge que esqueceu, mas nós lembramos. {urgentesCount > 0 && <span className="text-brand-danger font-bold uppercase tracking-widest text-[10px] ml-2">{urgentesCount} AMEAÇA(S) EMINENTE(S)</span>}
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-brand-lilac/10 text-brand-lilac hover:bg-brand-lilac/20 transition-colors px-4 py-2 rounded-xl text-sm font-bold"
        >
          {isAdding ? <><X className="w-4 h-4" /> <span>Cancelar</span></> : <><Plus className="w-4 h-4" /> <span>Nova Data</span></>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-5 rounded-2xl bg-brand-card border border-brand-lilac/20 space-y-4 shadow-[0_4px_20px_rgba(180,159,220,0.1)]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Título do Evento</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Aniversário de Casamento"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-lilac/50 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Data Mágica</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-lilac/50 transition-colors"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Detalhes de Sobrevivência</label>
                <input 
                  type="text" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ex: Comprar flores e jantar no restaurante caro."
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-lilac/50 transition-colors"
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                <div className="w-full md:w-auto space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Nível de Perigo</label>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setNewStatus('safe')}
                      className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-xs font-bold transition-colors ${newStatus === 'safe' ? 'bg-brand-success/20 border-brand-success text-brand-success' : 'border-white/10 text-white/40 hover:border-brand-success/50'}`}
                    >Tranquilo</button>
                    <button 
                      onClick={() => setNewStatus('pendente')}
                      className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-xs font-bold transition-colors ${newStatus === 'pendente' ? 'bg-brand-warning/20 border-brand-warning text-brand-warning' : 'border-white/10 text-white/40 hover:border-brand-warning/50'}`}
                    >Normal</button>
                    <button 
                      onClick={() => setNewStatus('urgente')}
                      className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-xs font-bold transition-colors ${newStatus === 'urgente' ? 'bg-brand-danger/20 border-brand-danger text-brand-danger' : 'border-white/10 text-white/40 hover:border-brand-danger/50'}`}
                    >Alerta Vermelho</button>
                  </div>
                </div>

                <button 
                  onClick={handleAdd}
                  disabled={!newTitle || !newDate}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-brand-lilac to-brand-pink text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Registrar Data
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {items.length === 0 && !isAdding && (
          <div className="text-center p-8 bg-brand-card/20 rounded-2xl border border-white/5 border-dashed">
            <p className="text-white/40 font-bold mb-2">Nenhum evento registrado no radar.</p>
            <p className="text-xs text-white/30">Adicione datas perigosas antes que falhe a memória.</p>
          </div>
        )}
        
        {items.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -1, z: 20 }}
            style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
            className={`flex items-center p-4 rounded-3xl bg-black/40 border backdrop-blur-xl group transition-all duration-300 shadow-xl ${
              item.status === 'urgente' ? 'border-brand-danger/30 hover:shadow-[0_4px_20px_rgba(255,59,48,0.15)] hover:border-brand-danger/50' : 
              item.status === 'pendente' ? 'border-brand-warning/30 hover:border-brand-warning/50' : 
              'border-brand-success/30 hover:border-brand-success/50'
            }`}
          >
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border w-16 h-16 shrink-0 mr-4 bg-brand-dark transition-colors ${
              item.status === 'urgente' ? 'border-brand-danger/50 text-brand-danger group-hover:bg-brand-danger/10' : 
              item.status === 'pendente' ? 'border-brand-warning/50 text-brand-warning group-hover:bg-brand-warning/10' : 
              'border-brand-success/50 text-brand-success group-hover:bg-brand-success/10'
            }`}>
              <span className="text-lg font-black leading-none">{item.day}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{item.month}</span>
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="font-bold text-lg text-white/90 flex items-center mb-1">
                <span className="truncate">{item.title}</span>
                <span className="ml-2 shrink-0">
                  {item.status === 'urgente' && <AlertTriangle className="w-5 h-5 text-brand-danger" />}
                  {item.status === 'pendente' && <CalendarIcon className="w-5 h-5 text-brand-warning" />}
                  {item.status === 'safe' && <PartyPopper className="w-5 h-5 text-brand-success" />}
                </span>
              </h4>
              <p className={`text-sm truncate ${
                item.status === 'urgente' ? 'text-brand-danger/90' : 'text-white/60'
              }`}>{item.desc || 'Nenhum detalhe adicional.'}</p>
            </div>

            <button
              onClick={() => onDelete(item.id)}
              className="p-3 text-white/20 hover:text-brand-danger hover:bg-brand-danger/10 rounded-xl transition-colors md:opacity-0 md:group-hover:opacity-100 shrink-0"
              title="Remover Tarefa"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  );
}
