import 'dotenv/config'

export const TIMEZONE = process.env.TIMEZONE || 'America/Manaus'

export const NUMBERS = {
  main: process.env.MAIN_USER_NUMBER,    // ex: 5592981134347
  partner: process.env.PARTNER_NUMBER,   // ex: 5592999999999
}

export const MISSION_STATUS = {
  PENDING:   'pending',
  DONE:      'done',
  FAILED:    'failed',
  SKIPPED:   'skipped',
}

export const PENALTY_CONFIG = {
  lateMinutes: 30,          // minutos de atraso para aplicar penalidade automática
  defaultPenalty: 10,       // pontos descontados por atraso
}
