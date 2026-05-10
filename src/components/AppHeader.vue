<template>
  <header class="header">
    <div class="header-left">
      <button class="hamburger-btn" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <router-link to="/" class="logo">
        <span class="logo-text">Cinema<span class="logo-accent">Luxuoka</span></span>
      </router-link>
    </div>

    <!-- Removed redundant nav-tabs as requested -->


    <div class="header-right">
      <div class="search-container">
        <div 
          class="search-bar" 
          :class="{ focused: searchFocused, 'expanded': searchFocused || searchQuery }"
        >
          <i class="fas fa-search" @click="expandSearch"></i>
          <input 
            ref="searchInput"
            type="text" 
            v-model="searchQuery"
            placeholder="Search movies, series..."
            @focus="searchFocused = true"
            @blur="handleBlur"
            @input="handleSearch"
          />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
            <i class="fas fa-times"></i>
          </button>

          <!-- Search Results Dropdown - Smart Suggestions -->
          <div v-if="searchFocused" class="search-results custom-scrollbar">
            <!-- Suggestions when empty -->
            <div v-if="!searchQuery" class="search-suggestions">
               <div class="suggestion-section">
                  <h4 class="suggestion-title">Trending Now</h4>
                  <div class="trending-list">
                    <div v-for="(term, i) in ['Squid Game 2', 'Deadpool', 'Arcane', 'Moana 2']" :key="term" class="trending-item" @mousedown="searchQuery = term; handleSearch()">
                      <span class="trending-rank">{{ i + 1 }}</span>
                      <span class="trending-name">{{ term }}</span>
                      <i class="fas fa-chart-line trending-icon"></i>
                    </div>
                  </div>
               </div>
            </div>

            <!-- Loading State -->
            <div v-if="searching" class="search-status">
               <i class="fas fa-circle-notch fa-spin"></i> searching...
            </div>

            <!-- Results -->
            <template v-else-if="searchQuery">
              <div v-if="results.movies.length" class="result-section">
                <h4><i class="fas fa-film"></i> Movies</h4>
                <router-link 
                  v-for="item in results.movies.slice(0, 5)" 
                  :key="item.id" 
                  :to="`/watch/movie/${item.id}`"
                  class="result-item"
                  @click="clearSearch"
                >
                  <img v-if="item.poster" :src="item.poster" :alt="item.title" />
                  <div class="result-info">
                    <span class="title" v-html="highlightMatch(item.title, searchQuery)"></span>
                    <span class="year">{{ item.year }} • Movie</span>
                  </div>
                </router-link>
              </div>

              <div v-if="results.series.length" class="result-section">
                <h4><i class="fas fa-tv"></i> TV Series</h4>
                <router-link 
                  v-for="item in results.series.slice(0, 5)" 
                  :key="item.id" 
                  :to="`/watch/series/${item.id}`"
                  class="result-item"
                  @click="clearSearch"
                >
                  <img v-if="item.poster" :src="item.poster" :alt="item.title" />
                  <div class="result-info">
                    <span class="title" v-html="highlightMatch(item.title, searchQuery)"></span>
                    <span class="year">{{ item.year }} • TV Series</span>
                  </div>
                </router-link>
              </div>

              <div v-if="results.anime && results.anime.length" class="result-section">
                <h4><i class="fas fa-torii-gate" style="color:#C44FE0"></i> Anime</h4>
                <router-link 
                  v-for="item in results.anime.slice(0, 5)" 
                  :key="item.id" 
                  :to="`/watch/anime/${item.id}`"
                  class="result-item"
                  @click="clearSearch"
                >
                  <img v-if="item.poster" :src="item.poster" :alt="item.title" />
                  <div class="result-info">
                    <span class="title" v-html="highlightMatch(item.title, searchQuery)"></span>
                    <span class="year">{{ item.year }} • Anime</span>
                  </div>
                </router-link>
              </div>

              <div v-if="!results.movies.length && !results.series.length && (!results.anime || !results.anime.length) && !searching" class="search-status">
                No results found for "{{ searchQuery }}"
              </div>
            </template>
          </div>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchAll } from '../services/api'
import { userProfile, toggleTheme, watchlist } from '../stores/userStore'

const route = useRoute()
const router = useRouter()


const isDark = computed(() => userProfile.theme === 'dark')
const watchlistCount = computed(() => watchlist.length)

// Dropdown states
const showNotifications = ref(false)
const showProfileDropdown = ref(false)
const showSettings = ref(false)

function handleThemeToggle() {
  toggleTheme()
}

// Notifications dummy data
const notifications = ref([
  { 
    id: 1, 
    title: 'Baru Rilis', 
    body: 'The Last of Us S2 E3 sudah tersedia!', 
    time: '2 jam lalu', 
    read: false,
    img: 'https://image.tmdb.org/t/p/w200/uKV9nQ1Yvz48oQiv99S67UM9IlS.jpg'
  },
  { 
    id: 2, 
    title: 'Rekomendasi', 
    body: 'Berdasarkan tontonanmu, coba "Silo"', 
    time: '5 jam lalu', 
    read: true,
    img: 'https://image.tmdb.org/t/p/w200/kREwk7hcyyT99u9tT9SbpZpzdik.jpg'
  }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
}

function handleBlur() {
  setTimeout(() => {
    searchFocused.value = false
    showResults.value = false
  }, 200)
}

function closeAllDropdowns() {
  showNotifications.value = false
  showProfileDropdown.value = false
  showSettings.value = false
}

const tabs = [
  { path: '/movies', label: 'Movies' },
  { path: '/series', label: 'Series' }
]

const searchQuery = ref('')
const searchFocused = ref(false)
const mobileSearchOpen = ref(false)
const showResults = ref(false)
const searching = ref(false)
const results = reactive({ movies: [], series: [], anime: [] })
const searchInput = ref(null)

let searchTimeout = null
let searchAbortController = null

function logout() {
  // Logic for logout
  closeAllDropdowns()
}

function isActive(path) {
  return route.path === path || (path === '/' && route.path === '/')
}

function expandSearch() {
  searchFocused.value = true
  setTimeout(() => searchInput.value?.focus(), 100)
}

function toggleMenu(menu) {
  if (menu === 'notifications') {
    showNotifications.value = !showNotifications.value
    showProfileDropdown.value = false
  } else if (menu === 'profile') {
    showProfileDropdown.value = !showProfileDropdown.value
    showNotifications.value = false
  }
}

function handleSearch() {
  clearTimeout(searchTimeout)
  
  const query = searchQuery.value.trim()
  if (!query) {
    results.movies = []
    results.series = []
    showResults.value = false
    return
  }

  showResults.value = true
  searching.value = true

  searchTimeout = setTimeout(async () => {
    if (searchAbortController) searchAbortController.abort()
    searchAbortController = new AbortController()
    
    try {
      const data = await searchAll(query, searchAbortController.signal)
      results.movies = data.movies || []
      results.series = data.series || []
      results.anime = data.anime || []
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search failed:', error)
      }
    } finally {
      searching.value = false
    }
  }, 400)
}

function highlightMatch(text, query) {
  if (!text || !query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

function clearSearch() {
  searchQuery.value = ''
  results.movies = []
  results.series = []
  results.anime = []
  showResults.value = false
  searchFocused.value = false
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  height: 70px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.hamburger-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: var(--font-lg);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.hamburger-btn:hover {
  background: var(--bg-glass);
}

@media (max-width: 1024px) {
  .hamburger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* Logo */
.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-text {
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 1.4rem;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.logo-accent {
  color: var(--accent-primary);
}

/* Nav Tabs */
.nav-tabs {
  display: flex;
  gap: 4px;
}

.nav-tab {
  padding: 8px 18px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  border-radius: var(--radius-md);
  transition: all 0.25s ease;
  text-decoration: none;
  position: relative;
}

.nav-tab:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.nav-tab.active {
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.1);
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--accent-primary);
  border-radius: 2px;
}

/* Header Right */
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* Search */
.search-container {
  position: relative;
  flex: 0;
}

.search-bar {
  background: transparent;
  border: none;
  padding: var(--spacing-sm);
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.search-bar input {
  display: none;
  flex: 1;
  background: transparent;
  color: var(--text-primary);
  font-size: var(--font-sm);
}

.search-bar input::placeholder {
  color: var(--text-muted);
}

/* Expanded state */
.search-bar.expanded {
  width: 280px;
  background: rgba(255, 255, 255, 0.05);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  justify-content: flex-start;
  gap: var(--spacing-sm);
}

.search-bar.expanded input {
  display: block;
}

.search-bar.focused {
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.05);
  box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.1);
}

.search-bar i {
  font-size: 1.1rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.search-bar i:hover {
  color: var(--accent-primary);
}

.clear-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

/* Search Results */
.search-results {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 420px;
  overflow-y: auto;
  z-index: 200;
}

/* Search Results Dropdown Content */
.search-results :deep(.highlight) {
  color: var(--accent-primary);
  font-weight: 700;
}

.search-status {
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.search-suggestions {
  padding: 15px;
}

.suggestion-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-bottom: 15px;
  padding-left: 5px;
}

.trending-list {
  display: flex;
  flex-direction: column;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}

.trending-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.trending-rank {
  font-size: 18px;
  font-weight: 900;
  color: var(--accent-primary);
  width: 25px;
  text-align: center;
}

.trending-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.trending-icon {
  font-size: 12px;
  color: #4cd137;
  opacity: 0.8;
}

/* User Actions */
.user-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.header-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  position: relative;
  text-decoration: none;
  font-size: 14px;
}

.header-icon:hover {
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.08);
  border-color: rgba(0, 212, 170, 0.15);
}

.profile-btn:hover {
  color: var(--accent-primary);
}

.action-badge-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--accent-secondary);
  border: 2px solid var(--bg-secondary);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

/* Dropdown Menu Styles */
.dropdown-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 15px);
  right: 0;
  width: 320px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-sm);
  z-index: 1000;
  animation: dropdownFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdownFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-sm);
}

.dropdown-header h3 {
  font-size: 14px;
  font-weight: 700;
}

.text-link {
  background: transparent;
  border: none;
  color: var(--accent-primary);
  font-size: 12px;
  cursor: pointer;
}

/* Notifications Dropdown */
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
  cursor: pointer;
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
  background: rgba(0, 212, 170, 0.03);
}

.notif-poster {
  width: 45px;
  height: 65px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
}

.notif-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notif-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.notif-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
  position: absolute;
  top: 15px;
  right: 15px;
  box-shadow: 0 0 10px var(--accent-primary);
}

.notif-title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
  color: var(--text-primary);
}

.notif-body {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 6px;
}

.notif-time {
  font-size: 11px;
  color: var(--text-muted);
}

/* Profile Dropdown */
.profile-dropdown {
  width: 260px;
  padding: 0;
  overflow: hidden;
}

.dropdown-profile-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(255,255,255,0.02);
}

.avatar-large {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 16px;
  box-shadow: 0 0 15px rgba(0, 212, 170, 0.3);
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
}

.profile-meta {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.profile-role {
  font-size: 11px;
  color: var(--accent-primary);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 0;
}

.profile-menu-items {
  padding: 10px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  transform: translateX(5px);
}

.dropdown-item i {
  width: 20px;
  text-align: center;
  font-size: 16px;
  opacity: 0.8;
}

.theme-item {
  justify-content: space-between;
}

.toggle-pill {
  width: 36px;
  height: 20px;
  background: #333;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s;
}

.toggle-pill::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-pill.active {
  background: var(--accent-primary);
}

.toggle-pill.active::after {
  transform: translateX(16px);
  background: #000;
}

.logout-link {
  color: #ff4757;
  margin: 10px;
}

.logout-link:hover {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
}

/* Search Highlighting */
:deep(.highlight) {
  color: var(--accent-primary);
  font-weight: 700;
}

.spinner-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 0 var(--spacing-md);
  }

  .nav-tabs {
    display: none;
  }
  
  .search-bar.mobile-open {
    position: fixed;
    top: 70px;
    right: 0;
    left: 0;
    width: 100%;
    transform: none;
    border-radius: 0;
    border-top: 1px solid var(--border-color);
  }

  .logo-text {
    font-size: 1.2rem;
  }
}
</style>
