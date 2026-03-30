import 'dotenv/config'
import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import express from 'express'

import { iniciarCrons, setCliente } from './services/scheduler.js'
import { processarMensagem } from './handlers/comandos.js'
import { router, setClienteHTTP } from './api/routes.js'

// ── Express ────────────────────────────────────────────────
const app  = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use('/api', router)
app.listen(PORT, () => console.log(`🌐 API rodando na porta ${PORT}`))

// ── WhatsApp Client ────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: process.env.SESSION_PATH ?? './sessions',
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  },
})

// ── Eventos WhatsApp ───────────────────────────────────────
client.on('qr', (qr) => {
  console.log('\n📱 Escaneie o QR Code abaixo no WhatsApp:\n')
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  console.log('✅ WhatsApp conectado!')
  console.log('🤖 O Corretor está online. Ninguém vai escapar hoje.\n')

  setCliente(client)
  setClienteHTTP(client)
  iniciarCrons()
})

client.on('auth_failure', (msg) => {
  console.error('❌ Falha na autenticação WhatsApp:', msg)
})

client.on('disconnected', (reason) => {
  console.warn('⚠️ WhatsApp desconectado:', reason)
  process.exit(1) // Docker vai reiniciar
})

client.on('message', async (message) => {
  // Ignora mensagens de grupos e de status
  if (message.isGroupMsg || message.from === 'status@broadcast') return
  if (!message.body?.startsWith('!')) return // só processa comandos

  try {
    await processarMensagem(client, message)
  } catch (err) {
    console.error('Erro ao processar mensagem:', err)
  }
})

// ── Inicia o cliente ───────────────────────────────────────
console.log('🚀 Iniciando O Corretor...')
client.initialize()
