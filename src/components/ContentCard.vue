<template>
  <div class="content-card animate-slide-up" @mouseenter="handleMouseEnter" @mouseleave="showPreview = false" ref="cardRef">
    <router-link :to="`/watch/${item.type}/${item.id}`" class="content-card__link">
      <div class="content-card__poster">
        <img 
          v-if="item.poster" 
          :src="item.poster" 
          :alt="item.title"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-else class="poster-placeholder">
          <i class="fas fa-image"></i>
        </div>
        
        <!-- Badges Stack - Top Left -->
        <div class="content-card__badges">
          <div v-if="isTrending" class="badge badge--top10">
            <span class="top10-text">TOP</span>
            <span class="top10-number">10</span>
          </div>
          <div v-if="isNew" class="badge badge--new">NEW</div>
          <div class="badge badge--quality" :class="qualityClass">
            {{ item.quality || 'HD' }}
          </div>
          <div v-if="item.rating" class="badge badge--rating">
            <i class="fas fa-star"></i>
            {{ formatRating(item.rating) }}
          </div>
        </div>

        <!-- Hover Overlay -->
        <div class="content-card__overlay">
          <div class="overlay-actions-top">
            <button class="circle-btn" @click.stop.prevent="toggleWatchlist" :title="inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'">
              <i :class="inWatchlist ? 'fas fa-check' : 'fas fa-plus'"></i>
            </button>
            <button class="circle-btn"><i class="fas fa-thumbs-up"></i></button>
            <button class="circle-btn" @click.stop.prevent="navigateToWatch" title="More Info"><i class="fas fa-info-circle"></i></button>
          </div>
          
          <div class="overlay-play" @click.stop.prevent="navigateToWatch">
            <div class="play-icon-wrapper">
              <i class="fas fa-play"></i>
            </div>
          </div>

          <div class="overlay-info">
            <div class="info-meta">
              <span class="match-text">98% Match</span>
              <span class="meta-age">16+</span>
              <span>1h 47m</span>
            </div>
            <div class="info-genres">
              {{ item.genres ? (Array.isArray(item.genres) ? item.genres.slice(0, 2).join(' • ') : item.genres) : 'Action • Thriller' }}
            </div>
          </div>
        </div>

        <!-- Progress Bar for Continue Watching -->
        <div v-if="item.progress" class="progress-bar-container">
           <div class="progress-bar" :style="{ width: item.progress + '%' }"></div>
        </div>
      </div>
      
      <!-- Clean Info Below Poster -->
      <div class="content-card__info">
        <h3 class="content-card__title" :title="item.title">{{ item.title }}</h3>
        <div class="content-card__meta">
          <span v-if="item.year">{{ item.year }}</span>
          <span class="meta-dot">•</span>
          <span class="meta-type">{{ typeBadge }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
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
const cardRef = ref(null)

const isTrending = computed(() => (parseFloat(props.item.rating) > 8.2))
const isNew = computed(() => props.item.year === '2024')

function handleMouseEnter() {
  if (props.item.genres) {
    trackGenreInteraction(props.item.genres)
  }
}

const typeBadge = computed(() => {
  switch (props.item.type) {
    case 'series': return 'TV'
    case 'movie': return 'Movie'
    default: return 'Movie'
  }
})

const inWatchlist = computed(() => {
  return isInWatchlist(props.item.id, props.item.type)
})

const qualityClass = computed(() => {
  const q = (props.item.quality || 'HD').toLowerCase()
  if (q.includes('4k') || q.includes('bluray')) return 'quality-gold'
  return 'quality-standard'
})

function formatRating(rating) {
  if (typeof rating === 'number') {
    return rating.toFixed(1)
  }
  return rating
}

function handleImageError(e) {
  e.target.style.display = 'none'
}

function toggleWatchlist() {
  if (inWatchlist.value) {
    removeFromWatchlist(props.item.id, props.item.type)
    if (showToast) showToast('Dihapus dari Watchlist', 'info')
  } else {
    addToWatchlist(props.item, 'planned')
    if (showToast) showToast('Ditambahkan ke Watchlist', 'success')
    if (props.item.genres) {
      trackGenreInteraction(props.item.genres)
    }
  }
}

function navigateToWatch() {
  router.push(`/watch/${props.item.type}/${props.item.id}`)
}
</script>

<style scoped>
.content-card {
  position: relative;
  width: 100%;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s 0.35s;
}

.content-card:hover {
  transform: translateY(-8px) scale(1.04);
  z-index: 20;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s;
}

.content-card__link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.content-card__poster {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.35s ease;
}

.content-card:hover .content-card__poster {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 212, 170, 0.15);
}

.content-card__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-card:hover .content-card__poster img {
  transform: scale(1.08);
}

.poster-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 2rem;
}

/* Badges Stack */
.content-card__badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 5;
  transition: transform 0.3s ease;
}

.content-card:hover .content-card__badges {
  transform: translateY(-2px);
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.badge--quality {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
}

.badge--quality.quality-gold {
  background: var(--accent-gradient);
  color: #000;
  border: none;
}

.badge--rating {
  background: rgba(0, 0, 0, 0.7);
  color: #f1c40f;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

/* Hover Overlay System */
.content-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 5;
}

.content-card:hover .content-card__overlay {
  opacity: 1;
}

.overlay-actions-top {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  transform: translateY(-10px);
  transition: all 0.4s ease 0.1s;
}

.content-card:hover .overlay-actions-top {
  transform: translateY(0);
}

.circle-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.circle-btn:hover {
  background: white;
  color: black;
  transform: scale(1.1);
}

.overlay-play {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 18px;
  transform: scale(0.5);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.content-card:hover .play-icon-wrapper {
  transform: scale(1);
  opacity: 1;
}

.overlay-info {
  transform: translateY(10px);
  transition: all 0.4s ease 0.1s;
}

.content-card:hover .overlay-info {
  transform: translateY(0);
}

.info-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 5px;
}

.match-text {
  color: #4cd137;
}

.meta-age {
  border: 1px solid rgba(255,255,255,0.5);
  padding: 0 4px;
  border-radius: 2px;
  font-size: 9px;
}

.info-genres {
  font-size: 10px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Info meta inside overlay */
.info-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 5px;
}

.match-text {
  color: #4cd137;
}

.meta-age {
  border: 1px solid rgba(255,255,255,0.5);
  padding: 0 4px;
  border-radius: 2px;
  font-size: 9px;
}

.info-genres {
  font-size: 10px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Progress Bar */
.progress-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255,255,255,0.1);
  z-index: 6;
}

.progress-bar {
  height: 100%;
  background: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-primary);
}

.content-card__info {
  padding: 8px 4px;
}

.content-card__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
  transition: color 0.2s;
}

.content-card:hover .content-card__title {
  color: var(--accent-primary);
}

.content-card__meta {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-dot {
  font-size: 8px;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .content-card:hover {
    transform: translateY(-4px) scale(1.02);
  }
  
  .content-card__overlay {
    /* Always show some overlay info on mobile/tablet? Or simplified? */
  }
}

@media (max-width: 480px) {
  .content-card__title {
    font-size: 13px;
  }
  
  .content-card__meta {
    font-size: 10px;
  }
}
</style>
