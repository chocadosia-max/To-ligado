import Anthropic from '@anthropic-ai/sdk';

export const config = {
  runtime: 'edge', // Using Edge runtime is faster and standard
};

// Vercel will inject process.env.ANTHROPIC_API_KEY if configured in Dashboard
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  // Se a chave não estiver configurada no Vercel
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'Chave da Anthropic não encontrada. Configure ANTHROPIC_API_KEY nas variáveis de ambiente do Vercel.' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }

  try {
    const { wifeName, sarcasmLevel, category } = await req.json();

    const systemPrompt = `Você é uma inteligência artificial sarcástica especializada em inventar as desculpas mais absurdas, 
hilárias e (quase) convincentes para salvar maridos de encrencas com a esposa. 
O marido está em apuros com a esposa cujo nome é "${wifeName}". 
O nível de sarcasmo da sua resposta deve ser ${sarcasmLevel} em uma escala de 0 a 100 
(onde 0 = extremamente humilde e com medo, 50 = levemente irônico, e 100 = nível divórcio implacável e muito arriscado).
A desculpa precisa ser criativa e justificar o seguinte problema/categoria: "${category}". 
Seja direto, escreva apenas a desculpa (como se fosse o marido falando, na primeira pessoa, ou uma narração caótica). Não dê explicações.`;

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Rápido, barato e muito bom para humor
      max_tokens: 300,
      temperature: 0.9,
      system: systemPrompt,
      messages: [
        { role: "user", content: "Mande a desculpa perfeita e rápida, meu casamento depende disso!" }
      ]
    });

    // O retorno de Anthropic tem content que é um array; pegamos block.text se for text
    const textContent = message.content.find(block => block.type === 'text');
    const excuse = textContent ? (textContent as any).text : "Sistema de desculpas sobrecarregado (Erro IA).";

    return new Response(JSON.stringify({ excuse }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: 'Falha crítica no gerador de Lero-Lero: ' + error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
