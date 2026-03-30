import './style.css'

// ── Configurações ──────────────────────────────────────────
const API_BASE = 'https://to-ligado-production.up.railway.app/api'
const USER_PHONE = '5592981134347'

// ── Seletores ──────────────────────────────────────────────
const missionsContainer = document.getElementById('missions-container')
const scoreValue = document.querySelector('#score-card .value')
const efficiencyValue = document.querySelector('#efficiency-card .value')

// ── Lógica de Dados ────────────────────────────────────────
async function fetchDashboard() {
  try {
    // 1. Busca missões
    const res = await fetch(`${API_BASE}/missoes/${USER_PHONE}`)
    if (!res.ok) throw new Error('Falha ao conectar com o servidor central')
    const missions = await res.json()
    
    renderMissions(missions)
    updateStats(missions)
  } catch (err) {
    console.error('Erro no Dashboard:', err)
    missionsContainer.innerHTML = `<div class="loading-state" style="color: var(--danger)">ERRO DE CONEXÃO: ${err.message}</div>`
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
  }
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
  fetchDashboard()
  
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
