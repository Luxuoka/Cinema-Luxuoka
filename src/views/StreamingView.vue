<template>
  <div class="streaming-view">
    <div class="header" v-if="service">
      <div class="header-content">
        <h1 class="service-title">
          <img v-if="service.logo" :src="service.logo" :alt="service.name" class="service-logo" />
          <span v-else>{{ service.name }}</span>
        </h1>
        <p class="service-subtitle">Populer di {{ service.name }}</p>
      </div>
    </div>

    <div class="content-container">
      <div v-if="loading" class="loading-state">
         <div class="skeleton-slider">
            <SkeletonLoader v-for="i in 6" :key="i" />
         </div>
      </div>

      <template v-else>
        <div v-if="movies.length > 0" class="section-wrapper animate-fade-in">
           <ContentSlider 
             :title="`Film Populer di ${service?.name}`" 
             :items="movies" 
           />
        </div>

        <div v-if="series.length > 0" class="section-wrapper animate-fade-in">
           <ContentSlider 
             :title="`Serial TV Populer di ${service?.name}`" 
             :items="series" 
           />
        </div>

        <!-- Asian & Local Content -->
        <div v-if="koreanDrama.length > 0" class="section-wrapper animate-fade-in">
           <ContentSlider 
             :title="`Drama Korea di ${service?.name}`" 
             :items="koreanDrama" 
           />
        </div>

        <div v-if="chineseDrama.length > 0" class="section-wrapper animate-fade-in">
           <ContentSlider 
             :title="`Drama Mandarin di ${service?.name}`" 
             :items="chineseDrama" 
           />
        </div>

        <div v-if="indoContent.length > 0" class="section-wrapper animate-fade-in">
           <ContentSlider 
             :title="`Film Indonesia di ${service?.name}`" 
             :items="indoContent" 
           />
        </div>

        <div v-if="indoCartoons.length > 0" class="section-wrapper animate-fade-in">
           <ContentSlider 
             :title="`Kartun Indonesia di ${service?.name}`" 
             :items="indoCartoons" 
           />
        </div>

        <div v-if="movies.length === 0 && series.length === 0" class="empty-state">
          <i class="fas fa-film"></i>
          <p>Tidak ada konten ditemukan untuk layanan ini.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getTitlesByService, getStreamingServices, getServiceSpecificContent } from '../services/api'
import ContentSlider from '../components/ContentSlider.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const route = useRoute()
const movies = ref([])
const series = ref([])
const koreanDrama = ref([])
const chineseDrama = ref([])
const indoContent = ref([])
const indoCartoons = ref([])
const loading = ref(true)

const serviceId = computed(() => route.params.serviceId)

const service = computed(() => {
  const services = getStreamingServices()
  return services.find(s => s.id == serviceId.value)
})

async function loadContent() {
  if (!serviceId.value) return
  
  loading.value = true
  movies.value = []
  series.value = []
  koreanDrama.value = []
  chineseDrama.value = []
  indoContent.value = []
  indoCartoons.value = []
  
  try {
    // 1. Popular Global Content (from Watchmode - Exact Service Catalog)
    const [moviesData, seriesData] = await Promise.all([
      getTitlesByService(serviceId.value, 'movie'),
      getTitlesByService(serviceId.value, 'series')
    ])
    movies.value = moviesData
    series.value = seriesData

    // 2. Specific Asian/Local Content (from TMDB Discover - Filtered by Service + Region)
    const [kDrama, cDrama, indo, indoAnim] = await Promise.all([
       getServiceSpecificContent(serviceId.value, 'series', 'KR'), // Korean Drama
       getServiceSpecificContent(serviceId.value, 'series', 'CN'), // Chinese Drama
       getServiceSpecificContent(serviceId.value, 'movie', 'ID'),  // Indo Movies
       getServiceSpecificContent(serviceId.value, 'series', 'ID', 16) // Indo Animation
    ])
    
    koreanDrama.value = kDrama
    chineseDrama.value = cDrama
    indoContent.value = indo
    indoCartoons.value = indoAnim

  } catch (error) {
    console.error('Failed to load streaming content:', error)
  } finally {
    loading.value = false
  }
}

watch(serviceId, () => {
  loadContent()
})

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.streaming-view {
  min-height: 100vh;
  padding-bottom: var(--spacing-2xl);
}

.header {
  padding: 120px var(--spacing-lg) 60px; /* Top padding for fixed header */
  background: linear-gradient(to bottom, 
    rgba(0,0,0,0.8), 
    rgba(0,0,0,0.6) 50%, 
    var(--bg-primary));
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  text-align: center;
}

.service-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.service-logo {
  height: 60px; /* Adjust based on your logo assets */
  width: auto;
  object-fit: contain;
}

.service-subtitle {
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.content-container {
  padding: 0 var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}


.section-wrapper {
  margin-bottom: var(--spacing-xl);
}

.skeleton-slider {
  display: flex;
  gap: var(--spacing-md);
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-muted);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

@media (max-width: 768px) {
  .header {
    padding-top: 100px;
    padding-bottom: 40px;
  }
  
  .service-title {
    font-size: 2rem;
  }

  .service-logo {
    height: 40px;
  }
  
}
</style>
