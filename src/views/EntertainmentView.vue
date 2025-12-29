<template>
  <div class="entertainment-view">
    <div class="page-header">
      <h1>Entertainment & Variety 🎉</h1>
      <p>The best of variety shows, gossip, and light entertainment.</p>
    </div>

    <!-- Live Ent Channels Removed -->

    <!-- Music & Musical -->
    <ContentSlider 
      title="Music & Musicals" 
      :items="musicContent" 
    />
    
    <!-- Reality TV -->
    <ContentSlider 
      title="Reality TV" 
      :items="realityContent" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ContentSlider from '../components/ContentSlider.vue'
import { tmdbFetch, mapTmdbMovie, mapTmdbSeries } from '../services/api'

const musicContent = ref([])
const realityContent = ref([])

async function getEntContent() {
  try {
    // Music (Genre 10402)
    const musicData = await tmdbFetch('/discover/movie?with_genres=10402&sort_by=popularity.desc');
    musicContent.value = musicData.results.map(mapTmdbMovie);

    // Reality TV (Genre 10764)
    const realityData = await tmdbFetch('/discover/tv?with_genres=10764&sort_by=popularity.desc');
    realityContent.value = realityData.results.map(mapTmdbSeries);
  } catch (e) {
    console.error(e);
  }
}

onMounted(() => {
  getEntContent()
})
</script>

<style scoped>
.entertainment-view { padding-bottom: 50px; }
.page-header { text-align: center; margin-bottom: 40px; }
.section { margin-bottom: 40px; }
.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
}
</style>
