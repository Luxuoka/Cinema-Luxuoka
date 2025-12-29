<template>
  <div class="drama-view">
    <HeroSection v-if="featured" :featured="featured" />

    <ContentSlider 
      title="Popular Drama" 
      :items="popularDrama" 
    />
    
    <ContentSlider 
      title="Indonesian Drama (Cinta Indonesia)" 
      :items="indoDrama" 
    />

    <ContentSlider 
      title="Korean Drama (K-Drama)" 
      :items="koreanDrama" 
    />

    <ContentSlider 
      title="Chinese Drama (C-Drama)" 
      :items="chineseDrama" 
    />

    <ContentSlider 
      title="Japanese Drama (Dorama)" 
      :items="japanDrama" 
    />

    <ContentSlider 
      title="Anime Drama" 
      :items="animeDrama" 
    />
    
    <ContentSlider 
      title="Romance Series" 
      :items="romanceSeries" 
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
import { tmdbFetch, mapTmdbSeries } from '../services/api'

const popularDrama = ref([])
const koreanDrama = ref([])
const chineseDrama = ref([])
const japanDrama = ref([])
const indoDrama = ref([])
const animeDrama = ref([])
const romanceSeries = ref([])
const featured = ref(null)
const loading = ref(true)

async function getDramas() {
  try {
    // 1. Popular Drama (Global)
    const dramaData = await tmdbFetch('/discover/tv?with_genres=18&sort_by=popularity.desc');
    popularDrama.value = dramaData.results.map(mapTmdbSeries);
    
    // 2. K-Drama (KR)
    const kDramaData = await tmdbFetch('/discover/tv?with_genres=18&with_original_language=ko&sort_by=popularity.desc');
    koreanDrama.value = kDramaData.results.map(mapTmdbSeries);

    // 3. C-Drama (ZH/CN)
    const cDramaData = await tmdbFetch('/discover/tv?with_genres=18&with_original_language=zh|cn&sort_by=popularity.desc');
    chineseDrama.value = cDramaData.results.map(mapTmdbSeries);

    // 4. J-Drama (JA - Live Action only, exclude animation)
    const jDramaData = await tmdbFetch('/discover/tv?with_genres=18&without_genres=16&with_original_language=ja&sort_by=popularity.desc');
    japanDrama.value = jDramaData.results.map(mapTmdbSeries);

    // 5. Anime Drama (JA + Animation + Drama)
    const animeData = await tmdbFetch('/discover/tv?with_genres=16,18&with_original_language=ja&sort_by=popularity.desc');
    animeDrama.value = animeData.results.map(mapTmdbSeries);

    // 6. Indo Drama (ID)
    const indoData = await tmdbFetch('/discover/tv?with_genres=18&with_original_language=id&sort_by=popularity.desc');
    indoDrama.value = indoData.results.map(mapTmdbSeries);
    
    // 7. Romance
    const romanceData = await tmdbFetch('/discover/tv?with_genres=10749&sort_by=popularity.desc');
    romanceSeries.value = romanceData.results.map(mapTmdbSeries);
    
    if (popularDrama.value.length > 0) {
      featured.value = popularDrama.value[0];
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getDramas()
})
</script>

<style scoped>
.drama-view {
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
</style>
