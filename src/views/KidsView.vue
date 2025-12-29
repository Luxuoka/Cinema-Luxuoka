<template>
  <div class="kids-view">
    <div class="kids-header">
      <h1>Kids Corner 🎈</h1>
      <p>Safe and fun content for everyone!</p>
    </div>

    <!-- Featured Kids Movie -->
    <HeroSection v-if="featured" :featured="featured" />

    <ContentSlider 
      title="Popular Animation" 
      :items="popularAnimation" 
    />
    
    <ContentSlider 
      title="Family Movies" 
      :items="familyMovies" 
    />
    
    <ContentSlider 
      title="Kids TV Shows" 
      :items="kidsTV" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HeroSection from '../components/HeroSection.vue'
import ContentSlider from '../components/ContentSlider.vue'
import { tmdbFetch, mapTmdbMovie, mapTmdbSeries } from '../services/api'

const popularAnimation = ref([])
const familyMovies = ref([])
const kidsTV = ref([])
const featured = ref(null)

async function getKidsContent() {
  try {
    // Animation Movies (Genre 16)
    const animData = await tmdbFetch('/discover/movie?with_genres=16&sort_by=popularity.desc');
    popularAnimation.value = animData.results.map(mapTmdbMovie);
    
    // Family Movies (Genre 10751)
    const familyData = await tmdbFetch('/discover/movie?with_genres=10751&sort_by=popularity.desc');
    familyMovies.value = familyData.results.map(mapTmdbMovie);

    // Kids TV (Genre 10762)
    const kidsData = await tmdbFetch('/discover/tv?with_genres=10762&sort_by=popularity.desc');
    kidsTV.value = kidsData.results.map(mapTmdbSeries);
    
    if (popularAnimation.value.length > 0) {
      featured.value = popularAnimation.value[0];
    }
  } catch (e) {
    console.error(e);
  }
}

onMounted(() => {
  getKidsContent()
})
</script>

<style scoped>
.kids-view {
  animation: fadeIn 0.5s ease;
  padding-bottom: var(--spacing-2xl);
  /* Playful background */
  background: radial-gradient(circle at top right, #3498db22, transparent),
              radial-gradient(circle at bottom left, #e91e6322, transparent);
}

.kids-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-top: var(--spacing-lg);
}

.kids-header h1 {
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; /* Playful font */
  font-size: var(--font-4xl);
  color: #f1c40f;
  text-shadow: 2px 2px 0px #e67e22;
  margin-bottom: var(--spacing-xs);
}

.kids-header p {
  font-size: var(--font-lg);
  color: var(--text-secondary);
}
</style>
