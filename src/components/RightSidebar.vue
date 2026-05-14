<template>
  <aside class="popular-panel">
    <!-- POPULAR NOW -->
    <div class="panel-card">
      <div class="panel-title">Popular Now</div>
      <div class="popular-list">
        <router-link
          v-for="(item, index) in displayItems"
          :key="item.id || index"
          :to="`/watch/${item.type || 'series'}/${item.id}`"
          class="popular-item"
        >
          <div class="popular-num">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="popular-thumb">
            <img v-if="item.poster" :src="item.poster" :alt="item.title" loading="lazy" />
            <div v-else class="popular-thumb-inner">🎬</div>
          </div>
          <div class="popular-meta">
            <div class="popular-title-text">{{ item.title }}</div>
            <div class="popular-rating">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c842" stroke="#f5c842" stroke-width="0">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {{ item.rating ? (typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating) : '8.0' }}
            </div>
            <div class="popular-views">{{ ((10.5 - index * 0.5)).toFixed(1) }}M views</div>
          </div>
          <span class="popular-trend" :class="index % 2 === 0 ? 'trend-up' : 'trend-same'">
            {{ index % 2 === 0 ? '↑' : '→' }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- TOP GENRE -->
    <div class="panel-card">
      <div class="panel-title">Top Bulan Ini</div>
      <div class="genre-stats">
        <div class="genre-stat-row">
          <span class="genre-stat-name">Action</span>
          <span class="genre-stat-pct" style="color:var(--accent)">34%</span>
        </div>
        <div class="genre-stat-row">
          <span class="genre-stat-name">Drama</span>
          <span class="genre-stat-pct" style="color:var(--blue)">28%</span>
        </div>
        <div class="genre-stat-row">
          <span class="genre-stat-name">Sci-Fi</span>
          <span class="genre-stat-pct" style="color:var(--green)">18%</span>
        </div>
        <div class="genre-stat-row" style="border-bottom:none">
          <span class="genre-stat-name">Anime</span>
          <span class="genre-stat-pct" style="color:var(--gold)">20%</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  popularItems: {
    type: Array,
    default: () => []
  }
})

const displayItems = computed(() => props.popularItems.slice(0, 5))
</script>

<style scoped>
.popular-panel {
  width: 280px;
  flex-shrink: 0;
  padding: 28px 0 28px 0;
  padding-right: 8px;
}

.panel-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title::before {
  content: '';
  width: 3px;
  height: 14px;
  background: var(--accent);
  border-radius: 2px;
}

/* POPULAR LIST */
.popular-list {
  display: flex;
  flex-direction: column;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
  text-decoration: none;
  color: var(--text);
}

.popular-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.popular-item:hover {
  opacity: 0.85;
}

.popular-num {
  font-family: var(--font-display);
  font-size: 28px;
  color: var(--text3);
  width: 32px;
  flex-shrink: 0;
  line-height: 1;
}

.popular-thumb {
  width: 44px;
  height: 62px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface2);
}

.popular-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popular-thumb-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: linear-gradient(135deg, var(--surface2), var(--surface));
}

.popular-meta {
  flex: 1;
  min-width: 0;
}

.popular-title-text {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
  margin-bottom: 4px;
}

.popular-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--gold);
  font-weight: 600;
  margin-bottom: 2px;
}

.popular-views {
  font-size: 11px;
  color: var(--text3);
}

.popular-trend {
  font-size: 11px;
  padding: 3px 7px;
  border-radius: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.trend-up {
  background: rgba(46, 204, 130, 0.15);
  color: var(--green);
}

.trend-same {
  background: rgba(153, 152, 176, 0.15);
  color: var(--text3);
}

/* GENRE STATS */
.genre-stats {
  display: flex;
  flex-direction: column;
}

.genre-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text3);
}

.genre-stat-name {
  color: var(--text2);
}

.genre-stat-pct {
  font-weight: 600;
}

@media (max-width: 1100px) {
  .popular-panel {
    display: none;
  }
}
</style>
