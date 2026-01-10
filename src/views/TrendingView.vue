<template>
  <div class="trending-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-fire"></i>
        Trending Now
      </h1>
      <p class="page-subtitle">Top movies and TV shows this week</p>
    </div>

    <!-- New Releases Section -->
    <section class="content-section">
      <h2 class="section-title">
        <i class="fas fa-certificate"></i> New Releases
      </h2>
      <div v-if="loading.newReleases" class="loading-grid">
        <div v-for="n in 5" :key="n" class="skeleton-card"></div>
      </div>
      <div v-else class="content-grid">
        <ContentCard 
          v-for="movie in newReleases" 
          :key="movie.id" 
          :item="movie" 
        />
      </div>
    </section>

    <!-- Airing Today Section -->
    <section class="content-section">
      <h2 class="section-title">
        <i class="fas fa-broadcast-tower"></i> On The Air
      </h2>
      <div v-if="loading.airingToday" class="loading-grid">
        <div v-for="n in 5" :key="n" class="skeleton-card"></div>
      </div>
      <div v-else class="content-grid">
        <ContentCard 
          v-for="show in airingToday" 
          :key="show.id" 
          :item="show" 
        />
      </div>
    </section>

    <!-- Trending Movies Section -->
    <section class="content-section">
      <h2 class="section-title">
        <i class="fas fa-film"></i> Trending Movies
      </h2>
      <div v-if="loading.movies" class="loading-grid">
        <div v-for="n in 5" :key="n" class="skeleton-card"></div>
      </div>
      <div v-else class="content-grid">
        <ContentCard 
          v-for="movie in trendingMovies" 
          :key="movie.id" 
          :item="movie" 
        />
      </div>
    </section>

    <!-- Trending Series Section -->
    <section class="content-section">
      <h2 class="section-title">
        <i class="fas fa-tv"></i> Trending TV Shows
      </h2>
      <div v-if="loading.series" class="loading-grid">
        <div v-for="n in 5" :key="n" class="skeleton-card"></div>
      </div>
      <div v-else class="content-grid">
        <ContentCard 
          v-for="show in trendingSeries" 
          :key="show.id" 
          :item="show" 
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ContentCard from '../components/ContentCard.vue'
import { 
  getTrendingMovies, 
  getTrendingSeries,
  getNowPlayingMovies,
  getAiringTodaySeries 
} from '../services/api'

const trendingMovies = ref([])
const trendingSeries = ref([])
const newReleases = ref([])
const airingToday = ref([])

const loading = ref({
  movies: true,
  series: true,
  newReleases: true,
  airingToday: true
})

onMounted(async () => {
  // Parallel fetch for better performance
  const promises = [
    getTrendingMovies().then(data => {
      trendingMovies.value = data
      loading.value.movies = false
    }),
    getTrendingSeries().then(data => {
      trendingSeries.value = data
      loading.value.series = false
    }),
    getNowPlayingMovies().then(data => {
      newReleases.value = data
      loading.value.newReleases = false
    }),
    getAiringTodaySeries().then(data => {
      airingToday.value = data
      loading.value.airingToday = false
    })
  ]

  await Promise.allSettled(promises)
})
</script>

<style scoped>
.trending-view {
  animation: fadeIn 0.5s ease;
  padding-bottom: var(--spacing-2xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-2xl);
  margin-bottom: var(--spacing-xs);
}

.page-title i {
  color: #ff4757; /* Fire color for trending */
}

.page-subtitle {
  color: var(--text-muted);
  margin-left: calc(var(--font-2xl) + var(--spacing-md)); /* Align with text start */
}

.content-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-xl);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
}

.section-title i {
  color: var(--accent-primary);
  opacity: 0.8;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.skeleton-card {
  aspect-ratio: 2/3;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }
}
</style>
