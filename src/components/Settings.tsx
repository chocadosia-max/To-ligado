import { useState } from 'react';
import { User, Heart, Zap, Save, RefreshCw, MessageCircle } from 'lucide-react';

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
  onSimulateWebhook?: (msg: string) => void;
}

export function SettingsComponent({ config, onSave, onReset, onSimulateWebhook }: SettingsProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);

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

        {/* Simulação Bot WhatsApp */}
        <div className="bg-brand-success/10 p-6 rounded-3xl border border-brand-success/20 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <MessageCircle className="w-5 h-5 text-brand-success" />
            <h3 className="font-bold text-white">Simulador de Comando (Dela)</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-xs text-brand-success/60 italic font-medium">Use para testar se a IA entende as ordens enviadas pelo WhatsApp dela.</p>
            <div className="flex space-x-2">
              <input 
                id="simMsg"
                type="text" 
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-success/50 transition-colors text-sm"
                placeholder="Ex: 'Amor, compra fralda e tira o lixo'"
              />
              <button 
                onClick={() => {
                   const val = (document.getElementById('simMsg') as HTMLInputElement).value;
                   if (val && onSimulateWebhook) onSimulateWebhook(val);
                }}
                className="px-6 py-3 rounded-xl bg-brand-success/20 text-brand-success font-bold hover:bg-brand-success/30 transition-all active:scale-[0.98] text-sm"
              >
                Enviar
              </button>
            </div>
          </div>
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
