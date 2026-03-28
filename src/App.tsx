import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreCard } from './components/ScoreCard';
import { MedicineAlerts } from './components/MedicineAlerts';
import { Timeline } from './components/Timeline';
import { Missions } from './components/Missions';
import { ExcuseGenerator } from './components/ExcuseGenerator';
import { Agenda } from './components/Agenda';
import { Ranking } from './components/Ranking';
import { SettingsComponent } from './components/Settings';
import { useSupabaseData } from './hooks/useSupabaseData';
import { Settings, ShieldAlert, Home, Calendar, UserRound, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

type Tab = 'painel' | 'agenda' | 'ranking' | 'ajustes';



function App() {
  const [activeTab, setActiveTab] = useState<Tab>('painel');
  const { session, loading: authLoading, signOut } = useAuth();
  
  // Persistent State via Supabase (@data-squad)
  const { 
    missions, 
    config, 
    updateConfig, 
    toggleMissionDb, 
    lastMedTime, 
    updateLastMedTime, 
    loadingDb 
  } = useSupabaseData();

  // Derived Score (@advisory-board)
  const totalScore = useMemo(() => {
    return missions.reduce((acc, curr) => curr.completed ? acc + curr.pts : acc, 0);
  }, [missions]);

  const checkMedicine = () => {
    const now = new Date();
    updateLastMedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
  };

  const resetAll = () => {
    if (confirm('Atenção: A função de reset de todas as missões será implementada em breve na sala de operações.')) {
      // Future feature: deletar missões do BD ou marcar como uncompleted.
    }
  };

  if (authLoading || loadingDb) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <ShieldAlert className="w-12 h-12 text-brand-lilac animate-pulse mb-4" />
        <p className="text-white/50 text-sm tracking-widest uppercase font-bold">Conectando ao QG Central / Sincronizando Dados...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-white selection:bg-brand-pink/30 flex flex-col md:flex-row">
      
      {/* Sidebar Nav (Desktop) / Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 w-full bg-brand-card/90 backdrop-blur-lg border-t border-brand-lilac/10 px-8 py-4 pb-8 flex justify-between items-center z-50 md:relative md:w-24 lg:w-64 md:border-t-0 md:border-r md:flex-col md:justify-start md:pt-12 md:pb-4 md:px-4 md:space-y-8">
        
        {/* Desktop Branding in Sidebar */}
        <div className="hidden md:block w-full text-center lg:text-left lg:px-4 mb-4">
          <h1 className="text-xl lg:text-3xl font-black tracking-tighter bg-gradient-to-br from-brand-lilac to-brand-pink text-transparent bg-clip-text">
            Tô Ligado
          </h1>
          <p className="hidden lg:block text-[10px] text-brand-pink/80 tracking-widest font-bold mt-1 uppercase">SALVO PELA ESPOSA</p>
        </div>

        <button 
          onClick={() => setActiveTab('painel')}
          className={`flex flex-col items-center lg:flex-row lg:justify-start lg:w-full lg:px-4 space-y-1 lg:space-y-0 lg:space-x-3 transition-colors p-2 rounded-xl ${activeTab === 'painel' ? 'text-brand-lilac bg-brand-lilac/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
        >
          <Home className="w-6 h-6 lg:w-5 lg:h-5" />
          <span className="text-[10px] lg:text-sm font-bold">Painel</span>
        </button>
        <button 
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center lg:flex-row lg:justify-start lg:w-full lg:px-4 space-y-1 lg:space-y-0 lg:space-x-3 transition-colors p-2 rounded-xl ${activeTab === 'agenda' ? 'text-brand-lilac bg-brand-lilac/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
        >
          <Calendar className="w-6 h-6 lg:w-5 lg:h-5" />
          <span className="text-[10px] lg:text-sm font-bold">Agenda</span>
        </button>
        <button 
          onClick={() => setActiveTab('ranking')}
          className={`flex flex-col items-center lg:flex-row lg:justify-start lg:w-full lg:px-4 space-y-1 lg:space-y-0 lg:space-x-3 transition-colors p-2 rounded-xl ${activeTab === 'ranking' ? 'text-brand-lilac bg-brand-lilac/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
        >
          <UserRound className="w-6 h-6 lg:w-5 lg:h-5" />
          <span className="text-[10px] lg:text-sm font-bold">Ranking</span>
        </button>
        
        <div className="hidden md:block flex-1" />
        
        <button 
          onClick={() => setActiveTab('ajustes')}
          className={`hidden md:flex flex-col items-center lg:flex-row lg:justify-start lg:w-full lg:px-4 space-y-1 lg:space-y-0 lg:space-x-3 transition-colors p-2 rounded-xl ${activeTab === 'ajustes' ? 'text-brand-lilac bg-brand-lilac/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
        >
          <Settings className="w-6 h-6 lg:w-5 lg:h-5" />
          <span className="text-[10px] lg:text-sm font-bold">Ajustes</span>
        </button>

        <button 
          onClick={signOut}
          className={`hidden md:flex flex-col items-center lg:flex-row lg:justify-start lg:w-full lg:px-4 space-y-1 lg:space-y-0 lg:space-x-3 transition-colors p-2 rounded-xl text-brand-danger/60 hover:text-brand-danger hover:bg-brand-danger/10 mt-auto`}
        >
          <LogOut className="w-6 h-6 lg:w-5 lg:h-5" />
          <span className="text-[10px] lg:text-sm font-bold">Sair do QG</span>
        </button>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full pb-24 md:pb-6 overflow-y-auto overflow-x-hidden relative h-screen">
        {/* Glow Effects */}
        <div className="fixed top-[20%] -left-32 w-64 h-64 bg-brand-lilac/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-[20%] right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile Header */}
        <header className="md:hidden px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 z-40 bg-brand-dark/80 backdrop-blur-md border-b border-white/5">
          <div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-brand-lilac to-brand-pink text-transparent bg-clip-text">
              Tô Ligado
            </h1>
            <p className="text-xs text-brand-pink/80 tracking-widest font-bold">SALVO PELA ESPOSA</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('ajustes')}
              className={`p-2 rounded-full transition-colors pointer-events-auto ${activeTab === 'ajustes' ? 'bg-brand-lilac/20' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <Settings className="w-5 h-5 text-white/70" />
            </button>
            <button 
              onClick={signOut}
              className={`p-2 rounded-full bg-white/5 hover:bg-brand-danger/20 hover:text-brand-danger transition-colors pointer-events-auto`}
            >
              <LogOut className="w-5 h-5 text-white/70 hover:text-brand-danger" />
            </button>
          </div>
        </header>

        {/* Desktop Title & Context Bar */}
        <div className="hidden md:flex px-8 pt-10 pb-6 justify-between items-center z-40">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">E aí, {config.userName}? 👋</h2>
            <p className="text-sm text-white/50 mt-1">Status atual com {config.wifeName}: <span className="text-brand-lilac font-bold uppercase">{totalScore > 50 ? 'Milagre' : 'Sendo Vigiado'}</span></p>
          </div>
          {activeTab === 'painel' && (
            <div className="px-4 py-2 bg-brand-dark/50 border border-brand-lilac/20 rounded-xl">
              <span className="text-xs text-brand-lilac uppercase tracking-widest font-black">Score Semanal: </span>
              <span className="text-sm font-bold text-white tracking-widest">{totalScore}</span>
            </div>
          )}
        </div>

        <main className="px-6 md:px-8 py-6 max-w-md md:max-w-none mx-auto overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'painel' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                  <div className="space-y-6 md:col-span-7 lg:col-span-8">
                    <ScoreCard score={totalScore} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div 
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-2xl bg-gradient-to-r from-brand-lilac/20 to-brand-pink/20 border border-brand-lilac/30 flex items-center justify-between cursor-pointer shadow-[0_4px_20px_rgba(180,159,220,0.15)] backdrop-blur-sm self-start h-full"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-brand-lilac/30 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-brand-lilac" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-wide">Modo Pai Presente</h3>
                            <p className="text-xs text-white/60">Frequência: {config.sarcasmLevel > 50 ? 'Humilhação' : 'Aviso'}</p>
                          </div>
                        </div>
                        <div className="w-10 h-6 shrink-0 bg-brand-pink rounded-full relative shadow-[0_0_10px_rgba(255,97,166,0.5)]">
                          <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </motion.div>

                      <div className="h-full">
                        <MedicineAlerts lastTime={lastMedTime} onCheck={checkMedicine} />
                      </div>
                    </div>

                    <div className="bg-brand-card/50 rounded-2xl p-6 border border-white/5">
                      <Timeline />
                    </div>
                  </div>

                  <div className="space-y-6 md:col-span-5 lg:col-span-4">
                    <div className="bg-brand-card/50 rounded-2xl p-6 border border-white/5">
                      <Missions missions={missions} onToggle={toggleMissionDb} />
                    </div>
                    <ExcuseGenerator config={config} />
                  </div>
                </div>
              )}

              {activeTab === 'agenda' && <div className="max-w-2xl mx-auto"><Agenda /></div>}
              {activeTab === 'ranking' && <div className="max-w-2xl mx-auto"><Ranking /></div>}
              {activeTab === 'ajustes' && (
                <SettingsComponent 
                  config={config} 
                  onSave={updateConfig} 
                  onReset={resetAll} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
