import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithEmail } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await signInWithEmail(email);
      if (error) {
        setMessage('Erro: ' + error.message);
      } else {
        setMessage('🎯 Link mágico enviado! Cheque seu email (inclusive o Spam). O QG te aguarda lá dentro.');
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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-lilac/30 to-brand-pink/30 border border-brand-lilac/40 mb-6 shadow-[0_0_30px_rgba(180,159,220,0.2)]">
            <ShieldAlert className="w-8 h-8 text-brand-lilac" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-brand-lilac to-brand-pink text-transparent bg-clip-text mb-2">
            Tô Ligado
          </h1>
          <p className="text-sm text-brand-pink/80 tracking-[0.2em] font-bold uppercase">Salvo Pela Esposa</p>
          <p className="mt-4 text-white/50 text-sm">Insira seu email para acessar o Quartel General e proteger seu casamento.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-brand-card/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Seu Email Real</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marido.perdido@email.com"
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lilac/50 transition-colors placeholder:text-white/20"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-brand-lilac to-brand-pink text-white font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-[0_0_30px_rgba(255,97,166,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span>{loading ? 'Enviando SOS...' : 'Pedir Resgate (Login)'}</span>
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>

          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-brand-lilac/10 border border-brand-lilac/30 rounded-xl text-sm text-white/80 text-center font-medium leading-relaxed"
            >
              {message}
            </motion.div>
          )}
        </form>

        <p className="text-center text-xs text-white/30 mt-8 font-medium">
          Ao entrar você aceita sua culpa prévia em qualquer discussão.
        </p>
      </motion.div>
    </div>
  );
}
