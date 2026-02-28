<template>
  <Teleport to="body">
    <div class="toast-container" v-if="toasts.length > 0">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="toast"
          :class="`toast--${toast.type}`"
          @click="removeToast(toast.id)"
        >
          <i :class="getIcon(toast.type)" class="toast__icon"></i>
          <div class="toast__content">
            <span class="toast__message">{{ toast.message }}</span>
          </div>
          <button class="toast__close" @click.stop="removeToast(toast.id)">
            <i class="fas fa-times"></i>
          </button>
          <div class="toast__progress" :style="{ animationDuration: `${toast.duration}ms` }"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let toastIdCounter = 0

function getIcon(type) {
  switch (type) {
    case 'success': return 'fas fa-check-circle'
    case 'error': return 'fas fa-exclamation-circle'
    case 'warning': return 'fas fa-exclamation-triangle'
    case 'info': return 'fas fa-info-circle'
    default: return 'fas fa-info-circle'
  }
}

function addToast(message, type = 'info', duration = 4000) {
  const id = ++toastIdCounter
  toasts.value.push({ id, message, type, duration })
  
  setTimeout(() => {
    removeToast(id)
  }, duration)
  
  return id
}

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose for use via provide/inject or template refs
defineExpose({ addToast, removeToast })
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--bg-elevated, #1e1e32);
  border: 1px solid var(--border-color, rgba(255,255,255,0.1));
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  min-width: 320px;
  max-width: 420px;
  color: var(--text-primary, #fff);
  font-size: 14px;
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast--success { border-left: 3px solid #22c55e; }
.toast--error { border-left: 3px solid #ef4444; }
.toast--warning { border-left: 3px solid #f59e0b; }
.toast--info { border-left: 3px solid #3b82f6; }

.toast__icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast--success .toast__icon { color: #22c55e; }
.toast--error .toast__icon { color: #ef4444; }
.toast--warning .toast__icon { color: #f59e0b; }
.toast--info .toast__icon { color: #3b82f6; }

.toast__content {
  flex: 1;
}

.toast__message {
  font-weight: 500;
  line-height: 1.4;
}

.toast__close {
  background: none;
  border: none;
  color: var(--text-muted, #666);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 12px;
}

.toast__close:hover {
  color: var(--text-primary, #fff);
  background: rgba(255,255,255,0.1);
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--accent-primary, #00d4aa);
  width: 100%;
  animation: progressShrink linear forwards;
  border-radius: 0 0 12px 12px;
}

@keyframes progressShrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* Transitions */
.toast-enter-active {
  animation: toastIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  animation: toastOut 0.25s ease forwards;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(100px) scale(0.9); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes toastOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to { opacity: 0; transform: translateX(100px) scale(0.9); }
}

@media (max-width: 480px) {
  .toast-container {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
  
  .toast {
    min-width: unset;
    max-width: unset;
  }
}
</style>
