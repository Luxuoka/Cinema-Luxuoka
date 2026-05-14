<template>
  <div class="app">
    <AppSidebar :is-open="isSidebarOpen" />

    <!-- Sidebar overlay (mobile) -->
    <div
      class="sidebar-overlay"
      :class="{ visible: isSidebarOpen }"
      @click="isSidebarOpen = false"
    ></div>

    <!-- MAIN -->
    <div class="main">
      <AppHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="main-body">
        <main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>

        <RightSidebar :popular-items="popularItems" />
      </div>
    </div>

    <!-- Toast -->
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide, onErrorCaptured } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import RightSidebar from './components/RightSidebar.vue'
import ToastNotification from './components/ToastNotification.vue'
import { getTrendingSeries } from './services/api'
import { initTheme } from './stores/userStore'

const route = useRoute()
const popularItems = ref([])
const isSidebarOpen = ref(false)
const toastRef = ref(null)

// Error boundary
onErrorCaptured((err) => {
  console.error('Captured:', err)
  showToast('Terjadi kesalahan sistem. Silakan muat ulang halaman.', 'error')
  return false
})

// Provide toast globally
const showToast = (message, type = 'info', duration = 4000) => {
  if (toastRef.value) toastRef.value.addToast(message, type, duration)
}
provide('toast', showToast)

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  isSidebarOpen.value = false
})

onMounted(async () => {
  initTheme()
  try {
    const series = await getTrendingSeries()
    popularItems.value = series.slice(0, 5)
  } catch (error) {
    console.error('Failed to load popular items:', error)
  }
})
</script>

<style>
/* Layout root */
.app {
  min-height: 100vh;
  display: flex;
}

/* Main area (right of sidebar) */
.main {
  margin-left: var(--sidebar);
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Content row: main + right sidebar */
.main-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  padding: 28px;
}

@media (max-width: 1024px) {
  .main-content {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
}

/* Sidebar overlay (mobile) */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 99;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.visible {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 1024px) {
  .main {
    margin-left: 0;
  }
  .sidebar-overlay {
    display: block;
  }
}
</style>
