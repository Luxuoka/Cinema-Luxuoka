<template>
  <header class="header">
    <router-link to="/" class="logo">
      <i class="fas fa-play-circle"></i>
      <span>Cinema Luxuoka</span>
    </router-link>

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
      <div class="search-bar" :class="{ focused: searchFocused }">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Search movies, series, anime..."
          @focus="searchFocused = true"
          @blur="handleBlur"
          @input="handleSearch"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Search Results Dropdown -->
      <div v-if="showResults && (results.movies.length || results.series.length || results.anime.length)" class="search-results">
        <div v-if="results.movies.length" class="result-section">
          <h4><i class="fas fa-film"></i> Movies</h4>
          <router-link 
            v-for="item in results.movies.slice(0, 3)" 
            :key="item.id" 
            :to="`/watch/movie/${item.id}`"
            class="result-item"
            @click="clearSearch"
          >
            <img v-if="item.poster" :src="item.poster" :alt="item.title" />
            <div class="result-info">
              <span class="title">{{ item.title }}</span>
              <span class="year">{{ item.year }}</span>
            </div>
          </router-link>
        </div>

        <div v-if="results.series.length" class="result-section">
          <h4><i class="fas fa-tv"></i> TV Shows</h4>
          <router-link 
            v-for="item in results.series.slice(0, 3)" 
            :key="item.id" 
            :to="`/watch/series/${item.id}`"
            class="result-item"
            @click="clearSearch"
          >
            <img v-if="item.poster" :src="item.poster" :alt="item.title" />
            <div class="result-info">
              <span class="title">{{ item.title }}</span>
              <span class="year">{{ item.year }}</span>
            </div>
          </router-link>
        </div>

        <div v-if="results.anime.length" class="result-section">
          <h4><i class="fas fa-dragon"></i> Anime</h4>
          <router-link 
            v-for="item in results.anime.slice(0, 3)" 
            :key="item.id" 
            :to="`/watch/anime/${item.id}`"
            class="result-item"
            @click="clearSearch"
          >
            <img v-if="item.poster" :src="item.poster" :alt="item.title" />
            <div class="result-info">
              <span class="title">{{ item.title }}</span>
              <span class="year">{{ item.year }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <div v-if="showResults && searching" class="search-results">
        <div class="searching">
          <div class="spinner"></div>
          <span>Searching...</span>
        </div>
      </div>
    </div>

    <div class="user-actions">
      <button class="btn-icon" title="Settings">
        <i class="fas fa-cog"></i>
      </button>
      <button class="btn-icon user-btn" title="Profile">
        <i class="fas fa-user"></i>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { searchAll } from '../services/api'

const route = useRoute()

const tabs = [
  { path: '/movies', label: 'Movies' },
  { path: '/series', label: 'Series' },
  { path: '/anime', label: 'Anime' }
]

const searchQuery = ref('')
const searchFocused = ref(false)
const showResults = ref(false)
const searching = ref(false)
const results = reactive({ movies: [], series: [], anime: [] })

let searchTimeout = null

function isActive(path) {
  return route.path === path || (path === '/' && route.path === '/')
}

function handleBlur() {
  setTimeout(() => {
    searchFocused.value = false
    showResults.value = false
  }, 200)
}

function handleSearch() {
  clearTimeout(searchTimeout)
  
  if (!searchQuery.value.trim()) {
    results.movies = []
    results.series = []
    results.anime = []
    showResults.value = false
    return
  }

  searching.value = true
  showResults.value = true

  searchTimeout = setTimeout(async () => {
    try {
      const data = await searchAll(searchQuery.value.trim())
      results.movies = data.movies
      results.series = data.series
      results.anime = data.anime
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      searching.value = false
    }
  }, 500)
}

function clearSearch() {
  searchQuery.value = ''
  results.movies = []
  results.series = []
  results.anime = []
  showResults.value = false
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

@media (max-width: 768px) {
  .nav-tabs {
    display: none;
  }
  
  .search-container {
    margin: 0 var(--spacing-md);
  }
}
</style>
