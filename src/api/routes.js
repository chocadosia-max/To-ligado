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
  try {
    const { user_phone, title, scheduled_time, date } = req.body

    if (!user_phone || !title) {
      return res.status(400).json({ error: 'user_phone e title são obrigatórios' })
    }

    const user = await getUserByPhone(user_phone)
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    if (!supabase) return res.status(503).json({ error: 'Banco de dados não configurado' })

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

    if (error) throw error

    // Notifica no WhatsApp
    await enviar(NUMBERS.main, `📝 Nova missão criada: *${title}*`)

    res.json({ success: true, mission: data })
  } catch (err) {
    console.error('POST /missao:', err)
    res.status(500).json({ error: err.message })
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
