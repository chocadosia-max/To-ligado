# Tô Ligado — O Corretor 🤖

Bot WhatsApp de gamificação pessoal com cobranças sarcásticas automáticas.

## Stack

- **whatsapp-web.js** — Integração WhatsApp via Puppeteer
- **Supabase** — Banco de dados (missões, usuários, pontuação)
- **node-cron** — Agendamento automático de notificações
- **Express** — API HTTP para gestão externa
- **Docker** — Containerização para deploy

## Estrutura

```
src/
├── index.js                  # Entry point
├── config/
│   ├── constants.js          # Timezone, números, enums
│   └── supabase.js           # Cliente Supabase
├── messages/
│   └── sarcasmo.js           # Arsenal de mensagens sarcásticas
├── services/
│   ├── db.js                 # Queries Supabase
│   └── scheduler.js          # Crons (bom dia, cobranças, resumos)
├── handlers/
│   └── comandos.js           # Comandos WhatsApp (!missoes, !feita, etc)
└── api/
    └── routes.js             # API HTTP REST
supabase/
└── schema.sql                # Schema do banco
```

## Setup

### 1. Clone e instale
```bash
npm install
```

### 2. Configure o .env
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Crie as tabelas no Supabase
Execute o conteúdo de `supabase/schema.sql` no SQL Editor do Supabase.  
**Lembre de atualizar os números de WhatsApp no INSERT.**

### 4. Rode
```bash
npm run dev       # desenvolvimento (hot reload)
npm start         # produção
```

Na primeira execução, um QR Code aparecerá no terminal — escaneie com o WhatsApp.

## Comandos WhatsApp

| Comando | Descrição |
|---------|-----------|
| `!ajuda` | Menu de comandos |
| `!missoes` | Lista missões de hoje |
| `!feita <n>` | Marca missão N como concluída (+10 pts) |
| `!pular <n>` | Pula missão N |
| `!pontos` | Exibe pontuação atual |

## API HTTP

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/missao` | Cria nova missão |
| PATCH | `/api/missao/:id/done` | Completa missão |
| GET | `/api/missoes/:phone` | Lista missões do dia |

## Crons Automáticos

| Horário | Ação |
|---------|------|
| 07:00 | ☀️ Bom dia + lista do dia |
| 10:00 | 🔔 Lembrete das pendentes |
| 09–20h (hora) | ⚠️ Cobrança de atrasadas + penalidade |
| 17:00 | 📊 Resumo da tarde |
| 22:00 | 🌙 Boa noite + fechamento |

## Deploy no Railway

1. Crie um novo projeto em [railway.app](https://railway.app)
2. Conecte o repositório GitHub
3. Railway detecta o `nixpacks.toml` automaticamente e instala o Chromium
4. Adicione as variáveis de ambiente (copie do `.env.example`):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `MAIN_USER_NUMBER`
   - `PARTNER_NUMBER`
   - `TIMEZONE`
   - `PUPPETEER_EXECUTABLE_PATH` = `/run/current-system/sw/bin/chromium`
5. Railway faz o deploy automaticamente

> ⚠️ **Sessão WhatsApp:** Na primeira execução o QR Code aparece nos **Logs** do Railway. Escaneie pelo app. Após isso a sessão fica salva em `./sessions`.
