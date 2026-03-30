import express from 'express'
import { supabase } from '../config/supabase.js'
import { NUMBERS } from '../config/constants.js'
import { mensagens } from '../messages/sarcasmo.js'
import {
  getUserByPhone,
  atualizarStatus,
  adicionarPontos,
} from '../services/db.js'
import { MISSION_STATUS } from '../config/constants.js'

export const router = express.Router()

let clienteWA = null

export function setClienteHTTP(client) {
  clienteWA = client
}

const enviar = async (numero, texto) => {
  if (!clienteWA) return
  try {
    await clienteWA.sendMessage(`${numero}@s.whatsapp.net`, { text: texto })
  } catch (err) {
    console.error('HTTP enviar:', err.message)
  }
}

// ── Health check ───────────────────────────────────────────
router.get('/health', (_, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ── Adicionar missão manualmente ───────────────────────────
router.post('/missao', async (req, res) => {
  const { user_phone, title, scheduled_time, date } = req.body
  console.log(`📝 [MISSÃO] Tentativa de criar para: ${user_phone} - Titulo: ${title}`)

  try {
    if (!user_phone || !title) {
      return res.status(400).json({ error: 'user_phone e title são obrigatórios' })
    }

    // 1. Busca Usuário
    const user = await getUserByPhone(user_phone)
    if (!user) {
      console.error(`❌ [MISSÃO] Usuário ${user_phone} não encontrado no banco!`)
      return res.status(404).json({ error: `Usuário ${user_phone} não está cadastrado no banco do Supabase.` })
    }

    if (!supabase) {
      console.error('❌ [MISSÃO] Supabase não inicializado!')
      return res.status(503).json({ error: 'Backend não conseguiu conectar ao Supabase. Verifique as chaves ENV.' })
    }

    // 2. Insere no Banco
    console.log(`💾 [MISSÃO] Gravando no banco para user_id: ${user.id}...`)
    const { data, error } = await supabase
      .from('missions')
      .insert({
        user_id: user.id,
        title,
        scheduled_time: scheduled_time ?? '09:00:00',
        date: date ?? new Date().toISOString().split('T')[0],
        status: MISSION_STATUS.PENDING,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [MISSÃO] Erro do Supabase ao inserir:', error.message)
      throw error
    }

    console.log('✅ [MISSÃO] Salva com sucesso no banco!')

    // 3. Notifica no WhatsApp em background (fire and forget total)
    setImmediate(() => {
        enviar(NUMBERS.main, `📝 Nova missão criada: *${title}*`).catch(e => console.warn('⚠️ Erro notificação WA:', e.message))
    })

    return res.json({ success: true, mission: data })
  } catch (err) {
    console.error('💥 [MISSÃO] Erro fatal no POST /missao:', err)
    return res.status(500).json({ error: 'Erro interno ao salvar: ' + err.message })
  }
})

// ── Completar missão via HTTP ───────────────────────────────
router.patch('/missao/:id/done', async (req, res) => {
  try {
    const { id } = req.params

    const { data: missao, error: errBusca } = await supabase
      .from('missions')
      .select('*')
      .eq('id', id)
      .single()

    if (errBusca || !missao) return res.status(404).json({ error: 'Missão não encontrada' })

    await atualizarStatus(id, MISSION_STATUS.DONE)
    const novoScore = await adicionarPontos(missao.user_id, 10)

    const user = await getUserByPhone(NUMBERS.main)
    await enviar(NUMBERS.main, `${mensagens.parabens(missao.title)}\n\n📊 Pontuação: *${novoScore} pts*`)

    res.json({ success: true, score: novoScore })
  } catch (err) {
    console.error('PATCH /missao/:id/done:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── Listar missões de hoje ─────────────────────────────────
router.get('/missoes/:phone', async (req, res) => {
  try {
    const user = await getUserByPhone(req.params.phone)
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    const hoje = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', hoje)
      .order('scheduled_time')

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
