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
let isAuthenticating = false

app.get('/qr', async (req, res) => {
  if (!latestQR && !latestPairingCode) {
    return res.send(`
      <body style="background:#111; color:white; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center;">
        <div>
          <h1 style="color:#00ffa3;">⚡ INICIALIZANDO NÚCLEO...</h1>
          <p>O Corretor está acessando os servidores do WhatsApp.</p>
          <div style="margin-top:20px; color:#555;">Status: Aguardando sinal da rede...</div>
          <script>setTimeout(()=>location.reload(), 5000)</script>
        </div>
      </body>
    `)
  }
  
  try {
    const qrImage = latestQR ? await QRCode.toDataURL(latestQR) : null
    res.send(`
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; background:#050505; color:white; padding:20px;">
        <h1 style="color:#00ffa3; text-transform:uppercase; letter-spacing:3px; border-bottom:2px solid #00ffa3; padding-bottom:10px; margin-bottom:30px;">🛡️ COMANDO TÔ LIGADO</h1>
        
        <div style="display:flex; flex-wrap:wrap; gap:50px; justify-content:center; width:100%; max-width:900px;">
          
          <div style="text-align:center; flex:1; min-width:300px; padding:20px; background:#0f0f0f; border-radius:15px; border:1px solid #1a1a1a;">
            <h3 style="color:#00ffa3;">MÉTODO A: PAREAMENTO DIRETO</h3>
            ${latestPairingCode ? `
              <div style="padding:40px 20px; background:#000; border:2px solid #00ffa3; border-radius:10px; margin:20px 0;">
                <span style="font-size:54px; font-weight:bold; color:#00ffa3; letter-spacing:6px; font-family:monospace;">${latestPairingCode}</span>
              </div>
              <p style="color:#aaa; font-size:14px;">No celular: <b>Aparelhos Conectados</b> > <b>Conectar com número</b>. Use seu número.</p>
            ` : `
              <div style="padding:40px 20px; color:#555;">Gerando código...</div>
              <script>setTimeout(()=>location.reload(), 10000)</script>
            `}
          </div>

          <div style="text-align:center; flex:1; min-width:300px; padding:20px; background:#0f0f0f; border-radius:15px; border:1px solid #1a1a1a;">
            <h3 style="color:#00ffa3;">MÉTODO B: QR CODE</h3>
            ${qrImage ? `
              <div style="padding:15px; background:white; border-radius:10px; width:fit-content; margin:20px auto;">
                <img src="${qrImage}" style="width:220px; height:220px;" />
              </div>
            ` : '<div style="padding:40px 20px; color:#555;">Aguardando...</div>'}
          </div>

        </div>

        <button onclick="location.reload()" style="margin-top:40px; padding:10px 20px; background:transparent; border:1px solid #333; color:#555; cursor:pointer; border-radius:5px;">FORÇAR ATUALIZAÇÃO</button>
      </div>
    `)
  } catch (err) {
    res.status(500).send('Erro no sistema central.')
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
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
  },
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? undefined,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
    ],
  },
})

// ── Eventos WhatsApp ───────────────────────────────────────
client.on('qr', async (qr) => {
  latestQR = qr 
  
  if (isAuthenticating) return // Evita múltiplas chamadas
  
  const pairingNumber = process.env.MAIN_USER_NUMBER?.replace(/\D/g, '')

  if (pairingNumber && !latestPairingCode) {
    isAuthenticating = true
    console.log(`📲 [PAIRING] Iniciando fluxo para ${pairingNumber}...`)
    
    // O WhatsApp Web demora a carregar o botão de pareamento na nuvem. 
    // Vamos esperar 20s para garantir que o seletor está visível.
    setTimeout(async () => {
      let attempts = 3
      while (attempts > 0 && !latestPairingCode) {
        try {
          console.log(`📲 [PAIRING] Tentativa ${4 - attempts}/3...`)
          latestPairingCode = await client.requestPairingCode(pairingNumber)
          console.log(`🔑 [PAIRING] CÓDIGO GERADO: ${latestPairingCode}`)
          break
        } catch (err) {
          console.error(`❌ [PAIRING] Falha na tentativa:`, err.message || err)
          attempts--
          if (attempts > 0) {
             console.log('⏳ [PAIRING] Aguardando 10s para re-tentar...')
             await new Promise(r => setTimeout(r, 10000))
          }
        }
      }
      isAuthenticating = false
    }, 20000)
  }

  console.log('\n📱 Escaneie o QR Code ou use o Pairing Code no navegador...')
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  latestQR = null
  latestPairingCode = null 
  isAuthenticating = false
  console.log('✅ WhatsApp conectado!')
  console.log('🤖 O Corretor está online e monitorando.\n')

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
