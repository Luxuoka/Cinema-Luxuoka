<template>
  <div class="anime-view">
    <div class="view-header">
      <div class="header-main">
        <div class="anime-title-row">
          <i class="fas fa-torii-gate anime-icon"></i>
          <h1>Anime</h1>
        </div>
        <p class="subtitle">Discover the best anime from MyAnimeList</p>
      </div>
      
      <div class="filter-controls">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="localSearchQuery" 
            placeholder="Search anime..." 
            @input="handleSearch"
          />
        </div>
        
        <div class="dropdowns">
          <div class="select-wrapper">
            <select v-model="selectedSeason" @change="loadAnime">
              <option :value="null">All Seasons</option>
              <option value="winter">❄️ Winter</option>
              <option value="spring">🌸 Spring</option>
              <option value="summer">☀️ Summer</option>
              <option value="fall">🍂 Fall</option>
            </select>
          </div>

          <div class="select-wrapper">
            <select v-model="selectedYear" @change="loadAnime">
              <option :value="null">All Years</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Ranking Tabs -->
    <div class="ranking-tabs">
      <button 
        v-for="tab in rankingTabs" 
        :key="tab.value"
        :class="['tab-btn', { active: activeTab === tab.value }]"
        @click="switchTab(tab.value)"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </button>
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
        :key="genre"
        :class="['genre-btn', { active: selectedGenre === genre }]"
        @click="toggleGenre(genre)"
      >
        {{ genre }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="content-grid">
        <SkeletonLoader v-for="i in 12" :key="i" />
      </div>
    </div>

    <div v-else-if="animeList.length > 0" class="content-grid">
      <ContentCard 
        v-for="anime in filteredAnime" 
        :key="anime.id" 
        :item="anime" 
      />
    </div>

    <div v-else class="no-results">
      <i class="fas fa-search"></i>
      <h3>No anime found</h3>
      <p>Try adjusting your search or filters</p>
      <button @click="resetFilters" class="btn btn-secondary">Reset Filters</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getTrendingAnime, 
  getTopAnime, 
  getPopularAnime, 
  getUpcomingAnime, 
  getSeasonalAnime, 
  searchAnime,
  getCurrentSeason,
  getAnimeByRanking
} from '../services/animeApi'
import ContentCard from '../components/ContentCard.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const animeList = ref([])
const loading = ref(true)
const localSearchQuery = ref('')
const selectedGenre = ref(null)
const selectedSeason = ref(null)
const selectedYear = ref(null)
const activeTab = ref('airing')

const rankingTabs = [
  { value: 'airing', label: 'Airing Now', icon: 'fas fa-play-circle' },
  { value: 'all', label: 'Top Rated', icon: 'fas fa-trophy' },
  { value: 'bypopularity', label: 'Most Popular', icon: 'fas fa-fire' },
  { value: 'upcoming', label: 'Upcoming', icon: 'fas fa-clock' },
  { value: 'favorite', label: 'Favorites', icon: 'fas fa-heart' },
  { value: 'seasonal', label: 'This Season', icon: 'fas fa-calendar-alt' }
]

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mecha', 'Music', 'Mystery', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
]

const years = Array.from({ length: 2027 - 1990 }, (_, i) => 2026 - i)

const filteredAnime = computed(() => {
  if (!selectedGenre.value) return animeList.value
  return animeList.value.filter(anime => 
    anime.genres?.some(g => g.toLowerCase().includes(selectedGenre.value.toLowerCase()))
  )
})

async function loadAnime() {
  loading.value = true
  try {
    if (localSearchQuery.value.trim()) {
      animeList.value = await searchAnime(localSearchQuery.value.trim())
    } else if (selectedSeason.value && selectedYear.value) {
      animeList.value = await getSeasonalAnime(selectedYear.value, selectedSeason.value)
    } else if (activeTab.value === 'seasonal') {
      const { year, season } = getCurrentSeason()
      animeList.value = await getSeasonalAnime(year, season)
    } else {
      animeList.value = await getAnimeByRanking(activeTab.value, 25)
    }
  } catch (error) {
    console.error('Failed to load anime:', error)
  } finally {
    loading.value = false
  }
}

function switchTab(tab) {
  activeTab.value = tab
  localSearchQuery.value = ''
  selectedSeason.value = null
  selectedYear.value = null
  loadAnime()
}

let searchTimeout = null
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadAnime()
  }, 500)
}

function toggleGenre(genre) {
  selectedGenre.value = genre
}

function resetFilters() {
  localSearchQuery.value = ''
  selectedGenre.value = null
  selectedSeason.value = null
  selectedYear.value = null
  activeTab.value = 'airing'
  loadAnime()
}

onMounted(loadAnime)
</script>

<style scoped>
.anime-view {
  animation: fadeIn 0.4s ease;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.anime-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.anime-icon {
  font-size: 28px;
  background: linear-gradient(135deg, #FF6B9D, #C44FE0, #7B68EE);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-main h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #FF6B9D, #C44FE0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-muted);
  font-size: var(--font-sm);
}

.filter-controls {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  width: 250px;
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
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #C44FE0;
  box-shadow: 0 0 0 3px rgba(196, 79, 224, 0.15);
}

.dropdowns {
  display: flex;
  gap: 10px;
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

/* Ranking Tabs */
.ranking-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
  scrollbar-width: none;
}

.ranking-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-btn i {
  font-size: 12px;
}

.tab-btn:hover {
  border-color: #C44FE0;
  color: var(--text-primary);
  background: rgba(196, 79, 224, 0.06);
}

.tab-btn.active {
  background: linear-gradient(135deg, #FF6B9D, #C44FE0);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 20px rgba(196, 79, 224, 0.35);
}

/* Genre Filter */
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
  border-color: #C44FE0;
  color: var(--text-primary);
}

.genre-btn.active {
  background: linear-gradient(135deg, #FF6B9D, #C44FE0);
  color: #fff;
  border-color: transparent;
  font-weight: 600;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
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

.btn-secondary {
  margin-top: 15px;
  padding: 10px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #C44FE0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
