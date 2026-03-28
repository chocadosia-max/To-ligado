export const config = {
  runtime: 'edge', 
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: 'Chave do Gemini não encontrada. Configure GEMINI_API_KEY no Vercel.' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }

  try {
    const { wifeName, sarcasmLevel, category } = await req.json();

    const systemPrompt = `IA sarcástica. Marido em apuros com esposa "${wifeName}". Sarcasmo: ${sarcasmLevel}/100. Problema: "${category}". Gere apenas 1 desculpa direta e hilária, sem explicações.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: "Mande a desculpa perfeita!" }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 150,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API do Gemini');
    }

    const excuse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sistema de desculpas sobrecarregado (Erro IA).";

    return new Response(JSON.stringify({ excuse: excuse.trim() }), { 
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
