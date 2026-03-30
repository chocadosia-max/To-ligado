import 'dotenv/config'
import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg

import qrcode from 'qrcode-terminal'
import express from 'express'

import { iniciarCrons, setCliente } from './services/scheduler.js'
import { processarMensagem } from './handlers/comandos.js'
import { router, setClienteHTTP } from './api/routes.js'

// ── Express ────────────────────────────────────────────────
const app  = express()
const PORT = process.env.PORT ?? 3000

import QRCode from 'qrcode'

app.use(express.json())
app.use('/api', router)

// ── QR Code Visualizer ──────────────────────────────────────
let latestQR = null

app.get('/qr', async (req, res) => {
  if (!latestQR) {
    return res.send('<h1>⏳ QR Code ainda não gerado ou o bot já está logado.</h1><p>Aguarde uns segundos e recarregue.</p><script>setTimeout(()=>location.reload(), 3000)</script>')
  }
  
  try {
    const qrImage = await QRCode.toDataURL(latestQR)
    res.send(`
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#111; color:white;">
        <h1 style="color:#00ffa3;">🤖 O Corretor - Conectar</h1>
        <p>Escaneie o código abaixo com o WhatsApp:</p>
        <div style="padding:20px; background:white; border-radius:10px;">
          <img src="${qrImage}" style="width:300px; height:300px;" />
        </div>
        <p style="margin-top:20px; color:#aaa;">O sistema irá recarregar automaticamente após a conexão.</p>
        <script>
          // Opcional: checar se conectou para fechar a tela
        </script>
      </div>
    `)
  } catch (err) {
    res.status(500).send('Erro ao gerar imagem do QR Code')
  }
})

app.listen(PORT, () => {
  console.log(`🌐 API rodando na porta ${PORT}`)
  console.log(`🔗 Scaneie o QR Code em: https://[sua-url-do-railway].railway.app/qr`)
})

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
  latestQR = qr // Guarda para o navegador
  console.log('\n📱 Escaneie o QR Code abaixo no WhatsApp:\n')
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  latestQR = null // Limpa após logar
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
