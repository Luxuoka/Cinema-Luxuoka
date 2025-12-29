<template>
  <div class="channel-card" @click="$emit('click')">
    <div class="channel-logo" :style="{ backgroundColor: channel.color || 'var(--bg-tertiary)' }">
      <span class="logo-text">{{ channel.logo }}</span>
      <div class="play-overlay">
        <i class="fas fa-play"></i>
      </div>
    </div>
    <div class="channel-info">
      <h4 class="channel-name">{{ channel.name }}</h4>
      <span class="channel-status">
        <span class="status-dot"></span> LIVE
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  channel: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.channel-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.channel-card:hover {
  transform: translateY(-4px);
}

.channel-logo {
  aspect-ratio: 1; /* Square */
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-sm);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.logo-text {
  font-weight: 900;
  font-size: 1.2rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  text-align: center;
  padding: var(--spacing-sm);
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.play-overlay i {
  font-size: 2rem;
  color: white;
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
}

.channel-card:hover .play-overlay {
  opacity: 1;
}

.channel-info {
  text-align: center;
}

.channel-name {
  font-size: var(--font-sm);
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.channel-status {
  font-size: 10px;
  color: #ff4757;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: #ff4757;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
</style>
