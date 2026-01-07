<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-section">
      <h3 class="sidebar-title">Menu</h3>
      <router-link to="/" class="sidebar-item" :class="{ active: $route.path === '/' }">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/movies" class="sidebar-item" :class="{ active: $route.path === '/movies' }">
        <i class="fas fa-fire"></i>
        <span>Trending</span>
      </router-link>
      <!-- Top Rated Removed as per request -->
      <!-- <a href="#" class="sidebar-item">
        <i class="fas fa-star"></i>
        <span>Top Rated</span>
      </a> -->
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
        <i class="fas fa-dragon"></i>
        <span>Anime</span>
      </router-link>

      <router-link to="/genres" class="sidebar-item" :class="{ active: $route.path === '/genres' }">
        <i class="fas fa-tags"></i>
        <span>Genres</span>
      </router-link>
    </div>

    <!-- Library Section Removed as per request -->
    <!-- 
    <div class="sidebar-section">
      <h3 class="sidebar-title">Library</h3>
      ...
    </div> 
    -->

    <!-- General Section Removed as per request -->
    <!-- 
    <div class="sidebar-section">
      <h3 class="sidebar-title">General</h3>
      ...
    </div>
    -->
  </aside>
</template>

<script setup>
import { computed } from 'vue'
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
  position: fixed; /* Fixed for both mobile and desktop to ensure scroll consistency */
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
}

.sidebar-section {
  margin-bottom: var(--spacing-xl);
}

.sidebar-title {
  font-size: var(--font-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  text-decoration: none;
  margin-bottom: 4px;
  font-weight: 500;
}

.sidebar-item i {
  width: 20px;
  text-align: center;
  font-size: var(--font-md);
}

.sidebar-item:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.sidebar-item.active {
  color: var(--bg-primary);
  background: var(--accent-gradient);
  font-weight: 600;
}

.sidebar-item.active i {
  color: var(--bg-primary);
}

.item-badge {
  margin-left: auto;
  background: var(--accent-secondary);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-xl);
  font-weight: 600;
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
