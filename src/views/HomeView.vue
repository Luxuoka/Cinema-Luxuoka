<template>
  <div class="home-view">
    <HeroSection :items="featuredItems" />



    <!-- Trending Movies Slider -->
    <ContentSlider 
      title="Trending Movies" 
      :items="trendingMovies" 
    />

    <!-- New Releases Slider -->
    <ContentSlider 
      title="New Releases" 
      :items="newReleases" 
    />

    <!-- Trending Series Slider -->
    <ContentSlider 
      title="Trending TV Shows" 
      :items="trendingSeries" 
    />
    
    <!-- Top Anime Slider -->
    <ContentSlider 
      title="Top Anime" 
      :items="animeList" 
    />
    
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HeroSection from '../components/HeroSection.vue'
import ContentSlider from '../components/ContentSlider.vue'
import { 
  getTopAnime, 
  getTrendingMovies, 
  getTrendingSeries,
  getNowPlayingMovies
} from '../services/api'

const trendingMovies = ref([])
const trendingSeries = ref([])
const newReleases = ref([])
const animeList = ref([])
const featuredItems = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    // Parallel fetch for speed
    const [movies, series, newMovies, anime] = await Promise.all([
      getTrendingMovies(),
      getTrendingSeries(),
      getNowPlayingMovies(),
      getTopAnime()
    ])
    
    trendingMovies.value = movies
    trendingSeries.value = series
    newReleases.value = newMovies
    animeList.value = anime
    
    // Set featured items (use New Releases by default for "Now Showing" feel, fallback to Trending)
    // Filter out items without images
    const source = newMovies.length > 0 ? newMovies : movies
    featuredItems.value = source.filter(m => m.poster || m.backdrop).slice(0, 5)
    
  } catch (error) {
    console.error('Failed to load home content:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-view {
  animation: fadeIn 0.5s ease;
  padding-bottom: var(--spacing-2xl);
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  opacity: 0.8;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
