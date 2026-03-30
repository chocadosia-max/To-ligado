// ============================================================
//  ARSENAL SARCÁSTICO DO CORRETOR
//  Todas as mensagens em arrays — sorteia aleatoriamente.
// ============================================================

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// ---------- LEMBRETES (missão ainda pending) ----------
const LEMBRETES = [
  (missao) => `⏰ Ei, *${missao}* ainda tá na fila. Você lembrou, né? Ou foi mais uma vítima da sua procrastinação crônica?`,
  (missao) => `👀 Só passando pra checar... *${missao}* ainda existe. Surpresa! Ela não se fez sozinha.`,
  (missao) => `🔔 Lembrete gentil: *${missao}*. Ênfase em "gentil" porque amanhã não vai ser mais assim.`,
  (missao) => `😤 *${missao}* ainda te esperando. A paciência dela é maior que a sua produtividade. Difícil, mas é.`,
  (missao) => `📋 Lista de coisas que você fez hoje: ?\nLista de coisas pendentes: *${missao}*. Bonito, né?`,
]

// ---------- COBRANÇAS (missão atrasada) ----------
const COBRACANCAS = [
  (missao) => `🚨 ATRASADA! *${missao}* estava no plano. Mas planos são só sugestões pra você, né?`,
  (missao) => `⚠️ *${missao}* virou história de ontem. Literalmente. Você vai completar ou a gente finge que nunca existiu?`,
  (missao) => `😬 Situação: *${missao}* não foi feita. Desculpa aceita: Nenhuma. Próximo passo: Fazer. Simples assim.`,
  (missao) => `🤦 *${missao}* ainda pendente. Enquanto isso, o universo continuou girando sem te esperar.`,
  (missao) => `🔴 Alerta vermelho: *${missao}* escapou mais uma vez. Você tem superpoderes de evitar tarefas.`,
]

// ---------- PARABÉNS (missão concluída) ----------
const PARABENS = [
  (missao) => `✅ *${missao}* feita! Olha só, um milagre aconteceu. Anota o dia no calendário.`,
  (missao) => `🎉 Conseguiu! *${missao}* completa. Guardei a surpresa... mas não esperava muito.`,
  (missao) => `💪 *${missao}* = Done. Viu? Não dói. Ou doeu e você não contou pra mim.`,
  (missao) => `🏆 *${missao}* concluída! Pontos na conta. A procrastinação perdeu essa batalha.`,
  (missao) => `😲 *${missao}* feita?! Sério?! Anotem: produtividade apareceu hoje. Rara espécie.`,
]

// ---------- BOM DIA ----------
const BOM_DIA = [
  (nome) => `☀️ Bom dia, *${nome}*! Seu plano de hoje chegou. Faça as missões antes que sua desculpa apareça primeiro.`,
  (nome) => `🌅 Acordou! Parabéns. Agora *${nome}*, hora de fazer algo útil. Suas missões te esperam com ansiedade.`,
  (nome) => `😴➡️🚀 *${nome}*, chega de sonho. Hora da realidade — e a realidade tem missões pendentes pra você.`,
]

// ---------- BOA NOITE / RESUMO ----------
const BOA_NOITE = [
  (feitas, total) => `🌙 Resumo do dia: *${feitas}/${total}* missões cumpridas. ${feitas === total ? 'Impressionante. Quase não acreditei.' : 'O resto virou dívida pro amanhã. Durma bem... se conseguir.'}`,
  (feitas, total) => `📊 Fechamento do dia: *${feitas} de ${total}* missões. ${feitas >= total * 0.8 ? '✅ Dia decente. Não brilhante, mas decente.' : '😬 Abaixo da média. Amanhã tente ser você, mas melhor.'}`,
]

// ---------- PENALIDADE ----------
const PENALIDADES = [
  (missao, pts) => `💸 *-${pts} pontos* por largar *${missao}* pelo caminho. Cada ponto conta. Pelo menos alguma coisa conta pra você.`,
  (missao, pts) => `📉 *${missao}* não concluída = *-${pts}pts*. A conta chegou. Como sempre.`,
  (missao, pts) => `🧾 Débito: *${pts} pontos* por negligenciar *${missao}*. O Corretor não esquece. Nunca.`,
]

// ---------- EXPORTS ----------
export const mensagens = {
  lembrete:   (missao) => pick(LEMBRETES)(missao),
  cobranca:   (missao) => pick(COBRACANCAS)(missao),
  parabens:   (missao) => pick(PARABENS)(missao),
  bomDia:     (nome)   => pick(BOM_DIA)(nome),
  boaNoite:   (feitas, total) => pick(BOA_NOITE)(feitas, total),
  penalidade: (missao, pts)   => pick(PENALIDADES)(missao, pts),
}
