<template>
  <div class="movie-card" @click="navigateToWatch">
    <div class="card-thumb">
      <img v-if="item.poster" :src="item.poster" :alt="item.title" loading="lazy" @error="handleImgError" />
      <div v-else class="card-thumb-placeholder">🎬</div>

      <!-- Hover Overlay -->
      <div class="card-overlay">
        <div class="card-play">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
        <div class="card-actions">
          <div class="card-action" @click.stop="toggleWatchlist" :title="inWatchlist ? 'Hapus dari watchlist' : 'Tambah ke watchlist'">
            <svg v-if="inWatchlist" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </div>
          <div class="card-action" @click.stop="shareItem" title="Bagikan">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Badges top-left -->
      <div class="card-badges">
        <span v-if="isHD" class="badge badge-hd">HD</span>
        <span v-if="isTrending" class="badge badge-top">TOP 10</span>
        <span v-if="isNew" class="badge badge-new">BARU</span>
      </div>

      <!-- Rating top-right -->
      <div v-if="item.rating" class="card-rating">⭐ {{ formatRating(item.rating) }}</div>

      <!-- Progress bar (continue watching) -->
      <div v-if="item.progress" class="card-progress-bar">
        <div class="card-progress-fill" :style="{ width: item.progress + '%' }"></div>
      </div>
    </div>

    <div class="card-title" :title="item.title">{{ item.title }}</div>
    <div class="card-meta">{{ item.year }} · {{ typeBadge }}</div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { isInWatchlist, addToWatchlist, removeFromWatchlist, trackGenreInteraction } from '../stores/userStore'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const showToast = inject('toast')

const isHD = true
const isTrending = computed(() => parseFloat(props.item.rating) > 8.2)
const isNew = computed(() => {
  const year = parseInt(props.item.year)
  return year >= 2025
})

const inWatchlist = computed(() => isInWatchlist(props.item.id, props.item.type))

const typeBadge = computed(() => {
  switch (props.item.type) {
    case 'series': return 'TV SHOW'
    case 'anime': return 'ANIME'
    default: return 'MOVIE'
  }
})

function formatRating(rating) {
  if (typeof rating === 'number') return rating.toFixed(1)
  return rating
}

function handleImgError(e) {
  e.target.style.display = 'none'
}

function navigateToWatch() {
  if (props.item.genres) trackGenreInteraction(props.item.genres)
  router.push(`/watch/${props.item.type || 'movie'}/${props.item.id}`)
}

function toggleWatchlist() {
  if (inWatchlist.value) {
    removeFromWatchlist(props.item.id, props.item.type)
    if (showToast) showToast('Dihapus dari Watchlist', 'info')
  } else {
    addToWatchlist(props.item, 'planned')
    if (showToast) showToast('❤️ Ditambahkan ke Watchlist!', 'success')
    if (props.item.genres) trackGenreInteraction(props.item.genres)
  }
}

function shareItem() {
  const url = `${location.origin}/watch/${props.item.type || 'movie'}/${props.item.id}`
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      if (showToast) showToast('🔗 Link disalin!', 'info')
    })
  }
}
</script>

<style scoped>
.movie-card {
  min-width: 160px;
  max-width: 160px;
  cursor: pointer;
  flex-shrink: 0;
  scroll-snap-align: start;
  transition: transform 0.25s;
}

.movie-card:hover {
  transform: translateY(-4px);
}

.movie-card:hover .card-overlay {
  opacity: 1;
}

.movie-card:hover .card-thumb img,
.movie-card:hover .card-thumb-placeholder {
  filter: brightness(0.7);
}

/* THUMB */
.card-thumb {
  height: 230px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
  background: var(--surface2);
  margin-bottom: 10px;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
}

.card-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, var(--surface), var(--surface2));
  transition: filter 0.3s;
}

/* OVERLAY */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.card-play {
  width: 42px;
  height: 42px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 8px 20px rgba(232, 54, 79, 0.6);
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.card-action {
  width: 30px;
  height: 30px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.card-action:hover {
  background: rgba(255,255,255,0.3);
}

/* BADGES */
.card-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
  flex-direction: column;
}

.badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.badge-hd {
  background: var(--blue);
  color: #fff;
}

.badge-top {
  background: var(--accent);
  color: #fff;
}

.badge-new {
  background: var(--green);
  color: #000;
}

/* RATING */
.card-rating {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 3px 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  color: var(--gold);
}

/* PROGRESS BAR */
.card-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255,255,255,0.1);
}

.card-progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--accent), var(--accent2));
  border-radius: 3px;
}

/* TEXT */
.card-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
  color: var(--text);
  transition: color 0.2s;
}

.movie-card:hover .card-title {
  color: var(--accent);
}

.card-meta {
  font-size: 11px;
  color: var(--text3);
}

@media (max-width: 768px) {
  .movie-card {
    min-width: 140px;
    max-width: 140px;
  }
  .card-thumb {
    height: 196px;
  }
}
</style>
