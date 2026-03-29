import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSignature, ShieldCheck } from 'lucide-react';

export function PactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const signed = localStorage.getItem('tl_pact_signed');
    if (!signed) {
      setTimeout(() => setIsOpen(true), 1500); // Aparece logo após carregar o dashboard
    }
  }, []);

  const handleSign = () => {
    localStorage.setItem('tl_pact_signed', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-brand-dark border border-brand-lilac/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(180,159,220,0.2)]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-lilac/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 p-6 md:p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-lilac to-brand-pink rounded-full flex items-center justify-center mb-6 shadow-lg shadow-brand-pink/30">
                <FileSignature className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-black text-center mb-2 text-white tracking-tight">
                O Pacto de Paz 🤝
              </h2>
              <p className="text-white/60 text-center text-sm font-medium mb-6 uppercase tracking-widest">
                Termos de Rendição Conjugal
              </p>

              <div 
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 h-48 overflow-y-auto mb-6 text-sm text-white/80 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent custom-scroll"
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
                    setHasScrolled(true);
                  }
                }}
              >
                <p>
                  <strong>Cláusula 1: Da Humilhação Consentida</strong><br/>
                  O usuário compromete-se a aceitar críticas irônicas e sarcásticas da Inteligência Artificial em troca de paz de espírito na vida real.
                </p>
                <p>
                  <strong>Cláusula 2: Das Promessas Vazias</strong><br/>
                  Anotar uma tarefa neste aplicativo torna obrigatória sua execução. O esquecimento no "Mundo Real" será cobrado judicialmente no "Tribunal do Sofá".
                </p>
                <p>
                  <strong>Cláusula 3: Da Recompensa Real</strong><br/>
                  Atingir a pontuação "Master Elite" obriga o usuário a liberar recompensas (vouchers de iFood, Spa ou Vinhos) mediante ordem expressa e não solicitada da cônjuge.
                </p>
                <p>
                  <strong>Cláusula 4: Do Modo Pai Presente</strong><br/>
                  Fica terminantemente proibido o uso do "Modo Pai Presente" apenas para farmar pontuação sem a devida execução das tarefas atribuídas.
                </p>
                <p className="text-center italic text-brand-pink pt-4">Role até o final para assinar com o sangue.</p>
              </div>

              <div className="w-full">
                <button 
                  onClick={handleSign}
                  disabled={!hasScrolled}
                  className={`w-full py-4 rounded-xl flex items-center justify-center font-black uppercase tracking-widest transition-all ${
                    hasScrolled 
                      ? 'bg-gradient-to-r from-brand-success to-emerald-500 text-black shadow-[0_0_20px_rgba(0,255,100,0.4)] hover:scale-105 active:scale-95' 
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {hasScrolled ? <><ShieldCheck className="w-5 h-5 mr-2" /> Aceito a Humilhação & a Paz</> : 'LEIA OS TERMOS ACIMA'}
                </button>
                {hasScrolled && (
                  <p className="text-center text-[10px] text-white/30 mt-3 font-medium uppercase tracking-widest">
                    Sem opções de devolução do produto.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
