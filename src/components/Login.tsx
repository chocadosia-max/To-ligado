import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ArrowRight, Shield, UserPlus, LogIn, Lock, RefreshCw } from 'lucide-react';

type Mode = 'login' | 'signup';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const { signIn, signUp } = useAuth();

  // Auto-fill and Login from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('e');
    const p = params.get('p');
    if (e && p) {
      setEmail(e);
      setPassword(p);
      // Give it a tiny delay for visual wow
      const timer = setTimeout(() => {
         document.getElementById('login-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, name);
        if (error) {
          setMessage('⚠️ Erro ao criar conta: ' + error.message);
        } else {
          setMessage('🎉 Conta criada com sucesso! Entrando no QG...');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setMessage('🚫 Credenciais inválidas. Verifique seu e-mail e senha.');
          } else {
            setMessage('⚠️ Erro ao entrar: ' + error.message);
          }
        }
      }
    } catch (error: any) {
      setMessage('Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[10%] -left-32 w-96 h-96 bg-brand-lilac/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] -right-32 w-96 h-96 bg-brand-pink/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-lilac/30 to-brand-pink/30 border border-brand-lilac/40 mb-6 shadow-[0_0_30px_rgba(180,159,220,0.2)]">
            <Shield className="w-8 h-8 text-brand-lilac" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-brand-lilac to-brand-pink text-transparent bg-clip-text mb-2">
            Tô Ligado
          </h1>
          <p className="text-sm text-brand-pink/80 tracking-[0.2em] font-bold uppercase">Salvo Pela Esposa</p>
        </div>

        {/* Tab Switcher: Login / Criar Conta */}
        <div className="flex bg-black/30 rounded-2xl p-1 mb-4 border border-white/5">
          <button
            type="button"
            onClick={() => { setMode('login'); setMessage(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-brand-lilac to-brand-pink text-white shadow-lg'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setMessage(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-brand-lilac to-brand-pink text-white shadow-lg'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Criar Conta
          </button>
        </div>

        {/* Form */}
        <form id="login-form" onSubmit={handleSubmit} className="space-y-4 bg-brand-card/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative">
          {loading && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
               <div className="flex flex-col items-center">
                  <RefreshCw className="w-8 h-8 text-brand-lilac animate-spin mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Sincronizando com QG...</p>
               </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.p
              key={mode}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/50 text-sm text-center"
            >
              {mode === 'signup'
                ? 'Escolha sua senha para criar acesso permanente ao QG.'
                : 'Insira suas credenciais para acessar o Quartel General.'}
            </motion.p>
          </AnimatePresence>

          {/* Input de Nome (só no cadastro) */}
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Seu Apelido</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Soldado Roberto"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-brand-lilac/50 transition-colors placeholder:text-white/20"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input de Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">
              Seu Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lilac/50 transition-colors placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Input de Senha */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">
              Sua Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lilac/50 transition-colors placeholder:text-white/20"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-brand-lilac to-brand-pink text-white font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-[0_0_30px_rgba(255,97,166,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span>
              {loading
                ? 'Operando...'
                : mode === 'signup' ? 'Criar e Entrar' : 'Acessar Agora'}
            </span>
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>

          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-brand-lilac/10 border border-brand-lilac/30 rounded-xl text-sm text-white/80 text-center font-medium leading-relaxed"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="text-center text-xs text-white/30 mt-8 font-medium">
          Ao entrar você aceita que a senha é sua única aliada no QG.
        </p>
      </motion.div>
    </div>
  );
}
