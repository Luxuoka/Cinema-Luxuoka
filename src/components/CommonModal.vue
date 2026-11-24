<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container" :class="variant">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="close-btn" @click="close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="close">{{ cancelText }}</button>
            <button class="btn btn-primary" :class="variant" @click="confirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  title: String,
  message: String,
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  variant: { type: String, default: 'primary' } // primary, danger, warning
})

const emit = defineEmits(['close', 'confirm'])

function close() {
  emit('close')
}

function confirm() {
  emit('confirm')
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalScale {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  color: var(--text-muted);
  font-size: 18px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 24px 20px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: rgba(0,0,0,0.1);
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: #333;
}

.btn-primary.primary {
  background: var(--accent-gradient);
  color: #000;
}

.btn-primary.danger {
  background: #ff4757;
  color: #fff;
}

.btn-primary.warning {
  background: #ffa502;
  color: #000;
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
