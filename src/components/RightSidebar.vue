<template>
  <aside class="right-sidebar">
    <!-- Popular Now -->
    <div class="sidebar-section">
      <h3 class="sidebar-title">
        <i class="fas fa-fire"></i>
        Popular Now
      </h3>
      <div class="popular-list">
        <router-link 
          v-for="(item, index) in popularItems" 
          :key="item.id || index"
          :to="`/watch/${item.type}/${item.id}`"
          class="popular-item"
        >
          <span class="rank">{{ index + 1 }}</span>
          <div class="popular-poster">
            <img v-if="item.poster" :src="item.poster" :alt="item.title" loading="lazy" />
            <div v-else class="poster-placeholder">
              <i class="fas fa-film"></i>
            </div>
          </div>
          <div class="popular-info">
            <h4>{{ item.title }}</h4>
            <div class="popular-meta">
              <span v-if="item.rating">
                <i class="fas fa-star"></i> {{ item.rating }}
              </span>
              <div v-if="index % 3 === 0" class="trend up"><i class="fas fa-arrow-up"></i> {{ index + 1 }}</div>
              <div v-else-if="index % 3 === 1" class="trend steady"><i class="fas fa-minus"></i></div>
              <div v-else class="trend down"><i class="fas fa-arrow-down"></i> 1</div>
               <span class="view-count">{{ (10.5 - index * 0.5).toFixed(1) }}M views</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Watchlist Preview Removed as per request -->
    <!-- 
    <div class="sidebar-section">
      ...
    </div> 
    -->

  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { watchlist } from '../stores/userStore'

defineProps({
  popularItems: {
    type: Array,
    default: () => []
  }
})

// Get 3 most recently added watchlist items
// Watchlist logic removed
/*
const recentWatchlist = computed(() => {
  return [...watchlist].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 3)
})
*/

</script>

<style scoped>
.right-sidebar {
  width: 280px;
  min-height: calc(100vh - 70px);
  max-height: calc(100vh - 70px);
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border-left: 1px solid var(--border-color);
  padding: var(--spacing-lg) var(--spacing-md);
  position: sticky;
  top: 70px;
  overflow-y: auto;

  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.06) transparent;
}

.right-sidebar::-webkit-scrollbar {
  width: 3px;
}

.right-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.right-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}

.right-sidebar:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
}

.sidebar-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.sidebar-title i {
  color: var(--accent-primary);
}

.see-all {
  font-size: var(--font-xs);
  color: var(--accent-primary);
  text-decoration: none;
}

.see-all:hover {
  text-decoration: underline;
}

/* Popular List */
.popular-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.popular-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  text-decoration: none;
  border: 1px solid transparent;
}

.popular-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--border-accent);
  transform: translateX(5px);
}

.rank {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--accent-primary);
  min-width: 24px;
  text-align: center;
}

.popular-poster {
  width: 45px;
  height: 65px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
}

.popular-poster img {
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
  color: var(--text-muted);
}

.popular-info {
  flex: 1;
  min-width: 0;
}

.popular-info h4 {
  font-size: var(--font-sm);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.popular-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 11px;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.popular-meta i {
  color: #f1c40f;
  font-size: 10px;
}

.trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 700;
}

.trend.up { color: #2ecc71; }
.trend.down { color: #e74c3c; }
.trend.steady { color: var(--text-muted); }

.view-count {
  font-size: 10px;
  opacity: 0.8;
}

/* Preview List (Watchlist & Continue Watching) */
.preview-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.preview-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-normal);
}

.preview-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.preview-poster {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.preview-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-item:hover .play-overlay {
  opacity: 1;
}

.play-overlay i {
  color: white;
  font-size: 1rem;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-info h4 {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  text-transform: capitalize;
}

.status-badge.planned { background: rgba(52, 152, 219, 0.2); color: #3498db; }
.status-badge.watching { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
.status-badge.completed { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }

.continue-text {
  font-size: 10px;
  color: var(--accent-primary);
}

/* Modern Empty State */
.empty-state-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-icon-wrapper i {
  color: var(--text-muted);
  font-size: 18px;
  margin-left: 2px; /* Polish for play icon center */
}

.empty-state-modern p {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: var(--spacing-lg);
}

.btn-browse {
  background: var(--accent-primary);
  color: #000;
  padding: 8px 20px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-browse:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
}

@media (max-width: 1200px) {
  .right-sidebar {
    display: none;
  }
}
</style>
