import cron from 'node-cron'
import moment from 'moment-timezone'
import { TIMEZONE, NUMBERS, PENALTY_CONFIG, MISSION_STATUS } from '../config/constants.js'
import { mensagens } from '../messages/sarcasmo.js'
import {
  getMissoesPendentes,
  getMissoesAtrasadas,
  getMissoesHoje,
  atualizarStatus,
  aplicarPenalidade,
  getUserByPhone,
  getResumoDia,
} from '../services/db.js'

let clienteWA = null

export function setCliente(client) {
  clienteWA = client
}

// ── Helper: envia mensagem ─────────────────────────────────
async function enviar(numero, texto) {
  if (!clienteWA) return
  try {
    const chatId = `${numero}@s.whatsapp.net`
    await clienteWA.sendMessage(chatId, { text: texto })
    console.log(`📤 [${moment().tz(TIMEZONE).format('HH:mm')}] → ${numero}: ${texto.slice(0, 60)}...`)
  } catch (err) {
    console.error(`❌ Erro ao enviar para ${numero}:`, err.message)
  }
}

// ── Helper: envia pro main e (opcional) parceira ───────────
async function enviarParaTodos(texto) {
  await enviar(NUMBERS.main, texto)
  if (NUMBERS.partner) await enviar(NUMBERS.partner, texto)
}

// ── Formata lista de missões ───────────────────────────────
function formatarLista(missoes) {
  if (!missoes.length) return '_Nenhuma missão no radar._'
  return missoes.map((m, i) => {
    const status = m.status === MISSION_STATUS.DONE ? '✅' :
                   m.status === MISSION_STATUS.FAILED ? '❌' : '⏳'
    return `${status} ${i + 1}. *${m.title}* — ${m.scheduled_time?.slice(0, 5) ?? '??:??'}`
  }).join('\n')
}

// ============================================================
//  CRONS
// ============================================================

export function iniciarCrons() {
  // ── BOM DIA: 07:00 ────────────────────────────────────────
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ CRON: bom dia')
    try {
      const user = await getUserByPhone(NUMBERS.main)
      if (!user) return

      const missoes = await getMissoesHoje(user.id)
      const lista   = formatarLista(missoes)
      const saudacao = mensagens.bomDia(user.name ?? 'Campeão')

      await enviarParaTodos(`${saudacao}\n\n📋 *Missões de hoje:*\n${lista}`)
    } catch (err) {
      console.error('CRON bomDia:', err)
    }
  }, { timezone: TIMEZONE })

  // ── LEMBRETE MANHÃ: 10:00 ─────────────────────────────────
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ CRON: lembrete manhã')
    try {
      const user = await getUserByPhone(NUMBERS.main)
      if (!user) return

      const pendentes = await getMissoesPendentes(user.id)
      for (const m of pendentes) {
        await enviarParaTodos(mensagens.lembrete(m.title))
      }
    } catch (err) {
      console.error('CRON lembrete manhã:', err)
    }
  }, { timezone: TIMEZONE })

  // ── COBRANÇA A CADA HORA (das 09 às 20) ───────────────────
  cron.schedule('0 9-20 * * *', async () => {
    console.log('⏰ CRON: cobrança horária')
    try {
      const user = await getUserByPhone(NUMBERS.main)
      if (!user) return

      const atrasadas = await getMissoesAtrasadas(user.id)
      for (const m of atrasadas) {
        await enviarParaTodos(mensagens.cobranca(m.title))

        // Aplica penalidade e marca como failed
        const novoScore = await aplicarPenalidade(user.id, m.id, PENALTY_CONFIG.defaultPenalty)
        await atualizarStatus(m.id, MISSION_STATUS.FAILED)
        await enviarParaTodos(mensagens.penalidade(m.title, PENALTY_CONFIG.defaultPenalty))
        await enviar(NUMBERS.main, `📊 Pontuação atual: *${novoScore} pts*`)
      }
    } catch (err) {
      console.error('CRON cobrança horária:', err)
    }
  }, { timezone: TIMEZONE })

  // ── RESUMO TARDE: 17:00 ───────────────────────────────────
  cron.schedule('0 17 * * *', async () => {
    console.log('⏰ CRON: resumo tarde')
    try {
      const user = await getUserByPhone(NUMBERS.main)
      if (!user) return

      const { feitas, total, missoes } = await getResumoDia(user.id)
      const lista = formatarLista(missoes)
      await enviarParaTodos(`📋 *Status das missões:*\n${lista}\n\n${mensagens.boaNoite(feitas, total)}`)
    } catch (err) {
      console.error('CRON resumo tarde:', err)
    }
  }, { timezone: TIMEZONE })

  // ── BOA NOITE / FECHAMENTO: 22:00 ─────────────────────────
  cron.schedule('0 22 * * *', async () => {
    console.log('⏰ CRON: boa noite')
    try {
      const user = await getUserByPhone(NUMBERS.main)
      if (!user) return

      const { feitas, total } = await getResumoDia(user.id)
      await enviarParaTodos(mensagens.boaNoite(feitas, total))
    } catch (err) {
      console.error('CRON boa noite:', err)
    }
  }, { timezone: TIMEZONE })

  console.log('✅ Todos os crons ativos (fuso: ' + TIMEZONE + ')')
}
