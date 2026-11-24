<template>
  <AnimatePresence>
    <div v-if="isOpen" class="shortcuts-overlay" @click="close">
      <div class="shortcuts-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-keyboard"></i>
            <h2>Keyboard Shortcuts</h2>
          </div>
          <button class="close-btn" @click="close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="shortcuts-grid">
          <div v-for="s in shortcuts" :key="s.key" class="shortcut-item">
            <span class="shortcut-action">{{ s.action }}</span>
            <kbd class="shortcut-key">{{ s.key }}</kbd>
          </div>
        </div>

        <div class="modal-footer">
          <p>Press <kbd>?</kbd> anytime to open this helper</p>
        </div>
      </div>
    </div>
  </AnimatePresence>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)

const shortcuts = [
  { key: '/', action: 'Search' },
  { key: 'H', action: 'Go Home' },
  { key: 'W', action: 'Watchlist' },
  { key: 'Space', action: 'Play/Pause' },
  { key: 'F', action: 'Fullscreen' },
  { key: 'M', action: 'Mute/Unmute' },
  { key: '←', action: 'Rewind 10s' },
  { key: '→', action: 'Forward 10s' },
  { key: '?', action: 'Show Shortcuts' },
  { key: 'Esc', action: 'Close Modal' }
]

function close() {
  isOpen.value = false
}

function handleKeydown(e) {
  // Only trigger if not in input/textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

  if (e.key === '?' && e.shiftKey) {
    isOpen.value = !isOpen.value
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.shortcuts-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.shortcuts-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  padding: 30px;
  box-shadow: var(--shadow-xl), 0 0 50px rgba(0, 212, 170, 0.1);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title i {
  color: var(--accent-primary);
  font-size: 1.25rem;
}

.modal-title h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: transform 0.2s;
}

.shortcut-item:hover {
  transform: translateX(4px);
  border-color: var(--accent-primary);
}

.shortcut-action {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.shortcut-key {
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
  color: var(--accent-primary);
  box-shadow: 0 2px 0 var(--border-color);
}

.modal-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
