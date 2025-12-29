<template>
  <div class="series-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-tv"></i>
        TV Shows
      </h1>
      <div class="search-filter">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search TV shows..."
            @input="handleSearch"
          />
        </div>
        <select v-model="sortBy" class="sort-select" @change="loadSeries">
          <option value="popularity">🔥 Popular</option>
          <option value="vote_average">⭐ Top Rated</option>
          <option value="first_air_date">📅 Latest</option>
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

    <div v-else-if="series.length" class="content-grid">
      <ContentCard 
        v-for="show in series" 
        :key="show.id" 
        :item="show" 
      />
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-tv"></i>
      <h3>No TV shows found</h3>
      <p>Try searching for something else</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ContentCard from '../components/ContentCard.vue'
import { getTrendingSeries, searchSeries, discoverSeriesByGenre } from '../services/api'

const route = useRoute()

const series = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedGenre = ref(null)
const sortBy = ref('popularity')

let searchTimeout = null

const genres = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' }
]

onMounted(async () => {
  // Check for genre query param
  if (route.query.genre) {
    const genreId = parseInt(route.query.genre)
    if (genreId) {
      selectedGenre.value = genreId
    }
  }
  await loadSeries()
})

// Watch for route changes
watch(() => route.query.genre, async (newGenre) => {
  if (newGenre) {
    selectedGenre.value = parseInt(newGenre)
    await loadSeries()
  }
})

async function loadSeries() {
  loading.value = true
  try {
    if (selectedGenre.value) {
      series.value = await discoverSeriesByGenre(selectedGenre.value, sortBy.value)
    } else {
      series.value = await getTrendingSeries()
    }
  } catch (error) {
    console.error('Failed to load series:', error)
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
  loadSeries()
}

function handleSearch() {
  clearTimeout(searchTimeout)
  
  if (!searchQuery.value.trim()) {
    loadSeries()
    return
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      const data = await searchSeries(searchQuery.value.trim())
      series.value = data
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      loading.value = false
    }
  }, 500)
}
</script>

<style scoped>
.series-view {
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
