import { User, Heart, Zap, Save, RefreshCw } from 'lucide-react';

interface SettingsProps {
  config: {
    userName: string;
    wifeName: string;
    sarcasmLevel: number;
  };
  onSave: (newConfig: any) => void;
  onReset: () => void;
}

export function SettingsComponent({ config, onSave, onReset }: SettingsProps) {
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
              value={config.userName}
              onChange={(e) => onSave({ ...config, userName: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lilac/50 transition-colors"
              placeholder="Ex: Roberto"
            />
          </div>
        </div>

        {/* Wife Config */}
        <div className="bg-brand-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="w-5 h-5 text-brand-pink" />
            <h3 className="font-bold text-white">Dados Dela (A Braba)</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Nome da Esposa</label>
            <input 
              type="text" 
              value={config.wifeName}
              onChange={(e) => onSave({ ...config, wifeName: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-pink/50 transition-colors"
              placeholder="Ex: Patrícia"
            />
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
              value={config.sarcasmLevel}
              onChange={(e) => onSave({ ...config, sarcasmLevel: parseInt(e.target.value) })}
              className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-brand-warning"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button 
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-brand-lilac to-brand-pink text-white font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow active:scale-[0.98]"
            onClick={() => alert('Configs salvas (automaticamente por trás dos panos!)')}
          >
            <Save className="w-5 h-5" />
            <span>Salvar Tudo</span>
          </button>
          
          <button 
            onClick={onReset}
            className="py-4 px-8 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Zerar Tudo</span>
          </button>
        </div>

        <div className="text-center">
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">Versão Alpha 1.0.4 — Salvo Pela Esposa Corp</p>
        </div>
      </div>
    </div>
  );
}
