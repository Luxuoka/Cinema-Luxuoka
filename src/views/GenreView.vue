<template>
  <div class="genre-view">
    <div class="genre-header">
      <h1><i class="fas fa-tags"></i> Browse by Genre</h1>
      <p class="genre-subtitle">Discover content by your favorite genres</p>
    </div>

    <!-- Content Type Tabs -->
    <div class="type-tabs">
      <button 
        v-for="type in contentTypes" 
        :key="type.value"
        :class="['type-tab', { active: activeType === type.value }]"
        @click="activeType = type.value"
      >
        <i :class="type.icon"></i>
        {{ type.label }}
      </button>
    </div>

    <!-- Genre Grid -->
    <div class="genre-grid">
      <router-link 
        v-for="genre in currentGenres" 
        :key="genre.id"
        :to="`/${activeType}?genre=${genre.id}`"
        class="genre-card"
        :style="{ '--genre-color': genre.color }"
      >
        <div class="genre-card__icon">
          <i :class="genre.icon"></i>
        </div>
        <div class="genre-card__info">
          <h3>{{ genre.name }}</h3>
          <p>{{ genre.count || 'Explore' }} titles</p>
        </div>
        <div class="genre-card__arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </router-link>
    </div>

    <!-- Popular Genres Section -->
    <div class="popular-section">
      <h2 class="section-title">🔥 Popular This Week</h2>
      <div class="popular-genres">
        <router-link 
          v-for="genre in popularGenres" 
          :key="genre"
          :to="`/${activeType}?genre=${genre.toLowerCase()}`"
          class="popular-chip"
        >
          {{ genre }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeType = ref('movies')

const contentTypes = [
  { value: 'movies', label: 'Movies', icon: 'fas fa-film' },
  { value: 'series', label: 'TV Shows', icon: 'fas fa-tv' },
  { value: 'anime', label: 'Anime', icon: 'fas fa-dragon' }
]

// Movie/TV Genres (TMDB)
const movieGenres = [
  { id: 28, name: 'Action', icon: 'fas fa-fist-raised', color: '#e74c3c' },
  { id: 12, name: 'Adventure', icon: 'fas fa-compass', color: '#f39c12' },
  { id: 16, name: 'Animation', icon: 'fas fa-child', color: '#9b59b6' },
  { id: 35, name: 'Comedy', icon: 'fas fa-laugh', color: '#f1c40f' },
  { id: 80, name: 'Crime', icon: 'fas fa-user-secret', color: '#34495e' },
  { id: 99, name: 'Documentary', icon: 'fas fa-file-video', color: '#1abc9c' },
  { id: 18, name: 'Drama', icon: 'fas fa-theater-masks', color: '#e91e63' },
  { id: 10751, name: 'Family', icon: 'fas fa-users', color: '#00bcd4' },
  { id: 14, name: 'Fantasy', icon: 'fas fa-hat-wizard', color: '#8e44ad' },
  { id: 36, name: 'History', icon: 'fas fa-landmark', color: '#795548' },
  { id: 27, name: 'Horror', icon: 'fas fa-ghost', color: '#2c3e50' },
  { id: 10402, name: 'Music', icon: 'fas fa-music', color: '#e91e63' },
  { id: 9648, name: 'Mystery', icon: 'fas fa-search', color: '#607d8b' },
  { id: 10749, name: 'Romance', icon: 'fas fa-heart', color: '#e91e63' },
  { id: 878, name: 'Sci-Fi', icon: 'fas fa-rocket', color: '#2196f3' },
  { id: 53, name: 'Thriller', icon: 'fas fa-skull', color: '#c0392b' },
  { id: 10752, name: 'War', icon: 'fas fa-fighter-jet', color: '#455a64' },
  { id: 37, name: 'Western', icon: 'fas fa-hat-cowboy', color: '#8d6e63' }
]

// Anime Genres (Jikan/MAL)
const animeGenres = [
  { id: 1, name: 'Action', icon: 'fas fa-fist-raised', color: '#e74c3c' },
  { id: 2, name: 'Adventure', icon: 'fas fa-compass', color: '#f39c12' },
  { id: 4, name: 'Comedy', icon: 'fas fa-laugh', color: '#f1c40f' },
  { id: 8, name: 'Drama', icon: 'fas fa-theater-masks', color: '#e91e63' },
  { id: 10, name: 'Fantasy', icon: 'fas fa-hat-wizard', color: '#8e44ad' },
  { id: 14, name: 'Horror', icon: 'fas fa-ghost', color: '#2c3e50' },
  { id: 7, name: 'Mystery', icon: 'fas fa-search', color: '#607d8b' },
  { id: 22, name: 'Romance', icon: 'fas fa-heart', color: '#e91e63' },
  { id: 24, name: 'Sci-Fi', icon: 'fas fa-rocket', color: '#2196f3' },
  { id: 36, name: 'Slice of Life', icon: 'fas fa-coffee', color: '#8bc34a' },
  { id: 30, name: 'Sports', icon: 'fas fa-futbol', color: '#4caf50' },
  { id: 37, name: 'Supernatural', icon: 'fas fa-magic', color: '#673ab7' },
  { id: 41, name: 'Suspense', icon: 'fas fa-skull', color: '#c0392b' },
  { id: 25, name: 'Shoujo', icon: 'fas fa-sparkles', color: '#ff69b4' },
  { id: 27, name: 'Shounen', icon: 'fas fa-fire', color: '#ff5722' },
  { id: 42, name: 'Seinen', icon: 'fas fa-user', color: '#3f51b5' },
  { id: 43, name: 'Josei', icon: 'fas fa-female', color: '#9c27b0' },
  { id: 13, name: 'Historical', icon: 'fas fa-landmark', color: '#795548' }
]

const currentGenres = computed(() => {
  if (activeType.value === 'anime') {
    return animeGenres
  }
  return movieGenres
})

const popularGenres = computed(() => {
  if (activeType.value === 'anime') {
    return ['Action', 'Romance', 'Fantasy', 'Comedy', 'Shounen', 'Slice of Life']
  }
  return ['Action', 'Comedy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
})
</script>

<style scoped>
.genre-view {
  animation: fadeIn 0.5s ease;
}

.genre-header {
  margin-bottom: var(--spacing-xl);
}

.genre-header h1 {
  font-size: var(--font-2xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.genre-header h1 i {
  color: var(--accent-primary);
}

.genre-subtitle {
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
}

/* Type Tabs */
.type-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.type-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.type-tab:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.type-tab.active {
  background: var(--accent-gradient);
  border-color: transparent;
  color: var(--bg-primary);
}

/* Genre Grid */
.genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.genre-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-primary);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.genre-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--genre-color, var(--accent-primary));
}

.genre-card:hover {
  border-color: var(--genre-color, var(--accent-primary));
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.08);
}

.genre-card__icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  background: var(--genre-color, var(--accent-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.genre-card__info {
  flex: 1;
}

.genre-card__info h3 {
  font-size: var(--font-md);
  margin-bottom: 2px;
}

.genre-card__info p {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.genre-card__arrow {
  color: var(--text-muted);
  transition: all var(--transition-normal);
}

.genre-card:hover .genre-card__arrow {
  color: var(--genre-color, var(--accent-primary));
  transform: translateX(5px);
}

/* Popular Section */
.popular-section {
  padding: var(--spacing-xl);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.popular-genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.popular-chip {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--accent-gradient);
  color: var(--bg-primary);
  border-radius: var(--radius-xl);
  text-decoration: none;
  font-size: var(--font-sm);
  font-weight: 500;
  transition: all var(--transition-normal);
}

.popular-chip:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .genre-grid {
    grid-template-columns: 1fr;
  }
  
  .type-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
