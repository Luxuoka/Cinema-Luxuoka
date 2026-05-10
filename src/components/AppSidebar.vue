<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-section">
      <h3 class="sidebar-title">Menu</h3>
      <router-link to="/" class="sidebar-item" :class="{ active: $route.path === '/' }">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/trending" class="sidebar-item" :class="{ active: $route.path === '/trending' }">
        <i class="fas fa-fire"></i>
        <span>Trending</span>
      </router-link>
      <router-link to="/watchlist" class="sidebar-item" :class="{ active: $route.path === '/watchlist' }">
        <i class="fas fa-bookmark"></i>
        <span>Watchlist</span>
        <span v-if="watchlistCount > 0" class="item-badge">{{ watchlistCount }}</span>
      </router-link>
    </div>

    <div class="sidebar-section">
      <h3 class="sidebar-title">Categories</h3>
      <router-link to="/movies" class="sidebar-item" :class="{ active: $route.path === '/movies' }">
        <i class="fas fa-film"></i>
        <span>Movies</span>
      </router-link>
      <router-link to="/series" class="sidebar-item" :class="{ active: $route.path === '/series' }">
        <i class="fas fa-tv"></i>
        <span>TV Shows</span>
      </router-link>
      <router-link to="/anime" class="sidebar-item" :class="{ active: $route.path === '/anime' }">
        <i class="fas fa-torii-gate" style="color: #FF6B9D;"></i>
        <span>Anime</span>
      </router-link>
    </div>



    <div class="sidebar-section">
      <h3 class="sidebar-title">Support</h3>
      <a 
        href="https://wa.me/6281806080731?text=Halo%20Admin,%20tolong%20upload%20film%20[Judul]%20tahun%20[Tahun],%20terima%20kasih." 
        target="_blank" 
        class="sidebar-item request-btn"
      >
        <i class="fab fa-whatsapp"></i>
        <span>Request Movie</span>
      </a>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { watchlist, userProfile, toggleTheme } from '../stores/userStore'



const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const watchlistCount = computed(() => watchlist.length)
const isDarkMode = computed(() => userProfile.theme === 'dark')

function handleToggleTheme() {
  toggleTheme()
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  position: fixed;
  top: 70px;
  bottom: 0;
  height: auto;
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--border-color);
  padding: var(--spacing-lg) var(--spacing-md);
  overflow-y: auto;
  transition: transform var(--transition-normal);
  z-index: 50;

  /* Custom scrollbar for sidebar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.sidebar:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

.sidebar-section {
  margin-bottom: var(--spacing-xl);
}

.sidebar-title {
  font-size: var(--font-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-weight: 700;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 10px var(--spacing-md);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: all 0.25s ease;
  text-decoration: none;
  margin-bottom: 2px;
  font-weight: 500;
  font-size: 14px;
  position: relative;
}

.sidebar-item i {
  width: 20px;
  text-align: center;
  font-size: var(--font-md);
  transition: color 0.25s ease;
}

.sidebar-item:hover {
  color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.05);
  padding-left: 24px;
}

.sidebar-item:hover i {
  color: var(--accent-primary);
}

.sidebar-item.active {
  background: rgba(0, 217, 165, 0.15);
  border-left: 3px solid #00D9A5;
  color: #00D9A5;
  font-weight: 600;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  margin-left: -16px;
  padding-left: calc(var(--spacing-md) + 16px);
}

.sidebar-item.active i {
  color: #00D9A5;
}


.request-btn:hover {
  background: rgba(37, 211, 102, 0.1) !important;
  color: #25d366 !important;
}

.request-btn i {
  color: #25d366;
}

.item-badge {
  margin-left: auto;
  background: var(--accent-secondary);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-xl);
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.sidebar-item.active .item-badge {
  background: rgba(0,0,0,0.3);
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    top: 70px;
    left: 0;
    height: calc(100vh - 70px);
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
