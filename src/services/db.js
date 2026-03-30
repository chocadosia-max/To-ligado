import { supabase } from '../config/supabase.js'
import { MISSION_STATUS } from '../config/constants.js'
import moment from 'moment-timezone'
import { TIMEZONE } from '../config/constants.js'

// ── Busca missões de um usuário para hoje ──────────────────
export async function getMissoesHoje(userId) {
  if (!supabase) return []
  const hoje = moment().tz(TIMEZONE).format('YYYY-MM-DD')
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', hoje)
    .order('scheduled_time', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ── Busca missões pending de um usuário ────────────────────
export async function getMissoesPendentes(userId) {
  const hoje = moment().tz(TIMEZONE).format('YYYY-MM-DD')
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', hoje)
    .eq('status', MISSION_STATUS.PENDING)
    .order('scheduled_time', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ── Busca missões atrasadas (hora já passou + ainda pending) ──
export async function getMissoesAtrasadas(userId) {
  const agora = moment().tz(TIMEZONE)
  const hoje  = agora.format('YYYY-MM-DD')
  const horaAtual = agora.format('HH:mm:ss')

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', hoje)
    .eq('status', MISSION_STATUS.PENDING)
    .lt('scheduled_time', horaAtual)

  if (error) throw error
  return data ?? []
}

// ── Atualiza status de uma missão ─────────────────────────
export async function atualizarStatus(missionId, status) {
  const { error } = await supabase
    .from('missions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', missionId)

  if (error) throw error
}

// ── Aplica penalidade ──────────────────────────────────────
export async function aplicarPenalidade(userId, missionId, pontos) {
  // 1. Busca pontuação atual
  const { data: userData, error: userErr } = await supabase
    .from('users')
    .select('score')
    .eq('id', userId)
    .single()

  if (userErr) throw userErr

  const novoScore = Math.max(0, (userData.score ?? 0) - pontos)

  // 2. Atualiza pontuação
  const { error: scoreErr } = await supabase
    .from('users')
    .update({ score: novoScore })
    .eq('id', userId)

  if (scoreErr) throw scoreErr

  // 3. Registra no histórico
  const { error: logErr } = await supabase
    .from('penalties')
    .insert({ user_id: userId, mission_id: missionId, points: pontos })

  if (logErr) throw logErr

  return novoScore
}

// ── Adiciona pontos por completar ─────────────────────────
export async function adicionarPontos(userId, pontos = 10) {
  const { data: userData, error: userErr } = await supabase
    .from('users')
    .select('score')
    .eq('id', userId)
    .single()

  if (userErr) throw userErr

  const novoScore = (userData.score ?? 0) + pontos

  const { error } = await supabase
    .from('users')
    .update({ score: novoScore })
    .eq('id', userId)

  if (error) throw error
  return novoScore
}

// ── Busca usuário pelo número de WhatsApp ──────────────────
export async function getUserByPhone(phone) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('whatsapp', phone)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

// ── Resumo do dia ──────────────────────────────────────────
export async function getResumoDia(userId) {
  const missoes = await getMissoesHoje(userId)
  const feitas  = missoes.filter(m => m.status === MISSION_STATUS.DONE).length
  return { feitas, total: missoes.length, missoes }
}
