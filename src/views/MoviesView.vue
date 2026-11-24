<template>
  <div class="movies-view">
    <div class="view-header">
      <div class="header-main">
        <h1>Movies</h1>
        <p class="subtitle">Explore our collection of films</p>
      </div>
      
      <div class="filter-controls">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="localSearchQuery" 
            placeholder="Search in movies..." 
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Genre Filter -->
    <div class="genre-list" ref="genreList">
      <button 
        :class="['genre-btn', { active: selectedGenre === null }]"
        @click="toggleGenre(null)"
      >
        All Genres
      </button>
      <button 
        v-for="genre in genres" 
        :key="genre.id"
        :class="['genre-btn', { active: selectedGenre === genre.id }]"
        @click="toggleGenre(genre.id)"
      >
        {{ genre.name }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="content-grid">
        <SkeletonLoader v-for="i in 12" :key="i" />
      </div>
    </div>

    <template v-else-if="movies.length > 0">
      <div class="results-info">
        <span>Menampilkan <strong>{{ movies.length }}</strong> film
          <span v-if="currentPage < totalPages"> dari <strong>~{{ totalPages * 20 }}</strong></span>
        </span>
      </div>
      <div class="content-grid">
        <ContentCard 
          v-for="movie in movies" 
          :key="movie.id" 
          :item="movie" 
        />
      </div>
      <!-- Load More -->
      <div class="load-more-section" v-if="currentPage < totalPages && !localSearchQuery">
        <button class="load-more-btn" @click="loadMore" :disabled="loadingMore">
          <span v-if="loadingMore"><i class="fas fa-spinner fa-spin"></i> Memuat...</span>
          <span v-else><i class="fas fa-plus"></i> Tampilkan Lebih Banyak</span>
        </button>
      </div>
      <div class="loading-more-grid" v-if="loadingMore">
        <SkeletonLoader v-for="i in 8" :key="i" />
      </div>
    </template>

    <div v-else class="no-results">
      <i class="fas fa-search"></i>
      <h3>No movies found</h3>
      <p>Try adjusting your search or filters</p>
      <button @click="resetFilters" class="btn btn-secondary">Reset Filters</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getTrendingMovies, searchMovies, discoverMovies } from '../services/api'
import ContentCard from '../components/ContentCard.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const movies = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const localSearchQuery = ref('')
const selectedGenre = ref(null)
const selectedYear = ref(null)
const selectedCountry = ref(null)
const sortBy = ref('popularity')
const currentPage = ref(1)
const totalPages = ref(1)

const genres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
]

const years = Array.from({ length: 2026 - 1950 }, (_, i) => 2025 - i)

const countries = [
  { code: 'US', name: 'USA' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'GB', name: 'UK' },
  { code: 'CN', name: 'China' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'ES', name: 'Spain' },
  { code: 'TH', name: 'Thailand' }
]

async function loadMovies() {
  loading.value = true
  currentPage.value = 1
  try {
    if (localSearchQuery.value.trim()) {
      const results = await searchMovies(localSearchQuery.value.trim())
      movies.value = results
      totalPages.value = 1
    } else {
      const data = await discoverMovies({
        genre: selectedGenre.value,
        year: selectedYear.value,
        country: selectedCountry.value,
        sortBy: sortBy.value,
        page: 1
      })
      movies.value = data.results
      totalPages.value = data.totalPages
    }
  } catch (error) {
    console.error('Failed to load movies:', error)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || currentPage.value >= totalPages.value) return
  loadingMore.value = true
  currentPage.value++
  try {
    const data = await discoverMovies({
      genre: selectedGenre.value,
      year: selectedYear.value,
      country: selectedCountry.value,
      sortBy: sortBy.value,
      page: currentPage.value
    })
    movies.value = [...movies.value, ...data.results]
    totalPages.value = data.totalPages
  } catch (error) {
    console.error('Failed to load more movies:', error)
  } finally {
    loadingMore.value = false
  }
}

let searchTimeout = null
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadMovies()
  }, 500)
}

function toggleGenre(genreId) {
  selectedGenre.value = genreId
  loadMovies()
}

function resetFilters() {
  localSearchQuery.value = ''
  selectedGenre.value = null
  selectedYear.value = null
  selectedCountry.value = null
  sortBy.value = 'popularity'
  loadMovies()
}

onMounted(loadMovies)
</script>

<style scoped>
.movies-view {
  animation: fadeIn 0.4s ease;
}

.view-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-md);
}

.header-main h1 {
  font-size: var(--font-2xl);
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-muted);
  font-size: var(--font-sm);
}

.filter-controls {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 8px;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.dropdowns {
  display: flex;
  gap: 10px;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  padding: 10px 15px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.genre-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  scrollbar-width: none;
}

.genre-list::-webkit-scrollbar {
  display: none;
}

.genre-btn {
  padding: 8px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
}

.genre-btn:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.genre-btn.active {
  background: var(--accent-primary);
  color: #000;
  border-color: var(--accent-primary);
  font-weight: 600;
}

.no-results {
  padding: 60px;
  text-align: center;
  color: var(--text-muted);
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.3;
}

.no-results h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-controls {
    width: 100%;
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
  }
  
  .dropdowns {
    width: 100%;
    overflow-x: auto;
  }
}

.results-info {
  margin-bottom: 16px;
  color: var(--text-muted);
  font-size: 13px;
}

.results-info strong {
  color: var(--text-primary);
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 16px;
}

.load-more-btn {
  padding: 12px 36px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: #000;
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 54, 79, 0.3);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-more-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
</style>
