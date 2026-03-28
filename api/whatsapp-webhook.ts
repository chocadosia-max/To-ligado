import { supabase } from '../src/lib/supabaseClient';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    console.log('WhatsApp Webhook received:', body);

    // Estrutura genérica (ajustar conforme o provedor: Twilio, Evolution API, etc.)
    // Vamos assumir que recebemos 'sender' (telefone) e 'message' (texto)
    const sender = body.sender || body.from || body.key?.remoteJid?.split('@')[0];
    const messageText = body.message || body.text || body.message?.conversation || body.message?.extendedTextMessage?.text;

    if (!sender || !messageText) {
      return new Response('Invalid request', { status: 400 });
    }

    // 1. Identificar o usuário pelo telefone da esposa (ou do usuário se ele mandar)
    // Buscamos quem tem esse telefone cadastrado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_name, wife_name')
      .or(`wife_phone.eq.${sender},user_phone.eq.${sender}`) // Opcional: permitir o marido mandar tbm
      .single();

    if (!profile) {
      console.log('Nenhum perfil encontrado para o número:', sender);
      return new Response('User not found', { status: 200 }); // Retornar 200 para o webhook não re-tentar
    }

    // 2. Usar Gemini para processar a intenção (Intent Recognition)
    const apiKey = process.env.GEMINI_API_KEY;
    const systemPrompt = `
      Você é o assistente do app "Tô Ligado".
      Usuário: "${profile.user_name}". Comandante: "${profile.wife_name}".
      Ação solicitada no WhatsApp: "${messageText}".
      
      Determine a ação e retorne APENAS um JSON:
      {
        "action": "add_mission" | "complete_mission" | "add_timeline" | "unknown",
        "params": { "text": "...", "pts": 10 } (para add_mission) ou { "mission_keyword": "..." } (para complete_mission)
      }
      
      Exemplo: "Roberto, tira o lixo" -> action: "add_mission", params: { "text": "Tirar o lixo", "pts": 10 }
      Exemplo: "Já lavei a louça" -> action: "complete_mission", params: { "mission_keyword": "louça" }
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const geminiData = await geminiRes.json();
    const aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanJson = aiResponseText.replace(/```json|```/g, '').trim();
    const intent = JSON.parse(cleanJson);

    // 3. Executar a ação no Banco de Dados
    if (intent.action === 'add_mission') {
      await supabase.from('missions').insert({
        user_id: profile.id,
        text: intent.params.text,
        pts: intent.params.pts || 10,
        is_completed: false
      });
      // Também logar na timeline
      await supabase.from('timeline').insert({
        user_id: profile.id,
        tag: 'WhatsApp',
        content: `Nova missão via WhatsApp: ${intent.params.text}`,
        status: 'pending',
        time_display: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else if (intent.action === 'complete_mission') {
      // Tentar achar a missão por keyword
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_completed', false);
      
      const target = missions?.find(m => m.text.toLowerCase().includes(intent.params.mission_keyword?.toLowerCase()));
      if (target) {
        await supabase.from('missions').update({ is_completed: true }).eq('id', target.id);
        await supabase.from('timeline').insert({
          user_id: profile.id,
          tag: 'WhatsApp',
          content: `Missão concluída via WhatsApp: ${target.text}`,
          status: 'done',
          time_display: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }

    return new Response(JSON.stringify({ success: true, intent }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Webhook Error:', err);
    return new Response(err.message, { status: 500 });
  }
}
