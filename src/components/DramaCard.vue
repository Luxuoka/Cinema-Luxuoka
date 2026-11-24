<template>
  <div class="movie-card" @click="navigateToWatch">
    <div class="card-thumb" role="img" :aria-label="item.title">
      <img v-if="item.poster" :src="item.poster" :alt="item.title" @error="handleImgError" width="160" height="230" loading="lazy" decoding="async" />
      <div v-else class="card-thumb-placeholder">🎬</div>

      <!-- Hover Overlay -->
      <div class="card-overlay">
        <div class="card-play">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
        <div v-if="item.overview" class="card-synopsis">
          {{ truncate(item.overview, 60) }}
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
        <span v-if="item.flag" class="badge badge-flag">{{ item.flag }}</span>
        <span v-if="item.isOngoing" class="badge badge-ongoing">ONGOING</span>
        <span v-if="item.isNew" class="badge badge-new">BARU</span>
      </div>

      <!-- Rating top-right -->
      <div v-if="item.rating && item.rating !== '0.0'" class="card-rating">⭐ {{ item.rating }}</div>
    </div>

    <div class="card-title" :title="item.title">{{ item.title }}</div>
    <div class="card-meta">{{ item.year || 'TBA' }} · {{ countryLabel }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { trackGenreInteraction } from '../stores/userStore'
import { DRAMA_COUNTRIES } from '../services/dramaApi'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const countryLabel = computed(() => {
  const config = DRAMA_COUNTRIES[props.item.countryKey];
  return config ? config.label : 'Drama Asia';
})

function handleImgError(e) {
  e.target.style.display = 'none'
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function navigateToWatch() {
  if (props.item.genres) trackGenreInteraction(props.item.genres)
  router.push(`/watch/series/${props.item.id}`)
}

function shareItem() {
  const url = `${location.origin}/watch/series/${props.item.id}`
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      alert('🔗 Link disalin!')
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
  content-visibility: auto;
  contain-intrinsic-size: 160px 280px;
}

.movie-card:hover {
  transform: translateY(-4px);
}

.movie-card:hover .card-overlay {
  opacity: 1;
}

.movie-card:hover .card-thumb img,
.movie-card:hover .card-thumb-placeholder {
  filter: brightness(0.5);
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
  aspect-ratio: 160/230;
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
  background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3) 70%);
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
  margin: 0 auto auto;
  box-shadow: 0 8px 20px rgba(232, 54, 79, 0.6);
  transform: translateY(15px);
  transition: transform 0.3s;
}

.movie-card:hover .card-play {
  transform: translateY(0);
}

.card-synopsis {
  font-size: 11px;
  color: var(--text2);
  text-align: center;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  align-items: flex-start;
}

.badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.badge-flag {
  font-size: 12px;
  padding: 0;
  background: none;
}

.badge-ongoing {
  background: var(--green);
  color: #000;
}

.badge-new {
  background: var(--accent);
  color: #fff;
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
