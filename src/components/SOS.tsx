import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flower2, Gift, Heart, Loader2, Copy, RefreshCw } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const situations = [
  "Esqueci o aniversário de casamento",
  "Esqueci o aniversário da sogra",
  "Esqueci de buscar o filho na escola",
  "Esqueci de comprar o que ela pediu",
  "Cheguei tarde sem avisar",
  "Esqueci uma data importante",
];

export function SOS() {
  const [situation, setSituation] = useState("");
  const [excuse, setExcuse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateExcuse = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setExcuse("");

    try {
      // Usando o Gemini diretamente (ajuste a chave no .env se necessário)
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Você é um consultor de sobrevivência matrimonial, sarcástico e engraçado. 
      Gere uma desculpa criativa, plausível e levemente cômica para a seguinte situação:

      Situação: "${situation}"

      A desculpa deve ser:
      1. Plausível o suficiente para funcionar
      2. Levemente engraçada (mas não absurda demais)
      3. Curta (máximo 3 frases)
      4. Em português do Brasil

      Responda APENAS com a desculpa, sem introdução.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setExcuse(response.text());
    } catch (error) {
      console.error("Erro na IA:", error);
      setExcuse("Diga que você foi abduzido por aliens que queriam a sua receita de lasanha. É a melhor chance que você tem agora.");
    } finally {
      setLoading(false);
    }
  };

  const copyExcuse = () => {
    navigator.clipboard.writeText(excuse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-card/50 rounded-2xl border border-white/5 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-lilac/20 rounded-lg">
            <Sparkles className="h-6 w-6 text-brand-lilac" />
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Gerador de Desculpas IA</h3>
        </div>
        <p className="text-sm text-white/50 mb-6 italic">
          "Gere uma desculpa profissional para o seu vacilo. A IA não julga. Muito."
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-lilac uppercase tracking-widest pl-1">O QUE VOCÊ FEZ DE ERRADO?</label>
            <input
              placeholder="Ex: Esqueci o aniversário da sogra"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-brand-lilac/50 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {situations.map((s) => (
              <button
                key={s}
                onClick={() => setSituation(s)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                  situation === s 
                  ? 'bg-brand-lilac/20 border-brand-lilac text-brand-lilac' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:text-white/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={generateExcuse}
            disabled={loading || !situation.trim()}
            className="w-full bg-gradient-to-r from-brand-lilac to-brand-pink text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-brand-lilac/20 hover:shadow-brand-lilac/40 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                PROCESSANDO VACILO...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                GERAR DESCULPA MÁGICA ✨
              </>
            )}
          </button>
        </div>

        {/* Resultado */}
        <AnimatePresence>
          {excuse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 bg-brand-lilac/10 border border-brand-lilac/30 rounded-2xl p-5"
            >
              <p className="text-[10px] text-brand-lilac font-black uppercase tracking-widest mb-2">💡 SUA SALVAÇÃO:</p>
              <p className="text-sm text-white leading-relaxed italic">"{excuse}"</p>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={copyExcuse}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "COPIADA!" : "COPIAR"}
                </button>
                <button 
                  onClick={generateExcuse}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  OUTRA
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Kit de Emergência */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white uppercase tracking-tighter pl-1">🚨 Kit de Emergência</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Flower2, label: "Flores 🌹", color: "text-brand-pink", desc: "Plano Alfa" },
            { icon: Gift, label: "Chocolate 🍫", color: "text-brand-lilac", desc: "Plano Beta" },
            { icon: Heart, label: "Jantar 🍕", color: "text-red-500", desc: "Plano Ômega" },
            { icon: Sparkles, label: "Spa 💆", color: "text-cyan-400", desc: "Plano Final" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className="bg-brand-card/30 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-lilac/30 transition-all text-center"
            >
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-white">{item.label}</p>
                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
