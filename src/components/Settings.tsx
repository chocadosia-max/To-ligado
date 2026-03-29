import { useState, useEffect } from 'react';
import { User, Heart, Zap, Save, RefreshCw, Share2, Key, Copy, CheckCircle2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

interface SettingsProps {
  config: {
    userName: string;
    wifeName: string;
    wifePhone: string;
    userPhone: string;
    sarcasmLevel: number;
  };
  onSave: (newConfig: any) => void;
  onReset: () => void;
}

export function SettingsComponent({ config, onSave, onReset }: SettingsProps) {
  const [localConfig, setLocalConfig] = useState(config);

  // Sincroniza quando o Supabase terminar de carregar os dados reais
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);
  const [isSaving, setIsSaving] = useState(false);
  const [wifeAccess, setWifeAccess] = useState<{ email: string, pass: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateWifeAccess = async () => {
    setIsGenerating(true);
    try {
      // 1. Gerar credenciais sarcásticas
      const prefixes = ['comandante', 'geral', 'a_braba', 'cerebro_real', 'dona_do_qg', 'chefe_suprema'];
      const domains = ['toligado.io', 'pazeterna.app', 'sem-dr.com', 'mandachuva.online'];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const randomNum = Math.floor(Math.random() * 9999);
      
      const email = `${randomPrefix}.${randomNum}@${randomDomain}`;
      const pass = `paz_eterna_${Math.floor(Math.random() * 1000)}`;

      // 2. Criar o usuário no Supabase (ignorando erro se já existir por azar do random)
      // Usamos um client temporário para não deslogar o marido
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: `Patroa de ${localConfig.userName}` } }
      });

      if (authError) throw authError;

      // 3. Vincular o novo usuário ao marido atual no banco de dados
      if (authData.user) {
        const { error: linkError } = await supabase
          .from('profiles')
          .update({ husband_id: (await supabase.auth.getUser()).data.user?.id })
          .eq('id', authData.user.id);
        
        if (linkError) throw linkError;
      }

      setWifeAccess({ email, pass });
    } catch (e: any) {
      console.error(e);
      alert('Falha ao gerar acesso diplomático: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localConfig);
      alert('Configurações salvas no QG com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Falha ao sincronizar com o QG Central.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Sala de Ajustes (Quartel General)</h2>
        <p className="text-sm text-white/50 mt-1">Configure as variáveis do seu destino matrimonial.</p>
      </div>

      <div className="space-y-6">
        {/* User Config */}
        <div className="bg-brand-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-5 h-5 text-brand-lilac" />
            <h3 className="font-bold text-white">Seus Dados</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Seu Nome (Vítima)</label>
            <input 
              type="text" 
              value={localConfig.userName}
              onChange={(e) => setLocalConfig({ ...localConfig, userName: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lilac/50 transition-colors"
              placeholder="Ex: Roberto"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Seu WhatsApp (Somente Números)</label>
            <input 
              type="text" 
              value={localConfig.userPhone}
              onChange={(e) => setLocalConfig({ ...localConfig, userPhone: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lilac/50 transition-colors"
              placeholder="Ex: 5511988888888"
            />
          </div>
        </div>

        {/* Wife Config */}
        <div className="bg-brand-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="w-5 h-5 text-brand-pink" />
            <h3 className="font-bold text-white">Dados Dela (A Braba)</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Nome da Esposa</label>
              <input 
                type="text" 
                value={localConfig.wifeName}
                onChange={(e) => setLocalConfig({ ...localConfig, wifeName: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-pink/50 transition-colors"
                placeholder="Ex: Patrícia"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">WhatsApp Dela (55 + DDD + Numero)</label>
              <input 
                type="text" 
                value={localConfig.wifePhone}
                onChange={(e) => setLocalConfig({ ...localConfig, wifePhone: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-pink/50 transition-colors"
                placeholder="Ex: 5511999999999"
              />
            </div>
          </div>
        </div>


        {/* Sarcasm Level */}
        <div className="bg-brand-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="w-5 h-5 text-brand-warning" />
            <h3 className="font-bold text-white">Nível de Sarcasmo</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-white/40 uppercase">
              <span>Leve</span>
              <span>Humilhante</span>
              <span>Divorcial</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={localConfig.sarcasmLevel}
              onChange={(e) => setLocalConfig({ ...localConfig, sarcasmLevel: parseInt(e.target.value) })}
              className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-brand-warning"
            />
          </div>
        </div>

        {/* Convite Irrecusável */}
        <div className="bg-brand-card/50 p-6 rounded-3xl border border-brand-lilac/30 backdrop-blur-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <div className="flex items-center space-x-3 mb-2">
                 <Share2 className="w-5 h-5 text-brand-lilac" />
                 <h3 className="font-bold text-white tracking-tight">Convite Irrecusável</h3>
               </div>
               <p className="text-xs text-white/50 max-w-sm">
                 Gere um link para a patroa acessar. O link diz: "Oi amor, instalei seu novo cérebro. Clica aqui pra eu parar de reclamar".
               </p>
            </div>
            
            <button
               onClick={() => {
                 const baseUrl = window.location.origin;
                 const text = `Oi amor, instalei seu novo cérebro. Clica aqui pra eu parar de reclamar: ${baseUrl}`;
                 const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                 window.open(url, '_blank');
               }}
               className="shrink-0 flex items-center justify-center px-6 py-3 bg-brand-lilac/20 hover:bg-brand-lilac text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(180,159,220,0.3)]"
            >
               Compartilhar no Zap
            </button>
          </div>
        </div>

        {/* Gerador de Acesso Sarcástico */}
        <div className="bg-gradient-to-br from-brand-card to-black p-6 rounded-3xl border border-brand-pink/20 backdrop-blur-sm space-y-6">
          <div className="flex items-center space-x-3">
             <Key className="w-6 h-6 text-brand-pink" />
             <div>
                <h3 className="font-bold text-white tracking-tight">Acesso Diplomático (Patroa)</h3>
                <p className="text-[10px] text-brand-pink/60 uppercase font-black tracking-widest">Gere credenciais únicas para ela</p>
             </div>
          </div>

          {!wifeAccess ? (
            <button 
              onClick={generateWifeAccess}
              disabled={isGenerating}
              className="w-full py-4 bg-brand-pink/10 border border-brand-pink/30 rounded-2xl text-brand-pink font-bold text-sm hover:bg-brand-pink/20 transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Gerar Email e Senha Fictícios
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-black/60 p-4 rounded-xl border border-white/5 relative group">
                  <p className="text-[9px] text-white/30 uppercase font-bold mb-1">Email Sarcástico</p>
                  <p className="text-sm font-mono text-brand-lilac break-all">{wifeAccess.email}</p>
                </div>
                <div className="bg-black/60 p-4 rounded-xl border border-white/5 relative group">
                  <p className="text-[9px] text-white/30 uppercase font-bold mb-1">Senha da Paz</p>
                  <p className="text-sm font-mono text-brand-pink">{wifeAccess.pass}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  const baseUrl = window.location.origin;
                  const loginUrl = `${baseUrl}?e=${encodeURIComponent(wifeAccess.email)}&p=${encodeURIComponent(wifeAccess.pass)}`;
                  const text = `Oi amor, aqui está seu acesso ao meu cérebro novo. Clica aqui e os dados já vão estar preenchidos: ${loginUrl}\n\nEmail: ${wifeAccess.email}\nSenha: ${wifeAccess.pass}`;
                  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(waUrl, '_blank');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-brand-lilac text-white shadow-[0_0_20px_rgba(180,159,220,0.4)]'}`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Compartilhado!' : 'Mandar Link Auto-Login'}
              </button>
            </div>
          )}
          <p className="text-[10px] text-white/20 italic">Isso criará uma conta vinculada que enxerga apenas o SEU painel.</p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button 
            disabled={isSaving}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-brand-lilac to-brand-pink text-white font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow active:scale-[0.98] disabled:opacity-50"
            onClick={handleSave}
          >
            {isSaving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? 'Salvando...' : 'Salvar Tudo'}</span>
          </button>
          
          <button 
            onClick={onReset}
            className="py-4 px-8 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Zerar Tudo</span>
          </button>
        </div>

        <div className="text-center mt-6">
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">Versão Alpha 1.0.4 — Salvo Pela Esposa Corp</p>
        </div>
      </div>
    </div>
  );
}
