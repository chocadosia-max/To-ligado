import './style.css'

// ── Configurações ──────────────────────────────────────────
const API_BASE = 'https://to-ligado-production.up.railway.app/api'
const USER_PHONE = '5592981134347'

// ── Seletores ──────────────────────────────────────────────
const missionsContainer = document.getElementById('missions-container')
const scoreValue = document.querySelector('#score-card .value')
const efficiencyValue = document.querySelector('#efficiency-card .value')
const addMissionBtn = document.getElementById('add-mission-btn')

// View Elements
const mainView = document.querySelector('main')
const navItems = document.querySelectorAll('.nav-item')
const viewCache = {
  today: '',
  stats: `
    <div class="view-content animate-fade">
      <h2 class="view-title">ESTATÍSTICAS</h2>
      <div class="stat-card glass full-width">
        <label>DESEMPENHO SEMANAL</label>
        <div class="chart-placeholder">
          <div class="bar" style="height: 40%"></div>
          <div class="bar" style="height: 60%"></div>
          <div class="bar" style="height: 80%"></div>
          <div class="bar" style="height: 100%"></div>
          <div class="bar" style="height: 70%"></div>
          <div class="bar" style="height: 90%"></div>
          <div class="bar" style="height: 50%"></div>
        </div>
      </div>
      <div class="mini-stats">
        <div class="mini-card glass"><h4>7</h4><span>Dia Atual</span></div>
        <div class="mini-card glass"><h4>142</h4><span>Total Missões</span></div>
      </div>
    </div>
  `,
  settings: `
    <div class="view-content animate-fade">
      <h2 class="view-title">AJUSTES</h2>
      <div class="settings-list">
        <div class="setting-item glass">
          <div>
            <h4>Modo Noturno</h4>
            <p>Otimizado para OLED</p>
          </div>
          <div class="toggle active"></div>
        </div>
        <div class="setting-item glass">
          <div>
            <h4>Notificações Sarcásticas</h4>
            <p>Ativar lembretes do Corretor</p>
          </div>
          <div class="toggle active"></div>
        </div>
        <div class="setting-item glass logout" onclick="location.reload()">
          <h4>Sair do Sistema</h4>
        </div>
      </div>
      <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:10px; letter-spacing:1px;">
        VERSÃO 1.0.4 - O CORRETOR ELITE
      </div>
    </div>
  `
}

// ── Lógica de Dados ────────────────────────────────────────
async function fetchDashboard() {
  try {
    console.log('📡 Conectando ao servidor central em:', API_BASE)
    
    // Teste de conexão/saúde
    const health = await fetch(`${API_BASE}/health`).catch(e => {
        console.warn('⚠️ Health check falhou:', e.message)
        return null
    })
    
    if (health && health.ok) {
        document.querySelector('.status-badge').innerHTML = '<span class="dot active"></span> ONLINE'
        document.querySelector('.status-badge .dot').style.background = '#00ffa3'
    } else {
        document.querySelector('.status-badge').innerHTML = '<span class="dot offline"></span> OFFLINE'
        document.querySelector('.status-badge .dot').style.background = '#ff0055'
    }

    // 1. Busca missões
    const res = await fetch(`${API_BASE}/missoes/${USER_PHONE}`)
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}`)
    }
    const missions = await res.json()
    
    renderMissions(missions)
    updateStats(missions)
  } catch (err) {
    console.error('❌ Erro no Dashboard:', err)
    missionsContainer.innerHTML = `<div class="loading-state" style="color: var(--danger)">ERRO DE CONEXÃO: ${err.message}<br><small style="opacity: 0.5; font-size: 10px;">Verifique se o backend no Railway está ativo.</small></div>`
  }
}

function renderMissions(missions) {
  if (missions.length === 0) {
    missionsContainer.innerHTML = '<div class="loading-state">Nenhuma missão no radar para hoje.</div>'
    return
  }

  missionsContainer.innerHTML = missions.map(m => `
    <div class="mission-item ${m.status === 'DONE' ? 'done' : ''}" data-id="${m.id}">
      <div class="mission-checkbox">
        ${m.status === 'DONE' ? '✓' : ''}
      </div>
      <div class="mission-info">
        <h4>${m.title}</h4>
        <span class="time">${m.scheduled_time.slice(0, 5)}</span>
      </div>
    </div>
  `).join('')

  // Bind clicks
  document.querySelectorAll('.mission-item').forEach(item => {
    item.onclick = () => toggleMission(item.dataset.id, item.classList.contains('done'))
  })
}

async function toggleMission(id, isDone) {
  if (isDone) return // Já está feito

  const item = document.querySelector(`[data-id="${id}"]`)
  if (item) item.classList.add('syncing')

  try {
    const res = await fetch(`${API_BASE}/missao/${id}/done`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (res.ok) {
      console.log('✅ Missão concluída!')
      fetchDashboard() // Recarrega
    }
  } catch (err) {
    alert('Erro ao sincronizar missão: ' + err.message)
  } finally {
    if (item) item.classList.remove('syncing')
  }
}

// ── Modal de Missão ────────────────────────────────────────
function showAddMissionModal() {
  const modal = document.createElement('div')
  modal.className = 'modal-overlay animate-fade'
  modal.innerHTML = `
    <div class="modal-content glass animate-slide-up">
      <h3>NOVA MISSÃO</h3>
      <div class="input-group">
        <label>O QUE PRECISA SER FEITO?</label>
        <input type="text" id="mission-title" placeholder="Ex: Treino de pernas" autofocus>
      </div>
      <div class="input-group">
        <label>HORÁRIO LIMITE</label>
        <input type="time" id="mission-time" value="${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}">
      </div>
      <div class="modal-actions">
        <button id="cancel-mission" class="btn-secondary">CANCELAR</button>
        <button id="save-mission" class="btn-primary">ADICIONAR</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)

  const close = () => modal.remove()
  modal.querySelector('#cancel-mission').onclick = close
  
  modal.querySelector('#save-mission').onclick = async () => {
    const title = document.getElementById('mission-title').value
    const time = document.getElementById('mission-time').value
    
    if (!title) return alert('Dê um nome para a missão!')

    const btn = modal.querySelector('#save-mission')
    btn.disabled = true
    btn.innerText = 'SALVANDO...'

    try {
      const res = await fetch(`${API_BASE}/missao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_phone: USER_PHONE,
          title: title,
          scheduled_time: time + ':00'
        })
      })

      if (res.ok) {
        close()
        fetchDashboard()
      } else {
        throw new Error('Falha no servidor')
      }
    } catch (err) {
      alert('Erro ao criar missão: ' + err.message)
      btn.disabled = false
      btn.innerText = 'ADICIONAR'
    }
  }
}

// ── Navegação ─────────────────────────────────────────────
function switchView(viewId, clickedEl) {
  navItems.forEach(btn => btn.classList.remove('active'))
  clickedEl.classList.add('active')

  if (viewId === 'today') {
    mainView.innerHTML = viewCache.today
    // Re-bind elementos do 'Hoje'
    fetchDashboard()
    document.getElementById('add-mission-btn').onclick = showAddMissionModal
    return
  }

  // Se for a primeira vez que saímos do 'Hoje', salvamos o HTML atual
  if (viewCache.today === '') {
    viewCache.today = mainView.innerHTML
  }

  mainView.innerHTML = viewCache.stats // Default/placeholder
  mainView.innerHTML = viewCache[viewId]
}

function updateStats(missions) {
  const total = missions.length
  const done = missions.filter(m => m.status === 'DONE').length
  const score = done * 10 
  const efficiency = total > 0 ? Math.round((done / total) * 100) : 0

  // Animação simples dos valores
  scoreValue.innerText = score.toString().padStart(3, '0')
  efficiencyValue.innerText = `${efficiency}%`
}

// ── Inicialização ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Dashboard inicializado')
  
  // Cache inicial do view 'Today'
  viewCache.today = mainView.innerHTML
  
  fetchDashboard()
  
  // Botão Add
  document.getElementById('add-mission-btn').onclick = showAddMissionModal

  // Nav
  navItems.forEach(btn => {
    btn.onclick = () => switchView(btn.dataset.view, btn)
  })
  
  // PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('✅ PWA: Service Worker registrado', reg.scope)
      }).catch(err => {
        console.warn('❌ PWA: Falha no registro', err)
      })
    })
  }

  // Refresh manual ao tocar no logo
  document.querySelector('.logo').onclick = () => fetchDashboard()
})
