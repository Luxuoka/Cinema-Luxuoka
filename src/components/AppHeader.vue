<template>
  <header class="header">
    <div class="header-left">
      <button class="hamburger-btn" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <router-link to="/" class="logo">
        <i class="fas fa-play-circle"></i>
        <span>Cinema Luxuoka</span>
      </router-link>
    </div>

    <nav class="nav-tabs">
      <router-link 
        v-for="tab in tabs" 
        :key="tab.path" 
        :to="tab.path" 
        class="nav-tab"
        :class="{ active: isActive(tab.path) }"
      >
        {{ tab.label }}
      </router-link>
    </nav>

    <div class="search-container">
      <div 
        class="search-bar" 
        :class="{ focused: searchFocused, 'mobile-open': mobileSearchOpen }"
      >
        <i class="fas fa-search" @click="toggleMobileSearch"></i>
        <input 
          ref="searchInput"
          type="text" 
          v-model="searchQuery"
          placeholder="Search movies, series, anime..."
          @focus="searchFocused = true"
          @blur="handleBlur"
          @input="handleSearch"
        />
        <button v-if="searchQuery || mobileSearchOpen" class="clear-btn" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>

        <!-- Search Results Dropdown -->
        <div v-if="showResults && (results.movies.length || results.series.length || results.anime.length)" class="search-results">
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

          <div v-if="results.anime.length" class="result-section">
            <h4><i class="fas fa-dragon"></i> Anime</h4>
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
        </div>

        <div v-if="showResults && searching" class="search-results spinner-overlay">
          <div class="searching">
            <div class="spinner-small"></div>
            <span>Searching...</span>
          </div>
        </div>
      </div>
    </div>

    <div class="user-actions">
        <button class="btn-icon theme-toggle" @click="handleThemeToggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <i class="fas" :class="isDark ? 'fa-sun' : 'fa-moon'"></i>
        </button>
    </div>
  </header>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchAll } from '../services/api'
import { userProfile, toggleTheme } from '../stores/userStore'

const route = useRoute()
const router = useRouter()

const isDark = computed(() => userProfile.theme === 'dark')

function handleThemeToggle() {
  toggleTheme()
}

const tabs = [
  { path: '/movies', label: 'Movies' },
  { path: '/series', label: 'Series' },
  { path: '/anime', label: 'Anime' }
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

function isActive(path) {
  return route.path === path || (path === '/' && route.path === '/')
}

function handleBlur() {
  setTimeout(() => {
    searchFocused.value = false
    showResults.value = false
  }, 200)
}

function toggleMobileSearch() {
  mobileSearchOpen.value = !mobileSearchOpen.value
  if (mobileSearchOpen.value) {
    setTimeout(() => searchInput.value?.focus(), 100)
  }
}

function handleSearch() {
  clearTimeout(searchTimeout)
  
  const query = searchQuery.value.trim()
  if (!query) {
    results.movies = []
    results.series = []
    results.anime = []
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
      results.movies = data.movies
      results.series = data.series
      results.anime = data.anime
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search failed:', error)
      }
    } finally {
      searching.value = false
    }
  }, 400) // Increased debounce slightly for stability
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
  mobileSearchOpen.value = false
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
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
}

@media (max-width: 1024px) {
  .hamburger-btn {
    display: block;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--accent-primary);
  text-decoration: none;
}

.logo i {
  font-size: 1.8rem;
}


.nav-tabs {
  display: flex;
  gap: var(--spacing-sm);
}

.nav-tab {
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  text-decoration: none;
}

.nav-tab:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.nav-tab.active {
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.1);
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 var(--spacing-xl);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
}

.search-bar.focused {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-glow);
}

.search-bar i {
  color: var(--text-muted);
}

.search-bar input {
  flex: 1;
  background: transparent;
  color: var(--text-primary);
  font-size: var(--font-sm);
}

.search-bar input::placeholder {
  color: var(--text-muted);
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

.search-results {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 400px;
  overflow-y: auto;
  z-index: 200;
}

.result-section {
  padding: var(--spacing-sm);
}

.result-section h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  font-size: var(--font-xs);
  color: var(--text-muted);
  text-transform: uppercase;
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.result-item:hover {
  background: var(--bg-glass);
}

.result-item img {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-info .title {
  font-size: var(--font-sm);
  font-weight: 500;
}

.result-info .year {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.searching {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  color: var(--text-muted);
}

.user-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.user-btn {
  background: var(--accent-red-gradient);
  border: none;
}

.user-btn:hover {
  background: var(--accent-red-gradient);
  transform: scale(1.05);
}

/* Global minimalist styles */
.logo {
  font-family: 'Inter', sans-serif; /* Ensure clean font */
  font-weight: 800; /* Extra bold */
  color: var(--text-primary); /* White text like reference */
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.logo span {
  display: block; /* Show text */
}

/* Hide icon to match text-only reference style if needed, 
   but keeping it optional. User said "like that", reference has no icon.
   Let's hide the icon for a perfect match. */
.logo i {
  display: none; 
}

.search-container {
  margin: 0;
  position: relative;
  flex: 0;
}

.search-bar {
  background: transparent;
  border: none;
  padding: var(--spacing-sm);
  width: 40px;
  justify-content: center;
  transition: all var(--transition-normal);
}

.search-bar input {
  display: none;
}

/* Expanded state for both mobile and desktop */
.search-bar.mobile-open {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 300px;
  background: var(--bg-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  z-index: 99;
  justify-content: flex-start;
}

.search-bar.mobile-open input {
  display: block;
}

.search-bar i {
  font-size: 1.2rem;
  color: var(--text-primary);
  cursor: pointer;
}

@media (max-width: 768px) {
  .nav-tabs {
    display: none;
  }
  
  .search-bar.mobile-open {
    position: absolute;
    top: 70px;
    right: 0;
    left: 0;
    width: 100%;
    transform: none;
    border-radius: 0;
    border-top: 1px solid var(--border-color);
  }
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
</style>
