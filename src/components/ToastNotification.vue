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
          <div class="toast__icon-container">
            <i :class="getIcon(toast.type)" class="toast__icon"></i>
          </div>
          <div class="toast__content">
            <span class="toast__message">{{ toast.message }}</span>
          </div>
          <button class="toast__close" @click.stop="removeToast(toast.id)">
            <i class="fas fa-times"></i>
          </button>
          <div class="toast__progress" :class="toast.type" :style="{ animationDuration: `${toast.duration}ms` }"></div>
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

defineExpose({ addToast, removeToast })
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  min-width: 320px;
  max-width: 450px;
  color: #fff;
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast__icon-container {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.toast--success .toast__icon-container { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.toast--error .toast__icon-container { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.toast--warning .toast__icon-container { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.toast--info .toast__icon-container { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

.toast__icon {
  font-size: 16px;
}

.toast__content {
  flex: 1;
}

.toast__message {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.2px;
}

.toast__close {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  transition: all 0.2s;
  padding: 4px;
}

.toast__close:hover {
  color: #fff;
  transform: rotate(90deg);
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  animation: progressShrink linear forwards;
}

.toast__progress.success { background: #22c55e; }
.toast__progress.error { background: #ef4444; }
.toast__progress.warning { background: #f59e0b; }
.toast__progress.info { background: #3b82f6; }

@keyframes progressShrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* Transitions */
.toast-enter-active {
  animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  animation: toastOut 0.3s ease forwards;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(80px) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes toastOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}

@media (max-width: 1024px) {
  .toast-container {
    bottom: 90px; /* Space for mobile nav */
    right: 16px;
    left: 16px;
  }
}
</style>
