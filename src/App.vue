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
        <router-view />
      </main>
      <RightSidebar :popular-items="popularItems" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import RightSidebar from './components/RightSidebar.vue'
import { getTopAnime } from './services/api'

const route = useRoute()
const popularItems = ref([])
const isSidebarOpen = ref(false)

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  isSidebarOpen.value = false
})

onMounted(async () => {
  try {
    const anime = await getTopAnime()
    popularItems.value = anime.slice(0, 5)
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

@media (max-width: 1024px) {
  .sidebar-backdrop {
    display: block;
  }
  
  .main-content {
    margin-left: 0; /* Reset margin for mobile */
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-md);
  }
}
</style>
