<template>
  <div class="app">
    <AppHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <div class="main-layout">
      <AppSidebar :is-open="isSidebarOpen" />
      
      <!-- Mobile Backdrop -->
      <div 
        class="sidebar-backdrop" 
        :class="{ visible: isSidebarOpen }"
        @click="isSidebarOpen = false"
      ></div>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
      <RightSidebar :popular-items="popularItems" />

      <!-- Mobile Bottom Navigation -->
      <nav class="mobile-bottom-nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <i class="fas fa-home"></i>
          <span>Home</span>
        </router-link>
        <router-link to="/trending" class="nav-item" :class="{ active: $route.path === '/trending' }">
          <i class="fas fa-fire"></i>
          <span>Trending</span>
        </router-link>
        <router-link to="/watchlist" class="nav-item" :class="{ active: $route.path === '/watchlist' }">
          <i class="fas fa-bookmark"></i>
          <span>Watchlist</span>
        </router-link>
        <div class="nav-item" @click="isSidebarOpen = true">
          <i class="fas fa-bars"></i>
          <span>Menu</span>
        </div>
      </nav>
    </div>
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

const route = useRoute()
const popularItems = ref([])
const isSidebarOpen = ref(false)
const toastRef = ref(null)

// Error Boundary Fallback
onErrorCaptured((err) => {
  console.error('Captured by App.vue:', err)
  showToast('Terjadi kesalahan sistem. Silakan muat ulang halaman.', 'error')
  return false // block error from reaching browser console twice
})

// Provide toast method globally
const showToast = (message, type = 'info', duration = 4000) => {
  if (toastRef.value) {
    toastRef.value.addToast(message, type, duration)
  }
}
provide('toast', showToast)

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  isSidebarOpen.value = false
})

onMounted(async () => {
  try {
    const series = await getTrendingSeries()
    popularItems.value = series.slice(0, 5)
  } catch (error) {
    console.error('Failed to load popular items:', error)
  }
})
</script>

<style>
/* Import Font Awesome */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.app {
  min-height: 100vh;
}

.main-layout {
  display: flex;
  min-height: calc(100vh - 70px);
  position: relative;
}

.main-content {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-x: hidden;
  width: 100%;
  margin-left: 240px; /* Offset for fixed sidebar */
}

/* Mobile Backdrop */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  display: none;
}

.sidebar-backdrop.visible {
  opacity: 1;
  pointer-events: auto;
}

/* Mobile Bottom Nav */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-color);
  padding: 10px 0;
  z-index: 100;
  justify-content: space-around;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  flex: 1;
}

.nav-item i {
  font-size: 18px;
}

.nav-item.active {
  color: var(--accent-primary);
}

.nav-item:active {
  transform: scale(0.9);
}

@media (max-width: 1024px) {
  .sidebar-backdrop {
    display: block;
  }
  
  .main-content {
    margin-left: 0;
    padding-bottom: 80px; /* Space for bottom nav */
  }

  .mobile-bottom-nav {
    display: flex;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-md);
    padding-bottom: 80px;
  }
}
</style>
