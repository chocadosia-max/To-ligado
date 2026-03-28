import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RefreshCcw, Lock, Copy, CheckCircle2, MessageCircle } from 'lucide-react';
import type { AppConfig } from '../hooks/useSupabaseData';

interface ExcuseGeneratorProps {
  config: AppConfig;
  onLogEvent?: (tag: string, content: string, status: any) => void;
}

export function ExcuseGenerator({ config, onLogEvent }: ExcuseGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [excuse, setExcuse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const FAILSAFE_EXCUSES = [
    "O pneu furou bem em frente ao quartel general. Tive que trocar no braço, enquanto um gato me julgava.",
    "O vizinho me confundiu com um agente secreto e me deteve por 10 minutos para tirar dúvidas sobre geopolítica e churrasco.",
    "Meu celular atualizou o sistema bem na hora de mandar a mensagem. O processo de segurança do banco travou meu cérebro junto.",
    "O cachorro engoliu a chave do carro. Tive que esperar a natureza (ou o chaveiro) seguir seu curso.",
    "Fui parado pelo síndico para discutir o futuro do condomínio. Um verdadeiro sequestro emocional sem pedido de resgate.",
    "Entrei em um loop temporal no corredor do supermercado tentando decidir entre papel higiênico folha dupla ou tripla.",
    "Fui abduzido por extraterrestres, mas eles me devolveram porque eu não parava de falar que precisava chegar em casa logo.",
    "Um enxame de abelhas resolveu fazer uma convenção no capô do meu carro. Tive que esperar a ata ser assinada.",
    "O GPS entrou em modo depressivo e me levou para dar uma volta no quarteirão 'para a gente pensar na vida'.",
    "Estava meditando sobre como ser o marido perfeito e acabei transcendendo o tempo e o espaço por alguns minutos.",
    "Fui parado por uma velhinha que precisava de ajuda para atravessar a rua... e depois para achar o gato... e depois para configurar o Zap.",
    "Um unicórnio atravessou a frente do carro. Tive que parar para conferir se eu não estava delirando de fome.",
    "O botão da camisa estourou e tive que fazer uma cirurgia de emergência com um clipe de papel para não chegar indecente.",
    "A gravidade estava 2% mais forte hoje no caminho de volta, o que atrasou consideravelmente meu deslocamento.",
    "Fui atingido por um raio de procrastinação vindo de um satélite chinês desgovernado. Só passou agora."
  ];

  const generateExcuse = async () => {
    setIsGenerating(true);
    setExcuse(null);
    setCopied(false);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wifeName: config.wifeName,
          sarcasmLevel: config.sarcasmLevel,
          category: 'Atraso genérico ou esquecimento de pedido'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setExcuse(data.excuse);
        onLogEvent?.('Álibi', 'IA gerou desculpa com sucesso.', 'pending');
      } else {
        // Fallback para desculpas estáticas se a cota estourar
        const randomFailsafe = FAILSAFE_EXCUSES[Math.floor(Math.random() * FAILSAFE_EXCUSES.length)];
        setExcuse(randomFailsafe);
        onLogEvent?.('Reserva', 'Cota de IA excedida. Álibi de emergência usado.', 'critical');
      }
    } catch (e) {
      const randomFailsafe = FAILSAFE_EXCUSES[Math.floor(Math.random() * FAILSAFE_EXCUSES.length)];
      setExcuse(randomFailsafe);
      onLogEvent?.('Reserva', 'Erro de conexão. Álibi local ativado.', 'critical');
    } finally {
      setIsGenerating(false);
    }
  };


  const sendToWhatsApp = () => {
    if (!excuse) return;
    const phone = config.wifePhone.replace(/\D/g, '');
    if (!phone) {
      alert('Configure o WhatsApp da Comandante nos Ajustes primeiro!');
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(excuse)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    if (excuse) {
      navigator.clipboard.writeText(excuse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-card to-brand-dark border border-brand-lilac/20 p-5 mt-6 group">
      {/* Premium Badge */}
      <div className="absolute top-0 right-0 py-1 px-3 bg-brand-warning/20 rounded-bl-xl border-l border-b border-brand-warning/20">
        <span className="text-[10px] font-black text-brand-warning tracking-widest flex items-center shadow-[0_0_10px_rgba(255,149,0,0.5)]">
          <Lock className="w-3 h-3 mr-1" /> PRO
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center text-white">
          <Wand2 className="w-5 h-5 mr-2 text-brand-pink" />
          IA de Desculpas Prontas
        </h3>
        <p className="text-sm text-white/50">Gerador plausível de historinhas (Powered by Gemini)</p>
      </div>

      <button 
        onClick={generateExcuse}
        disabled={isGenerating}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-lilac to-brand-pink text-white font-bold tracking-wide flex items-center justify-center relative shadow-[0_5px_20px_rgba(255,97,166,0.3)] hover:shadow-[0_5px_30px_rgba(255,97,166,0.5)] transition-shadow overflow-hidden"
      >
        <span className="relative z-10 flex items-center">
          {isGenerating ? (
            <>
              <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
              Inventando algo crível...
            </>
          ) : (
            'Me salva, por favor'
          )}
        </span>
        
        {/* Shimmer effect */}
        {!isGenerating && (
          <motion.div
            className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-30"
            animate={{ left: '200%' }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
        )}
      </button>

      <AnimatePresence>
        {excuse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-sm italic text-white/90">"{excuse}"</p>
            <div className="mt-3 flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex-[2] py-2 flex items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white/80 hover:bg-white/20 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-brand-success mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <button onClick={generateExcuse} className="flex-1 py-2 flex items-center justify-center rounded-md bg-white/10 text-white/80 hover:bg-white/20 transition-colors">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Outra
                </button>
              </div>
              
              <button 
                onClick={sendToWhatsApp}
                className="w-full py-2.5 flex items-center justify-center rounded-md bg-brand-success/20 text-xs font-bold text-brand-success hover:bg-brand-success/30 border border-brand-success/30 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar para a Comandante
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
