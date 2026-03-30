import { MISSION_STATUS } from '../config/constants.js'
import { mensagens } from '../messages/sarcasmo.js'
import {
  getUserByPhone,
  getMissoesHoje,
  atualizarStatus,
  adicionarPontos,
} from '../services/db.js'

// ── Normaliza número: remove @c.us e símbolos ─────────────
function normalizarNumero(from) {
  return from.replace('@c.us', '').replace(/\D/g, '')
}

// ── Formata lista de missões ───────────────────────────────
function formatarLista(missoes) {
  if (!missoes.length) return '_Nenhuma missão cadastrada para hoje._'
  return missoes.map((m, i) => {
    const icon = m.status === MISSION_STATUS.DONE   ? '✅' :
                 m.status === MISSION_STATUS.FAILED  ? '❌' :
                 m.status === MISSION_STATUS.SKIPPED ? '⏭️' : '⏳'
    return `${icon} ${i + 1}. *${m.title}* — ${m.scheduled_time?.slice(0, 5) ?? '??:??'}`
  }).join('\n')
}

// ── Processa mensagem recebida ─────────────────────────────
export async function processarMensagem(client, message) {
  const numero = normalizarNumero(message.from)
  const texto  = message.body?.trim().toLowerCase() ?? ''
  const chatId = message.from

  const user = await getUserByPhone(numero)

  // Usuário desconhecido → ignora
  if (!user) return

  const reply = async (msg) => client.sendMessage(chatId, msg)

  // ── AJUDA ──────────────────────────────────────────────
  if (texto === '!ajuda' || texto === '!help') {
    await reply(
      `🤖 *O Corretor — Comandos*\n\n` +
      `📋 *!missoes* — Ver missões de hoje\n` +
      `✅ *!feita <número>* — Marcar missão como feita\n` +
      `⏭️ *!pular <número>* — Pular missão\n` +
      `📊 *!pontos* — Ver sua pontuação\n` +
      `❓ *!ajuda* — Este menu\n\n` +
      `_O Corretor está sempre de olho. Sempre._`
    )
    return
  }

  // ── LISTAR MISSÕES ─────────────────────────────────────
  if (texto === '!missoes' || texto === '!lista') {
    const missoes = await getMissoesHoje(user.id)
    const lista   = formatarLista(missoes)
    await reply(`📋 *Suas missões de hoje:*\n\n${lista}`)
    return
  }

  // ── MARCAR COMO FEITA ─────────────────────────────────
  if (texto.startsWith('!feita')) {
    const partes = texto.split(' ')
    const idx    = parseInt(partes[1], 10) - 1

    if (isNaN(idx) || idx < 0) {
      await reply('❓ Use: *!feita <número>* — ex: !feita 2')
      return
    }

    const missoes = await getMissoesHoje(user.id)
    const missao  = missoes[idx]

    if (!missao) {
      await reply(`⚠️ Missão *${idx + 1}* não encontrada. Use *!missoes* pra ver a lista.`)
      return
    }

    if (missao.status === MISSION_STATUS.DONE) {
      await reply(`😏 *${missao.title}* já foi marcada como feita. Quer medalha dupla?`)
      return
    }

    await atualizarStatus(missao.id, MISSION_STATUS.DONE)
    const novoScore = await adicionarPontos(user.id, 10)
    await reply(`${mensagens.parabens(missao.title)}\n\n📊 Pontuação: *${novoScore} pts*`)
    return
  }

  // ── PULAR MISSÃO ──────────────────────────────────────
  if (texto.startsWith('!pular')) {
    const partes = texto.split(' ')
    const idx    = parseInt(partes[1], 10) - 1

    if (isNaN(idx) || idx < 0) {
      await reply('❓ Use: *!pular <número>* — ex: !pular 1')
      return
    }

    const missoes = await getMissoesHoje(user.id)
    const missao  = missoes[idx]

    if (!missao) {
      await reply(`⚠️ Missão *${idx + 1}* não existe. Veja *!missoes*.`)
      return
    }

    await atualizarStatus(missao.id, MISSION_STATUS.SKIPPED)
    await reply(`⏭️ *${missao.title}* pulada. Sem drama... por enquanto.`)
    return
  }

  // ── VER PONTOS ────────────────────────────────────────
  if (texto === '!pontos' || texto === '!score') {
    await reply(`📊 Sua pontuação atual: *${user.score ?? 0} pts*`)
    return
  }
}
