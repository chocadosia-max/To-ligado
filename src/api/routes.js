import express from 'express'
import QRCode from 'qrcode'
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
let latestQR = null
let latestPairingCode = null
let logsServidor = []

function adicionarLog(ms) {
  const time = new Date().toLocaleTimeString('pt-BR')
  logsServidor.push(`[${time}] ${ms}`)
  if (logsServidor.length > 50) logsServidor.shift()
}

export function adicionarLogManual(ms) {
  adicionarLog(ms)
}

// Captura logs do console
const originalLog = console.log
const originalError = console.error
console.log = (...args) => {
  adicionarLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '))
  originalLog(...args)
}
console.error = (...args) => {
  adicionarLog('❌ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '))
  originalError(...args)
}

export function setClienteHTTP(client) {
  clienteWA = client
}

export function setWAState(qr, pairingCode) {
  latestQR = qr
  latestPairingCode = pairingCode
}

const enviar = async (numero, texto) => {
  if (!clienteWA) return
  try {
    await clienteWA.sendMessage(`${numero}@s.whatsapp.net`, { text: texto })
  } catch (err) {
    console.error('HTTP enviar:', err.message)
  }
}

// ── Endpoints de Diagnóstico ───────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    whatsapp: clienteWA ? 'conectado' : 'desconectado',
    tem_qr: !!latestQR,
    tem_pairing: !!latestPairingCode
  })
})

router.get('/qr', (req, res) => {
  if (latestQR) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(latestQR)}`
    res.send(`<body style="background:#111;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
      <h1 style="color:#00ff88;">TÔ LIGADO | CONEXÃO</h1>
      <div style="background:white;padding:20px;border-radius:15px;box-shadow:0 0 30px rgba(0,255,136,0.2);">
        <img src="${qrUrl}" style="width:300px;" alt="QR Code">
      </div>
      <p style="margin-top:20px;opacity:0.7;">Escaneie agora! O QR code expira rápido.</p>
      <button onclick="window.location.reload()" style="background:#333;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Atualizar QR</button>
    </body>`)
  } else if (clienteWA) {
    res.send('<body style="background:#111;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1>✅ WhatsApp Conectado!</h1><p>O bot já está pronto para o combate.</p></body>')
  } else {
    res.send('<body style="background:#111;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1>⏳ Gerando QR Code...</h1><p>Aguardando o servidor Baileys iniciar. Atualize em 10 segundos.</p></body>')
  }
})

router.get('/pairing-code', (req, res) => {
  if (latestPairingCode) {
    res.json({ code: latestPairingCode })
  } else if (clienteWA) {
    res.json({ message: 'O bot já está conectado ao WhatsApp!' })
  } else {
    res.json({ message: 'Aguardando o servidor gerar o código de pareamento...' })
  }
})

router.get('/logs', (req, res) => {
  res.send(`<body style="background:#000;color:#0f0;padding:20px;font-family:monospace;line-height:1.5;">
    <h2 style="color:white;border-bottom:1px solid #333;padding-bottom:10px;">📋 Logs do Sistema (Últimas 50 linhas)</h2>
    <div style="display:flex;flex-direction:column-reverse;">
      ${logsServidor.map(l => `<div>${l}</div>`).join('')}
    </div>
    <script>setTimeout(() => window.location.reload(), 3000)</script>
  </body>`)
})

router.get('/reset', (req, res) => {
  res.send('<body style="background:#111;color:white;padding:20px;font-family:sans-serif;"><h1>🧹 Realizando Reset de Fábrica...</h1><p>O servidor vai reiniciar limpando a sessão. Aguarde 15s e abra os /logs.</p><script>setTimeout(() => window.location.href="/api/logs", 5000)</script></body>')
  process.exit(1) // O Railway reinicia o processo automaticamente
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
