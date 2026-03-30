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

// ── QR/Pairing Visualizer ──────────────────────────────────
let latestQR = null
let latestPairingCode = null

app.get('/qr', async (req, res) => {
  if (!latestQR && !latestPairingCode) {
    return res.send('<body style="background:#111; color:white; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;"><div><h1>⏳ Aguarde...</h1><p>O Corretor está preparando seu manifesto de conexão.</p><script>setTimeout(()=>location.reload(), 3000)</script></div></body>')
  }
  
  try {
    const qrImage = latestQR ? await QRCode.toDataURL(latestQR) : null
    res.send(`
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; background:#0a0a0a; color:white; padding:20px;">
        <h1 style="color:#00ffa3; text-transform:uppercase; letter-spacing:2px; border-bottom:2px solid #00ffa3; padding-bottom:10px;">🛡️ O CORRETOR - CENTRAL DE COMANDO</h1>
        
        <div style="display:flex; flex-wrap:wrap; gap:40px; justify-content:center; margin-top:30px;">
          
          ${qrImage ? `
          <div style="text-align:center;">
            <h3>OPÇÃO 1: ESCANEAR QR</h3>
            <div style="padding:15px; background:white; border-radius:10px; width:fit-content; margin:0 auto;">
              <img src="${qrImage}" style="width:250px; height:250px;" />
            </div>
          </div>
          ` : ''}

          ${latestPairingCode ? `
          <div style="text-align:center;">
            <h3>OPÇÃO 2: CÓDIGO DE PAREAMENTO</h3>
            <div style="padding:40px 20px; background:#1a1a1a; border:2px dashed #00ffa3; border-radius:10px;">
              <span style="font-size:48px; font-weight:bold; color:#00ffa3; letter-spacing:8px; font-family:monospace;">${latestPairingCode}</span>
            </div>
            <p style="color:#aaa; max-width:300px; margin-top:15px;">No WhatsApp: <b>Aparelhos Conectados</b> > <b>Conectar com número</b>. Digite este código.</p>
          </div>
          ` : ''}

        </div>

        <p style="margin-top:40px; color:#555; font-style:italic;">A página irá fechar assim que o sistema detectar a conexão.</p>
        <script>
          // Recarrega se o código expirar ou se nada aparecer
          setTimeout(() => { if(!document.querySelector('span')) location.reload() }, 20000);
        </script>
      </div>
    `)
  } catch (err) {
    res.status(500).send('Erro ao processar visualização')
  }
})

app.listen(PORT, () => {
  console.log(`🌐 API ONLINE na porta ${PORT}`)
  console.log(`🔗 PAINEL DE CONEXÃO: https://[seu-site].up.railway.app/qr`)
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
client.on('qr', async (qr) => {
  latestQR = qr 
  
  // Solicita código de pareamento se houver número configurado
  const pairingNumber = process.env.MAIN_USER_NUMBER?.replace(/\D/g, '')
  
  if (pairingNumber && !latestPairingCode) {
    console.log(`📲 Solicitando código de pareamento para ${pairingNumber} em 5s...`)
    
    // Pequeno delay para garantir que a UI interna está pronta (evita erro 't: t')
    setTimeout(async () => {
      try {
        latestPairingCode = await client.requestPairingCode(pairingNumber)
        console.log(`🔑 CÓDIGO DE PAREAMENTO: ${latestPairingCode}`)
      } catch (err) {
        console.error('❌ Erro ao solicitar pairing code:', err)
        latestPairingCode = null // permite tentar de novo no próximo QR
      }
    }, 5000)
  }

  console.log('\n📱 Escaneie o QR Code ou use o Pairing Code no navegador...')
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  latestQR = null
  latestPairingCode = null // Limpa tudo
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
