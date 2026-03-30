import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import QRCode from 'qrcode'
import pino from 'pino'
import { 
  makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore 
} from '@whiskeysockets/baileys'

import { iniciarCrons, setCliente } from './services/scheduler.js'
import { processarMensagem } from './handlers/comandos.js'
import { router, setClienteHTTP } from './api/routes.js'

import fs from 'fs'

// ── Express & API ──────────────────────────────────────────
const app  = express()
app.use(cors())
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use('/api', router)

let latestQR = null
let latestPairingCode = null

// Interface de Pareamento (Nova & Moderna)
app.get('/qr', async (req, res) => {
  if (!latestQR && !latestPairingCode) {
    return res.send(`
      <body style="background:#000; color:white; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center;">
        <div>
          <h1 style="color:#00ffa3;">⚡ INICIANDO COMPOSIÇÃO BAILEYS...</h1>
          <p>Estabelecendo conexão via socket direto.</p>
          <script>setTimeout(()=>location.reload(), 5000)</script>
        </div>
      </body>
    `)
  }
  
  try {
    const qrImage = latestQR ? await QRCode.toDataURL(latestQR) : null
    res.send(`
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; background:#050505; color:white; padding:20px;">
        <h1 style="color:#00ffa3; text-transform:uppercase; letter-spacing:3px; border-bottom:2px solid #00ffa3; padding-bottom:10px; margin-bottom:30px;">🛡️ PLANO C: ELITE BAILEYS</h1>
        
        <div style="display:flex; flex-wrap:wrap; gap:50px; justify-content:center; width:100%; max-width:900px;">
          
          <div style="text-align:center; flex:1; min-width:300px; padding:20px; background:#0f0f0f; border-radius:15px; border:1px solid #1a1a1a;">
            <h3 style="color:#00ffa3;">MÉTODO A: CÓDIGO DE PAREAMENTO</h3>
            ${latestPairingCode ? `
              <div style="padding:40px 20px; background:#000; border:2px solid #00ffa3; border-radius:10px; margin:20px 0;">
                <span style="font-size:54px; font-weight:bold; color:#00ffa3; letter-spacing:6px; font-family:monospace;">${latestPairingCode}</span>
              </div>
              <p style="color:#aaa; font-size:14px;">No celular: <b>Aparelhos Conectados</b> > <b>Conectar com número</b>.</p>
            ` : `
              <div style="padding:40px 20px; color:#555;">Buscando código...</div>
              <script>setTimeout(()=>location.reload(), 10000)</script>
            `}
          </div>

          <div style="text-align:center; flex:1; min-width:300px; padding:20px; background:#0f0f0f; border-radius:15px; border:1px solid #1a1a1a;">
            <h3 style="color:#00ffa3;">MÉTODO B: QR CODE</h3>
            ${qrImage ? `
              <div style="padding:15px; background:white; border-radius:10px; width:fit-content; margin:20px auto;">
                <img src="${qrImage}" style="width:220px; height:220px;" />
              </div>
            ` : '<div style="padding:40px 20px; color:#555;">Aguardando QR...</div>'}
          </div>

        </div>
        <button onclick="location.reload()" style="margin-top:40px; padding:10px 20px; background:transparent; border:1px solid #333; color:#555; cursor:pointer;">RECARREGAR PAINEL</button>
      </div>
    `)
  } catch (err) {
    res.status(500).send('Erro no sistema central.')
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 PLANO C ONLINE na porta ${PORT}`)
  console.log(`🔗 PAINEL: https://to-ligado-production.up.railway.app/qr`)
})

// ── Lógica Central Baileys ─────────────────────────────────
async function connectToWhatsApp() {
  const baseSessionPath = process.env.SESSION_PATH ? `${process.env.SESSION_PATH}_baileys` : './auth_baileys'
  const { state, saveCreds } = await useMultiFileAuthState(baseSessionPath)
  
  let version = [2, 3000, 1015901307]
  try {
    const { version: latest } = await fetchLatestBaileysVersion()
    version = latest
  } catch (e) {
    console.warn('⚠️ Fallback para versão padrão do WhatsApp.')
  }

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }), // Log silencioso para não poluir o Railway
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    // Melhor compatibilidade
    browser: ["O Corretor", "Chrome", "1.0.0"],
  })

  // Solicita Pairing Code automaticamente se necessário
  const pairingNumber = process.env.MAIN_USER_NUMBER?.replace(/\D/g, '')
  if (pairingNumber && !sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(pairingNumber)
        latestPairingCode = code
        console.log(`🔑 [PAIRING] CÓDIGO GERADO PELO BAILEYS: ${code}`)
      } catch (err) {
        console.error('❌ [PAIRING] Erro no código Baileys:', err.message)
      }
    }, 5000)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    
    if (qr) latestQR = qr
    
    if (connection === 'close') {
      const statusCode = lastDisconnect.error?.output?.statusCode
      console.log(`⚠️ Conexão Baileys fechada. Reason: ${statusCode}`)
      
      if (statusCode === DisconnectReason.loggedOut) {
        console.log('🚨 Sessão expirada ou deslogada! Limpando dados corrompidos para reiniciar...')
        fs.rmSync(baseSessionPath, { recursive: true, force: true })
        connectToWhatsApp()
      } else {
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut
        if (shouldReconnect) connectToWhatsApp()
      }
    } else if (connection === 'open') {
      console.log('✅ Baileys Conectado com Sucesso!')
      latestQR = null
      latestPairingCode = null
      
      // Injeta cliente nos módulos
      setCliente(sock)
      setClienteHTTP(sock)
      iniciarCrons()
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return
    
    for (const msg of m.messages) {
      if (msg.key.fromMe) continue
      
      const body = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || 
                   msg.message?.imageMessage?.caption
                   
      if (!body?.startsWith('!')) continue

      // Adaptador Robusto para o processarMensagem
      const mockMessage = {
        from: msg.key.remoteJid,
        author: msg.key.participant || msg.key.remoteJid,
        body: body,
        reply: async (txt) => {
          await sock.sendMessage(msg.key.remoteJid, { text: txt })
        }
      }

      try {
        await processarMensagem(sock, mockMessage)
      } catch (err) {
        console.error('❌ Erro no comando:', err.message)
      }
    }
  })
}

connectToWhatsApp().catch(err => console.error('FATAL SYSTEM ERROR:', err))
