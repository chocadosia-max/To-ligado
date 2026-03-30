import 'dotenv/config'
import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg

import qrcode from 'qrcode-terminal'
import express from 'express'
import QRCode from 'qrcode'

import { iniciarCrons, setCliente } from './services/scheduler.js'
import { processarMensagem } from './handlers/comandos.js'
import { router, setClienteHTTP } from './api/routes.js'

// ── Express ────────────────────────────────────────────────
const app  = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use('/api', router)

// ── Estado Global ──────────────────────────────────────────
let latestQR = null
let latestPairingCode = null
let isAuthenticating = false

// ── API Auxiliar para Pareamento ──────────────────────────
app.post('/api/request-code', async (req, res) => {
  const pairingNumber = process.env.MAIN_USER_NUMBER?.replace(/\D/g, '')
  if (!pairingNumber) return res.status(400).json({ error: 'Número não configurado' })
  
  try {
    console.log(`📲 [API] Solicitando código manual para ${pairingNumber}...`)
    latestPairingCode = await client.requestPairingCode(pairingNumber)
    res.json({ code: latestPairingCode })
  } catch (err) {
    console.error('❌ [API] Falha no código manual:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/qr', async (req, res) => {
  if (!latestQR && !latestPairingCode) {
    return res.send(`
      <body style="background:#000; color:white; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center;">
        <div>
          <h1 style="color:#00ffa3; animation: pulse 2s infinite;">⚡ SINCRONIZANDO COM A REDE...</h1>
          <p>O Corretor está estabelecendo um túnel seguro.</p>
          <script>setTimeout(()=>location.reload(), 5000)</script>
          <style>@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }</style>
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
            <div id="pairing-box">
              ${latestPairingCode ? `
                <div style="padding:40px 20px; background:#000; border:2px solid #00ffa3; border-radius:10px; margin:20px 0;">
                  <span style="font-size:54px; font-weight:bold; color:#00ffa3; letter-spacing:6px; font-family:monospace;">${latestPairingCode}</span>
                </div>
                <p style="color:#aaa; font-size:14px;">No celular: <b>Aparelhos Conectados</b> > <b>Conectar com número</b>.</p>
              ` : `
                <button id="btn-code" onclick="requestCode()" style="padding:15px 30px; background:#00ffa3; color:black; border:none; border-radius:5px; font-weight:bold; cursor:pointer; margin:20px 0;">GERAR CÓDIGO AGORA</button>
                <p id="msg" style="color:#555; font-size:12px;">Se falhar, aguarde 10s e tente de novo.</p>
              `}
            </div>
          </div>

          <div style="text-align:center; flex:1; min-width:300px; padding:20px; background:#0f0f0f; border-radius:15px; border:1px solid #1a1a1a;">
            <h3 style="color:#00ffa3;">MÉTODO B: QR CODE</h3>
            ${qrImage ? `
              <div style="padding:15px; background:white; border-radius:10px; width:fit-content; margin:20px auto;">
                <img src="${qrImage}" style="width:220px; height:220px;" />
              </div>
            ` : '<div style="padding:40px 20px; color:#555;">Buscando QR...</div>'}
          </div>

        </div>

        <script>
          async function requestCode() {
            const btn = document.getElementById('btn-code');
            const msg = document.getElementById('msg');
            btn.disabled = true;
            btn.innerText = 'SOLICITANDO...';
            btn.style.opacity = '0.5';
            
            try {
              const res = await fetch('/api/request-code', { method: 'POST' });
              const data = await res.json();
              if (data.code) {
                location.reload();
              } else {
                alert('Erro: ' + (data.error || 'Falha ao gerar'));
                location.reload();
              }
            } catch (e) {
              alert('Erro de conexão com o servidor.');
              location.reload();
            }
          }
          // Checa conexão a cada 5s
          setInterval(() => {
             // futuramente checar status
          }, 5000);
        </script>
      </div>
    `)
  } catch (err) {
    res.status(500).send('Erro no sistema central.')
  }
})

app.listen(PORT, () => {
  console.log(`🌐 API ONLINE na porta ${PORT}`)
  console.log(`🔗 PAINEL: https://to-ligado-production.up.railway.app/qr`)
})

// ── WhatsApp Client ────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: process.env.SESSION_PATH ?? './sessions',
  }),
  // Removido webVersionCache para evitar erro de versão obsoleta
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
    defaultViewport: { width: 1280, height: 720 }
  },
})

// ── Eventos WhatsApp ───────────────────────────────────────
client.on('qr', async (qr) => {
  latestQR = qr 
  
  if (isAuthenticating) return
  
  const pairingNumber = process.env.MAIN_USER_NUMBER?.replace(/\D/g, '')

  if (pairingNumber && !latestPairingCode) {
    isAuthenticating = true
    // Tentativa automática silenciosa após 15s
    setTimeout(async () => {
      if (!latestPairingCode) {
        try {
          latestPairingCode = await client.requestPairingCode(pairingNumber)
          console.log(`🔑 [AUTO] CODE: ${latestPairingCode}`)
        } catch (err) {
          console.error(`❌ [AUTO] Falha pairing:`, err.message)
        }
      }
      isAuthenticating = false
    }, 15000)
  }

  console.log('\n📱 QR CODE PRONTO NO NAVEGADOR.')
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
  process.exit(1)
})

client.on('message', async (message) => {
  if (message.isGroupMsg || message.from === 'status@broadcast') return
  if (!message.body?.startsWith('!')) return

  try {
    await processarMensagem(client, message)
  } catch (err) {
    console.error('Erro ao processar mensagem:', err)
  }
})

// ── Inicia o cliente ───────────────────────────────────────
console.log('🚀 Iniciando conexão segura...')
client.initialize()
