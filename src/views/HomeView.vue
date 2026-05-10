<template>
  <div class="home-view">
    <div v-if="initialLoading" class="skeleton-hero-wrapper">
       <SkeletonLoader type="banner" />
    </div>
    <HeroSection v-else :items="featuredItems" />

    <!-- Keyboard Shortcuts Helper -->
    <KeyboardShortcuts />

    <!-- Quick Filters -->
    <div class="quick-filters" v-if="!initialLoading">
      <button 
        v-for="filter in filters" 
        :key="filter"
        :class="['filter-chip', { active: activeFilter === filter }]"
        @click="activeFilter = filter"
      >
        {{ filter }}
      </button>
    </div>


    <!-- Trending Movies Slider -->
    <div v-if="initialLoading" class="slider-skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-slider">
        <SkeletonLoader v-for="i in 6" :key="i" />
      </div>
    </div>
    <!-- Filtered Content / Default Content -->
    <div v-if="filtering" class="slider-skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-slider">
        <SkeletonLoader v-for="i in 6" :key="i" />
      </div>
    </div>
    <template v-else-if="activeFilter !== 'All'">
      <ContentSlider 
        v-if="filteredMovies.length > 0"
        :title="`${activeFilter} Movies`" 
        :items="filteredMovies" 
      />
      <ContentSlider 
        v-if="filteredSeries.length > 0"
        :title="`${activeFilter} TV Series`" 
        :items="filteredSeries" 
      />
      <div v-if="filteredMovies.length === 0 && filteredSeries.length === 0" class="no-results">
        <i class="fas fa-search"></i>
        <p>No results found for "{{ activeFilter }}"</p>
      </div>
    </template>
    <template v-else>
      <ContentSlider 
        v-if="recommendations.length > 0"
        title="Recommended for You" 
        :subtitle="recommendationContext"
        :items="recommendations" 
      />

      <ContentSlider 
        title="Trending Movies" 
        :items="trendingMovies" 
      />

      <ContentSlider 
        title="Trending Anime" 
        :items="trendingAnime" 
      />

      <ContentSlider 
        title="New Releases" 
        :items="newReleases" 
      />

      <ContentSlider 
        title="Trending TV Shows" 
        :items="trendingSeries" 
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ContentSlider from '../components/ContentSlider.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import KeyboardShortcuts from '../components/KeyboardShortcuts.vue'
import { 
  getTrendingMovies, 
  getTrendingSeries,
  getNowPlayingMovies,
  discoverMovies,
  discoverSeries
} from '../services/api'
import { getTrendingAnime } from '../services/animeApi'
import { getPersonalizedRecommendations } from '../services/recommendations'
import { watchlist } from '../stores/userStore'
import { watch } from 'vue'

const router = useRouter()
const trendingMovies = ref([])
const trendingSeries = ref([])
const trendingAnime = ref([])
const newReleases = ref([])
const featuredItems = ref([])
const recommendations = ref([])
const initialLoading = ref(true)
const filtering = ref(false)

const filteredMovies = ref([])
const filteredSeries = ref([])

const activeFilter = ref('All')
const filters = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', '2024', 'Top Rated']

const recommendationContext = computed(() => {
  if (watchlist.length > 0) {
    const last = watchlist[watchlist.length - 1]
    return `Because you added "${last.title}"`
  }
  return 'Hand-picked for you'
})

const genreMap = {
  'Action': 28,
  'Comedy': 35,
  'Drama': 18,
  'Horror': 27,
  'Sci-Fi': 878
}

async function loadContent() {
  if (activeFilter.value === 'All') {
    initialLoading.value = true
    try {
      const [movies, series, anime, newMovies, recs] = await Promise.all([
        getTrendingMovies(),
        getTrendingSeries(),
        getTrendingAnime(15),
        getNowPlayingMovies(),
        getPersonalizedRecommendations(15)
      ])
      
      trendingMovies.value = movies
      trendingSeries.value = series
      trendingAnime.value = anime
      newReleases.value = newMovies
      recommendations.value = recs || []
      
      const source = newMovies.length > 0 ? newMovies : movies
      featuredItems.value = source.filter(m => m.poster || m.backdrop).slice(0, 8)
    } finally {
      initialLoading.value = false
    }
    return
  }

  // Filter Logic
  filtering.value = true
  try {
    const filter = activeFilter.value
    let params = {}
    
    if (genreMap[filter]) {
      params.genre = genreMap[filter]
    } else if (filter === '2024') {
      params.year = '2024'
    } else if (filter === 'Top Rated') {
      params.sortBy = 'vote_average'
    }

    const [movies, series] = await Promise.all([
      discoverMovies(params),
      discoverSeries(params)
    ])
    
    filteredMovies.value = movies
    filteredSeries.value = series
  } catch (error) {
    console.error('Filtering failed:', error)
  } finally {
    filtering.value = false
  }
}

watch(activeFilter, () => {
  loadContent()
})




onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.home-view {
  animation: fadeIn 0.4s ease;
  padding-bottom: var(--spacing-2xl);
}

.quick-filters {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 0 var(--spacing-md) var(--spacing-xl);
  scrollbar-width: none;
}

.quick-filters::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  padding: 8px 20px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s ease;
}

.filter-chip:hover:not(.active) {
  border-color: #6B7280;
  color: white;
}

.filter-chip.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #000;
  font-weight: 700;
  box-shadow: 0 0 20px rgba(0, 212, 170, 0.3);
}


.slider-header-wrapper {
  display: flex;
  align-items: baseline;
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  gap: 12px;
}

.slider-header-wrapper .section-title {
  margin-bottom: 0;
}

.recommendation-context {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 12px;
  font-style: italic;
}

.skeleton-hero-wrapper {
  margin-bottom: var(--spacing-2xl);
}

.slider-skeleton {
  margin-bottom: var(--spacing-2xl);
}

.skeleton-header {
  height: 30px;
  width: 200px;
  background: var(--bg-tertiary);
  margin-bottom: 20px;
  border-radius: 4px;
}

.skeleton-slider {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-muted);
  text-align: center;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.3;
}

/* End of view styles */

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
