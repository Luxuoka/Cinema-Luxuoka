<template>
  <div class="anime-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-dragon"></i>
        Anime
      </h1>
      <div class="search-filter">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search anime..."
            @input="handleSearch"
          />
        </div>
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

    <div v-else-if="animeList.length" class="content-grid">
      <ContentCard 
        v-for="anime in animeList" 
        :key="anime.id" 
        :item="anime" 
      />
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-dragon"></i>
      <h3>No anime found</h3>
      <p>Try searching for something else</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ContentCard from '../components/ContentCard.vue'
import { getTopAnime, searchAnime, getAnimeByGenre } from '../services/api'

const route = useRoute()

const animeList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedGenre = ref(null)

let searchTimeout = null

const genres = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 14, name: 'Horror' },
  { id: 7, name: 'Mystery' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 30, name: 'Sports' },
  { id: 37, name: 'Supernatural' }
]

onMounted(async () => {
  // Check for genre query param
  if (route.query.genre) {
    const genreId = parseInt(route.query.genre)
    if (genreId) {
      selectedGenre.value = genreId
    }
  }
  await loadAnime()
})

// Watch for route changes
watch(() => route.query.genre, async (newGenre) => {
  if (newGenre) {
    selectedGenre.value = parseInt(newGenre)
    await loadAnime()
  }
})

async function loadAnime() {
  loading.value = true
  try {
    if (selectedGenre.value) {
      animeList.value = await getAnimeByGenre(selectedGenre.value)
    } else {
      animeList.value = await getTopAnime()
    }
  } catch (error) {
    console.error('Failed to load anime:', error)
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
  loadAnime()
}

function handleSearch() {
  clearTimeout(searchTimeout)
  
  if (!searchQuery.value.trim()) {
    loadAnime()
    return
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      const data = await searchAnime(searchQuery.value.trim())
      animeList.value = data
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      loading.value = false
    }
  }, 500)
}
</script>

<style scoped>
.anime-view {
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
