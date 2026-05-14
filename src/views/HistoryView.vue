<template>
  <div class="history-view">
    <div class="history-header">
      <h1><i class="fas fa-history"></i> Riwayat Tontonan</h1>
      <p class="history-subtitle">Melanjutkan film dan episode terakhir yang Anda putar</p>
    </div>

    <div v-if="userState.loading" class="loading-state">
      Memuat riwayat...
    </div>

    <div v-else-if="!userState.isLoggedIn" class="unauth-state">
      Silakan login untuk melihat riwayat tontonan Anda.
    </div>

    <div v-else-if="watchHistory.length === 0" class="empty-state">
      <h2>Belum ada riwayat</h2>
      <p>Anda belum menonton apapun. Mulai streaming sekarang!</p>
    </div>

    <div v-else class="history-grid">
      <div v-for="item in watchHistory" :key="item.id" class="history-item">
        <router-link :to="`/watch/${item.type}/${item.id}`" class="history-poster-wrap">
          <img :src="item.poster" :alt="item.title" class="history-poster" v-if="item.poster" />
          <div v-else class="history-poster-placeholder">
            <i class="fas fa-film"></i>
          </div>
          <div class="history-overlay">
            <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </router-link>
        <div class="history-info">
          <h3 class="history-title">{{ item.title }}</h3>
          <div class="history-meta">
            <span class="type-badge">{{ item.type.toUpperCase() }}</span>
            <span v-if="item.episode" class="episode-badge">Ep {{ item.episode }}</span>
          </div>
          <div class="history-time">{{ formatTime(item.watchedAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { userState, watchHistory } from '../stores/userStore'

function formatTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.history-view {
  animation: fadeIn 0.4s ease;
  padding-bottom: 40px;
}
.history-header {
  margin-bottom: 32px;
}
.history-header h1 {
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.history-header h1 i {
  color: var(--accent);
}
.history-subtitle {
  color: var(--text2);
  margin-top: 8px;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.history-item {
  display: flex;
  gap: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: var(--radius);
  transition: all 0.2s;
}
.history-item:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.history-poster-wrap {
  width: 90px;
  height: 130px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  display: block;
}
.history-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.history-poster-placeholder {
  width: 100%;
  height: 100%;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  font-size: 24px;
}
.history-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
}
.history-poster-wrap:hover .history-overlay {
  opacity: 1;
}

.history-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.history-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.history-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.type-badge, .episode-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--surface2);
  color: var(--text2);
}
.episode-badge {
  background: rgba(232, 54, 79, 0.15);
  color: var(--accent);
}
.history-time {
  font-size: 12px;
  color: var(--text3);
  margin-top: auto;
}

.loading-state, .unauth-state, .empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text2);
}
</style>
