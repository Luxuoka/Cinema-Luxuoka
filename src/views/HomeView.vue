<template>
  <div class="home-view">
    <div v-if="initialLoading" class="skeleton-hero-wrapper">
       <SkeletonLoader type="banner" />
    </div>
    <HeroSection v-else :items="featuredItems" />

    <!-- Continue Watching Section -->
    <div v-if="continueWatchingItem" class="continue-watching-section">
      <div class="section-header">
        <h2 class="section-title"><i class="fas fa-play-circle"></i> Lanjutkan Menonton</h2>
      </div>
      <div class="continue-card" @click="resumeWatching">
        <div class="continue-poster">
          <img :src="continueWatchingItem.poster" :alt="continueWatchingItem.title" />
          <div class="continue-play-overlay">
            <i class="fas fa-play"></i>
          </div>
        </div>
        <div class="continue-info">
          <h3>{{ continueWatchingItem.title }}</h3>
          <p v-if="continueWatchingItem.episode">
            Lanjut Episode {{ continueWatchingItem.episode }}
          </p>
          <span class="last-watched">Terakhir diputar: {{ formatTime(continueWatchingItem.lastSeen) }}</span>
        </div>
        <div class="continue-action">
          <button class="btn btn-primary">Tonton</button>
        </div>
      </div>
    </div>

    <!-- Trending Movies Slider -->
    <div v-if="initialLoading" class="slider-skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-slider">
        <SkeletonLoader v-for="i in 6" :key="i" />
      </div>
    </div>
    <template v-else>
      <ContentSlider 
        title="Film Trending" 
        :items="trendingMovies" 
      />

      <!-- New Releases Slider -->
      <ContentSlider 
        title="Rilis Baru" 
        :items="newReleases" 
      />

      <!-- Trending Series Slider -->
      <ContentSlider 
        title="Serial TV Trending" 
        :items="trendingSeries" 
      />

      <!-- Streaming Services Section -->
      <div class="streaming-section animate-slide-up">
        <h2 class="section-title">
          <i class="fas fa-stream"></i> Layanan Streaming
        </h2>
        <div class="services-grid">
          <router-link 
            v-for="service in streamingServices" 
            :key="service.id" 
            :to="`/streaming/${service.id}`"
            class="service-card"
          >
            <div class="service-logo-wrapper">
              <img :src="service.logo" :alt="service.name" class="service-logo" />
            </div>
          </router-link>
        </div>
      </div>
      
      <!-- Top Anime Slider -->
      <ContentSlider 
        title="Anime Terpopuler" 
        :items="animeList" 
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ContentSlider from '../components/ContentSlider.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import { 
  getTopAnime, 
  getTrendingMovies, 
  getTrendingSeries,
  getNowPlayingMovies,
  getStreamingServices
} from '../services/api'

const router = useRouter()
const trendingMovies = ref([])
const trendingSeries = ref([])
const newReleases = ref([])
const animeList = ref([])
const featuredItems = ref([])
const streamingServices = ref([])
const initialLoading = ref(true)

const continueWatchingItem = ref(null)

function loadContinueWatching() {
  const saved = localStorage.getItem('last_played')
  if (saved) {
    try {
      continueWatchingItem.value = JSON.parse(saved)
    } catch(e) {
      console.error("Failed to parse last_played", e)
    }
  }
}

function resumeWatching() {
  if (continueWatchingItem.value) {
    const { type, id } = continueWatchingItem.value
    router.push(`/watch/${type}/${id}`)
  }
}

function formatTime(timestamp) {
  if (!timestamp) return 'Just now'
  const diff = Date.now() - timestamp
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
  return new Date(timestamp).toLocaleDateString()
}

onMounted(async () => {
  loadContinueWatching()
  initialLoading.value = true
  try {
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
    streamingServices.value = getStreamingServices()
    
    const source = newMovies.length > 0 ? newMovies : movies
    featuredItems.value = source.filter(m => m.poster || m.backdrop).slice(0, 8)
    
  } catch (error) {
    console.error('Failed to load home content:', error)
  } finally {
    initialLoading.value = false
  }
})
</script>

<style scoped>
.home-view {
  animation: fadeIn 0.4s ease;
  padding-bottom: var(--spacing-2xl);
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
}

/* Continue Watching */
.continue-watching-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i { color: var(--accent-primary); }

.continue-card {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 15px;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 600px;
}

.continue-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  background: var(--bg-tertiary);
}

.continue-poster {
  width: 80px;
  aspect-ratio: 2/3;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.continue-poster img { width: 100%; height: 100%; object-fit: cover; }

.continue-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.continue-card:hover .continue-play-overlay { opacity: 1; }

.continue-info h3 { font-size: 18px; margin-bottom: 5px; }
.continue-info p { color: var(--accent-primary); font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.last-watched { color: var(--text-muted); font-size: 12px; }

.continue-action { margin-left: auto; }


/* Streaming Services */
.streaming-section {
  margin-bottom: var(--spacing-2xl);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.service-card {
  display: block;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}

.service-card:hover {
  background: var(--bg-tertiary);
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.service-logo-wrapper {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-logo {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: grayscale(0.2);
  transition: all 0.3s;
}

.service-card:hover .service-logo {
  filter: grayscale(0);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .skeleton-slider { grid-template-columns: repeat(2, 1fr); }
  .continue-card { max-width: 100%; }
  .continue-action { display: none; }
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
