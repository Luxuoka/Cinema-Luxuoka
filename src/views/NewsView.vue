<template>
  <div class="news-view">
    <div class="page-header">
      <h1>News Center 📰</h1>
      <p>Tracking the latest headlines from around the world.</p>
    </div>

    <div class="channels-grid">
      <ChannelCard 
        v-for="channel in newsChannels" 
        :key="channel.id" 
        :channel="channel"
        @click="openChannel(channel)"
      />
    </div>

    <!-- Player Modal -->
    <div v-if="activeChannel" class="player-modal" @click.self="closePlayer">
      <div class="player-container">
        <button class="close-btn" @click="closePlayer"><i class="fas fa-times"></i></button>
        <div class="video-wrapper">
          <iframe 
            v-if="activeChannel.youtubeId"
            :src="`https://www.youtube.com/embed/${activeChannel.youtubeId}?autoplay=1`"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>
          <div v-else class="premium-placeholder">
            <i class="fas fa-globe"></i>
            <h3>Signal Unavailable</h3>
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
import { ref } from 'vue'
import ChannelCard from '../components/ChannelCard.vue'
import { channels } from '../data/channels'

// Filter channels that are known news channels
const newsIds = ['kompastv', 'metrotv', 'inews', 'tvone', 'beritasatu', 'cnbc', 'cnn', 'cna', 'aljazeera', 'dw', 'abc', 'euronews', 'arirang', 'nhk', 'nusantara'];
const newsChannels = ref([
  ...channels.lokal.filter(c => newsIds.includes(c.id)),
  ...channels.international.filter(c => newsIds.includes(c.id))
])

const activeChannel = ref(null)

function openChannel(channel) {
  activeChannel.value = channel
}

function closePlayer() {
  activeChannel.value = null
}
</script>

<style scoped>
.news-view { padding-bottom: 50px; }
.page-header { text-align: center; margin-bottom: 40px; }
.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Player Styles */
.player-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.player-container { width: 90%; max-width: 900px; background: var(--bg-secondary); border-radius: 12px; overflow: hidden; position: relative; }
.video-wrapper { position: relative; padding-top: 56.25%; background: black; }
.video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.close-btn { position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.5); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; }
.player-info { padding: 15px; display: flex; justify-content: space-between; align-items: center; }
.live-badge { background: #ff4757; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
</style>
