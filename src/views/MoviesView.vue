<template>
  <div class="movies-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-film"></i>
        Movies
      </h1>
      <div class="search-filter">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search movies..."
            @input="handleSearch"
          />
        </div>
        <select v-model="sortBy" class="sort-select" @change="loadMovies">
          <option value="popularity">🔥 Popular</option>
          <option value="vote_average">⭐ Top Rated</option>
          <option value="release_date">📅 Latest</option>
        </select>
      </div>
    </div>

    <!-- Genre Filter Chips -->
    <div class="genre-chips-container">
      <button 
        v-for="genre in genres" 
        :key="genre.id"
        :class="['genre-chip', { active: selectedGenre === genre.id }]"
        @click="toggleGenre(genre.id)"
      >
        {{ genre.name }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="movies.length" class="content-grid">
      <ContentCard 
        v-for="movie in movies" 
        :key="movie.id" 
        :item="movie" 
      />
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-film"></i>
      <h3>No movies found</h3>
      <p>Try searching for something else</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ContentCard from '../components/ContentCard.vue'
import { getTrendingMovies, searchMovies, discoverMoviesByGenre } from '../services/api'

const route = useRoute()

const movies = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedGenre = ref(null)
const sortBy = ref('popularity')

let searchTimeout = null

const genres = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 14, name: 'Fantasy' },
  { id: 12, name: 'Adventure' }
]

onMounted(async () => {
  // Check for genre query param
  if (route.query.genre) {
    const genreId = parseInt(route.query.genre)
    if (genreId) {
      selectedGenre.value = genreId
    }
  }
  await loadMovies()
})

// Watch for route changes
watch(() => route.query.genre, async (newGenre) => {
  if (newGenre) {
    selectedGenre.value = parseInt(newGenre)
    await loadMovies()
  }
})

async function loadMovies() {
  loading.value = true
  try {
    if (selectedGenre.value) {
      movies.value = await discoverMoviesByGenre(selectedGenre.value, sortBy.value)
    } else {
      movies.value = await getTrendingMovies()
    }
  } catch (error) {
    console.error('Failed to load movies:', error)
  } finally {
    loading.value = false
  }
}

function toggleGenre(genreId) {
  if (selectedGenre.value === genreId) {
    selectedGenre.value = null
  } else {
    selectedGenre.value = genreId
  }
  loadMovies()
}

function handleSearch() {
  clearTimeout(searchTimeout)
  
  if (!searchQuery.value.trim()) {
    loadMovies()
    return
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      const data = await searchMovies(searchQuery.value.trim())
      movies.value = data
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      loading.value = false
    }
  }, 500)
}
</script>

<style scoped>
.movies-view {
  animation: fadeIn 0.5s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-2xl);
}

.page-title i {
  color: var(--accent-primary);
}

.search-filter {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  min-width: 250px;
}

.search-box i {
  color: var(--text-muted);
}

.search-box input {
  flex: 1;
  background: transparent;
  color: var(--text-primary);
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  color: var(--text-primary);
  cursor: pointer;
}

/* Genre Chips */
.genre-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
}

.genre-chip {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-normal);
}

.genre-chip:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.genre-chip.active {
  background: var(--accent-gradient);
  border-color: transparent;
  color: var(--bg-primary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  color: var(--text-muted);
  text-align: center;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.3;
}

.empty-state h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
