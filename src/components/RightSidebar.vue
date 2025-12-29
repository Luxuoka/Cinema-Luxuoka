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
            <p>
              <span v-if="item.rating">
                <i class="fas fa-star"></i> {{ item.rating }}
              </span>
              <span v-if="item.type" class="type-badge">{{ item.type }}</span>
            </p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Watchlist Preview -->
    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="sidebar-title">
          <i class="fas fa-bookmark"></i>
          Watchlist
        </h3>
        <router-link to="/watchlist" class="see-all">See All</router-link>
      </div>
      <div class="watchlist-preview">
        <div v-if="recentWatchlist.length" class="preview-list">
          <router-link 
            v-for="item in recentWatchlist" 
            :key="`${item.type}-${item.id}`"
            :to="`/watch/${item.type}/${item.id}`"
            class="preview-item"
          >
            <div class="preview-poster">
              <img v-if="item.poster" :src="item.poster" :alt="item.title" loading="lazy" />
            </div>
            <div class="preview-info">
              <h4>{{ item.title }}</h4>
              <span class="status-badge" :class="item.status">{{ item.status }}</span>
            </div>
          </router-link>
        </div>
        <div v-else class="empty-state">
          <i class="fas fa-plus-circle"></i>
          <p>Add shows to your watchlist</p>
          <router-link to="/movies" class="btn-text">Browse Movies</router-link>
        </div>
      </div>
    </div>

    <!-- Continue Watching -->
    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="sidebar-title">
          <i class="fas fa-history"></i>
          Continue Watching
        </h3>
      </div>
      <div class="continue-list">
        <div v-if="continueWatchingList.length" class="preview-list">
          <router-link 
            v-for="item in continueWatchingList" 
            :key="`${item.type}-${item.id}`"
            :to="`/watch/${item.type}/${item.id}`"
            class="preview-item"
          >
            <div class="preview-poster">
              <img v-if="item.poster" :src="item.poster" :alt="item.title" loading="lazy" />
              <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="preview-info">
              <h4>{{ item.title }}</h4>
              <span class="continue-text">Resume</span>
            </div>
          </router-link>
        </div>
        <div v-else class="empty-state">
          <i class="fas fa-play-circle"></i>
          <p>Start watching to see history</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { watchlist, getContinueWatching } from '../stores/userStore'

defineProps({
  popularItems: {
    type: Array,
    default: () => []
  }
})

// Get 3 most recently added watchlist items
const recentWatchlist = computed(() => {
  return [...watchlist].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 3)
})

const continueWatchingList = computed(() => {
  return getContinueWatching(3)
})
</script>

<style scoped>
.right-sidebar {
  width: 280px;
  min-height: calc(100vh - 70px);
  background: rgba(18, 18, 26, 0.6);
  backdrop-filter: blur(10px);
  border-left: 1px solid var(--border-color);
  padding: var(--spacing-lg) var(--spacing-md);
  position: sticky;
  top: 70px;
  overflow-y: auto;
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

.popular-info p {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.popular-info p i {
  color: #f39c12;
  font-size: 10px;
}

.type-badge {
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-size: 10px;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  color: var(--text-muted);
  text-align: center;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.empty-state i {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-sm);
  opacity: 0.5;
}

.empty-state p {
  font-size: var(--font-xs);
  margin-bottom: var(--spacing-sm);
}

.btn-text {
  font-size: var(--font-xs);
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .right-sidebar {
    display: none;
  }
}
</style>
