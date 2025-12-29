<template>
  <div class="watchlist-view">
    <div class="watchlist-header">
      <h1><i class="fas fa-bookmark"></i> My Watchlist</h1>
      <p class="watchlist-subtitle">{{ watchlist.length }} titles in your watchlist</p>
    </div>

    <!-- Status Tabs -->
    <div class="status-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="['status-tab', { active: activeTab === tab.value }]"
        @click="activeTab = tab.value"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
        <span class="tab-count">{{ getCount(tab.value) }}</span>
      </button>
    </div>

    <!-- Watchlist Grid -->
    <div v-if="filteredList.length" class="watchlist-grid">
      <div v-for="item in filteredList" :key="`${item.type}-${item.id}`" class="watchlist-item">
        <router-link :to="`/watch/${item.type}/${item.id}`" class="watchlist-item__poster">
          <img v-if="item.poster" :src="item.poster" :alt="item.title" loading="lazy" />
          <div v-else class="poster-placeholder">
            <i class="fas fa-film"></i>
          </div>
          
          <!-- Progress bar for series/anime -->
          <div v-if="item.totalEpisodes" class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: getProgressWidth(item) }"
            ></div>
          </div>
        </router-link>
        
        <div class="watchlist-item__info">
          <span class="item-type-badge">{{ item.type.toUpperCase() }}</span>
          <h3 class="item-title" :title="item.title">{{ item.title }}</h3>
          
          <div class="item-meta">
            <span v-if="item.year"><i class="fas fa-calendar"></i> {{ item.year }}</span>
            <span v-if="item.rating"><i class="fas fa-star"></i> {{ item.rating }}</span>
          </div>
          
          <!-- Episode progress -->
          <div v-if="item.totalEpisodes" class="episode-progress">
            <span>EP {{ item.currentEpisode || 0 }} / {{ item.totalEpisodes }}</span>
            <div class="episode-controls">
              <button @click.prevent="decrementEpisode(item)" :disabled="item.currentEpisode <= 0">
                <i class="fas fa-minus"></i>
              </button>
              <button @click.prevent="incrementEpisode(item)" :disabled="item.currentEpisode >= item.totalEpisodes">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          
          <!-- Status selector -->
          <div class="status-selector">
            <select v-model="item.status" @change="handleStatusChange(item)">
              <option value="planned">📋 Planned</option>
              <option value="watching">▶️ Watching</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
          
          <!-- Remove button -->
          <button class="remove-btn" @click="handleRemove(item)">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-bookmark"></i>
      <h2>No items in {{ activeTab === 'all' ? 'your watchlist' : `"${activeTab}" list` }}</h2>
      <p>Start adding movies, series, or anime to your watchlist!</p>
      <router-link to="/" class="btn btn-primary">
        <i class="fas fa-search"></i> Discover Content
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  watchlist, 
  removeFromWatchlist, 
  updateWatchlistStatus, 
  updateEpisodeProgress,
  getWatchlistByStatus
} from '../stores/userStore'

const activeTab = ref('all')

const tabs = [
  { value: 'all', label: 'All', icon: 'fas fa-list' },
  { value: 'watching', label: 'Watching', icon: 'fas fa-play' },
  { value: 'planned', label: 'Planned', icon: 'fas fa-clock' },
  { value: 'completed', label: 'Completed', icon: 'fas fa-check' }
]

const filteredList = computed(() => {
  return getWatchlistByStatus(activeTab.value)
})

function getCount(status) {
  if (status === 'all') return watchlist.length
  return watchlist.filter(w => w.status === status).length
}

function getProgressWidth(item) {
  if (!item.totalEpisodes) return '0%'
  return `${(item.currentEpisode / item.totalEpisodes) * 100}%`
}

function handleStatusChange(item) {
  updateWatchlistStatus(item.id, item.type, item.status)
}

function handleRemove(item) {
  if (confirm(`Remove "${item.title}" from watchlist?`)) {
    removeFromWatchlist(item.id, item.type)
  }
}

function incrementEpisode(item) {
  if (item.currentEpisode < item.totalEpisodes) {
    updateEpisodeProgress(item.id, item.type, item.currentEpisode + 1)
  }
}

function decrementEpisode(item) {
  if (item.currentEpisode > 0) {
    updateEpisodeProgress(item.id, item.type, item.currentEpisode - 1)
  }
}
</script>

<style scoped>
.watchlist-view {
  animation: fadeIn 0.5s ease;
}

.watchlist-header {
  margin-bottom: var(--spacing-xl);
}

.watchlist-header h1 {
  font-size: var(--font-2xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.watchlist-header h1 i {
  color: var(--accent-primary);
}

.watchlist-subtitle {
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
}

/* Status Tabs */
.status-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
}

.status-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.status-tab:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.status-tab.active {
  background: var(--accent-gradient);
  border-color: transparent;
  color: var(--bg-primary);
}

.tab-count {
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: var(--radius-xl);
  font-size: var(--font-xs);
}

.status-tab.active .tab-count {
  background: rgba(0,0,0,0.2);
}

/* Watchlist Grid */
.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.watchlist-item {
  display: flex;
  gap: var(--spacing-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all var(--transition-normal);
}

.watchlist-item:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.watchlist-item__poster {
  flex-shrink: 0;
  width: 100px;
  height: 150px;
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
}

.watchlist-item__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 2rem;
}

/* Progress bar */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0,0,0,0.5);
}

.progress-fill {
  height: 100%;
  background: var(--accent-gradient);
  transition: width 0.3s ease;
}

/* Item Info */
.watchlist-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.item-type-badge {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--accent-gradient);
  color: var(--bg-primary);
  border-radius: var(--radius-sm);
  align-self: flex-start;
}

.item-title {
  font-size: var(--font-md);
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.item-meta i {
  margin-right: 4px;
  color: var(--accent-primary);
}

/* Episode Progress */
.episode-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.episode-controls {
  display: flex;
  gap: 4px;
}

.episode-controls button {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all var(--transition-normal);
}

.episode-controls button:hover:not(:disabled) {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.episode-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Status Selector */
.status-selector select {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-sm);
  cursor: pointer;
}

/* Remove Button */
.remove-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: 1px solid var(--accent-secondary);
  border-radius: var(--radius-sm);
  color: var(--accent-secondary);
  font-size: var(--font-xs);
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: auto;
}

.remove-btn:hover {
  background: var(--accent-secondary);
  color: white;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: var(--spacing-xl);
}

.empty-state i {
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.empty-state h2 {
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: var(--spacing-xl);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .watchlist-grid {
    grid-template-columns: 1fr;
  }
  
  .status-tabs {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
