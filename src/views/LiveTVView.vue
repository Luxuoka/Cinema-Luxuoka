<template>
  <div class="live-tv-view">
    <div class="page-header">
      <h1 class="page-title">Live TV</h1>
      <p class="page-description">Watch streaming channels anywhere, anytime.</p>
    </div>

    <!-- Category: Lokal -->
    <section class="channel-section">
      <h2 class="section-title">Lokal TV</h2>
      <div class="channels-grid">
        <ChannelCard 
          v-for="channel in channels.lokal" 
          :key="channel.id" 
          :channel="channel"
          @click="openChannel(channel)"
        />
      </div>
    </section>

    <!-- Category: Sports -->
    <section class="channel-section">
      <h2 class="section-title">Sports</h2>
      <div class="channels-grid">
        <ChannelCard 
          v-for="channel in channels.sports" 
          :key="channel.id" 
          :channel="channel"
          @click="openChannel(channel)"
        />
      </div>
    </section>

    <!-- Category: International -->
    <section class="channel-section">
      <h2 class="section-title">International</h2>
      <div class="channels-grid">
        <ChannelCard 
          v-for="channel in channels.international" 
          :key="channel.id" 
          :channel="channel"
          @click="openChannel(channel)"
        />
      </div>
    </section>

    <!-- Player Modal -->
    <div v-if="activeChannel" class="player-modal" @click.self="closePlayer">
      <div class="player-container">
        <button class="close-btn" @click="closePlayer">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="video-wrapper">
          <iframe 
            v-if="activeChannel.youtubeId"
            :src="`https://www.youtube.com/embed/${activeChannel.youtubeId}?autoplay=1`"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>
          <div v-else class="premium-placeholder">
            <i class="fas fa-lock"></i>
            <h3>Premium Channel</h3>
            <p>This channel is part of the Premium package. Stream is currently unavailable in demo mode.</p>
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
import { channels } from '../data/channels'
import ChannelCard from '../components/ChannelCard.vue'

const activeChannel = ref(null)

function openChannel(channel) {
  activeChannel.value = channel
}

function closePlayer() {
  activeChannel.value = null
}
</script>

<style scoped>
.live-tv-view {
  animation: fadeIn 0.5s ease;
  padding-bottom: var(--spacing-2xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.page-title {
  font-size: var(--font-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.page-description {
  color: var(--text-secondary);
}

.channel-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 24px;
  background: var(--accent-primary);
  border-radius: var(--radius-sm);
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .channels-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--spacing-md);
  }
}

/* Player Modal */
.player-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.player-container {
  width: 100%;
  max-width: 900px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-lg);
}

.close-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: black;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.premium-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
  padding: var(--spacing-xl);
}

.premium-placeholder i {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  color: var(--accent-secondary);
}

.player-info {
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.live-badge {
  background: #ff4757;
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
