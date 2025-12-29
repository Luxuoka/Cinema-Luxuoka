<template>
  <div class="sports-view">
    <div class="page-header">
      <h1>Sports Arena ⚽</h1>
      <p>Live Matches, Highlights, and Documentaries</p>
    </div>

    <!-- Live Sports Channels -->
    <section class="section">
      <h2 class="section-title">Live Sports Channels</h2>
      <div class="channels-grid">
        <ChannelCard 
          v-for="channel in sportsChannels" 
          :key="channel.id" 
          :channel="channel"
          @click="openChannel(channel)"
        />
      </div>
    </section>

    <!-- Sports Movies/Docs -->
    <ContentSlider 
      title="Football / Soccer" 
      :items="footballContent" 
    />

    <ContentSlider 
      title="Basketball" 
      :items="basketballContent" 
    />

    <ContentSlider 
      title="Racing (F1 & MotoGP)" 
      :items="racingContent" 
    />

    <ContentSlider 
      title="Other Sports Movies" 
      :items="sportsMovies" 
    />

    <!-- Player Modal (Reused Logic) -->
    <div v-if="activeChannel" class="player-modal" @click.self="closePlayer">
      <div class="player-container">
        <button class="close-btn" @click="closePlayer"><i class="fas fa-times"></i></button>
        <div class="video-wrapper">
          <div class="premium-placeholder">
            <i class="fas fa-lock"></i>
            <h3>Premium Sports Channel</h3>
            <p>Live matching streaming is available for Premium subscribers only.</p>
            <button class="btn btn-primary" style="margin-top: 20px;">Subscribe Now</button>
          </div>
        </div>
        <div class="player-info">
          <h2>{{ activeChannel.name }}</h2>
          <span class="live-badge">LIVE</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ContentSlider from '../components/ContentSlider.vue'
import ChannelCard from '../components/ChannelCard.vue'
import { channels } from '../data/channels'
import { tmdbFetch, mapTmdbMovie } from '../services/api'

const sportsChannels = ref(channels.sports)
const sportsMovies = ref([])
const footballContent = ref([])
const basketballContent = ref([])
const racingContent = ref([])
const activeChannel = ref(null)

function openChannel(channel) {
  activeChannel.value = channel
}

function closePlayer() {
  activeChannel.value = null
}

async function getSportsContent() {
  try {
    // 1. Football (Keyword: 6075 - sport, 965 - soccer?? Let's use generic 'sport' keyword search or specific if known)
    // Actually TMDB keywords: 
    // soccer: 10757
    // football: 5219
    // basketball: 6073
    // racing: 1993 (motorcycle racing), 8417 (car race)
    
    // Generic "Sports" movies
    const sportsData = await tmdbFetch('/discover/movie?with_genres=99,28&with_keywords=6075&sort_by=popularity.desc');
    sportsMovies.value = sportsData.results.map(mapTmdbMovie);

    // Football
    const footData = await tmdbFetch('/discover/movie?with_keywords=5219|10757&sort_by=popularity.desc');
    footballContent.value = footData.results.map(mapTmdbMovie);

    // Basketball
    const basketData = await tmdbFetch('/discover/movie?with_keywords=6073&sort_by=popularity.desc');
    basketballContent.value = basketData.results.map(mapTmdbMovie);

    // Racing
    const raceData = await tmdbFetch('/discover/movie?with_keywords=8417|1993&sort_by=popularity.desc');
    racingContent.value = raceData.results.map(mapTmdbMovie);

  } catch (e) {
    console.error(e);
  }
}

onMounted(() => {
  getSportsContent()
})
</script>

<style scoped>
.sports-view {
  animation: fadeIn 0.5s ease;
  padding-bottom: var(--spacing-2xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.section {
  margin-bottom: var(--spacing-2xl);
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

/* Player Modal Styles (Duplicate from LiveTV for now, ideally reused) */
.player-modal {
  position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}
.player-container { width: 90%; max-width: 800px; background: var(--bg-secondary); border-radius: 12px; overflow: hidden; position: relative; }
.video-wrapper { position: relative; padding-top: 56.25%; background: black; }
.premium-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
.close-btn { position: absolute; top: 10px; right: 10px; z-index: 10; background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
.player-info { padding: 15px; display: flex; justify-content: space-between; align-items: center; }
.live-badge { background: #e74c3c; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
</style>
