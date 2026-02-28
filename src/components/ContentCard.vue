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
        
        <!-- Quality Badge -->
        <div class="quality-badge" :class="qualityClass">
          {{ item.quality || 'HD' }}
        </div>
        
        <!-- Clean Rating Badge on Poster -->
        <span v-if="item.rating" class="content-card__rating">
          <i class="fas fa-star"></i>
          {{ formatRating(item.rating) }}
        </span>
        
        <!-- Watchlist indicator (subtle) -->
        <div v-if="inWatchlist" class="content-card__watchlist-indicator">
          <i class="fas fa-bookmark"></i>
        </div>
        
        <div class="content-card__overlay">
          <div class="content-card__play">
            <i class="fas fa-play"></i>
          </div>
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
    
    <!-- Quick add watchlist button (visible on hover) -->
    <button 
      class="content-card__quick-add" 
      :class="{ active: inWatchlist }"
      @click.stop.prevent="toggleWatchlist"
      :title="inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'"
    >
      <i :class="inWatchlist ? 'fas fa-check' : 'fas fa-plus'"></i>
    </button>
    
    <!-- Hover Preview -->
    <div v-if="showPreview" class="content-card__preview" :class="{ 'align-left': alignLeft }">
      <div class="preview__header">
        <h4>{{ item.title }}</h4>
        <div class="preview__badge-row">
           <span class="preview__rating" v-if="item.rating">
            <i class="fas fa-star"></i> {{ formatRating(item.rating) }}
          </span>
          <span class="preview__quality">HD</span>
        </div>
      </div>
      
      <div v-if="item.genres && item.genres.length" class="preview__genres">
        <span v-for="genre in item.genres.slice(0, 3)" :key="genre" class="preview__genre">
          {{ genre }}
        </span>
      </div>
      
      <div class="preview__meta">
        <span v-if="item.year">{{ item.year }}</span>
        <span v-if="item.episodes">{{ item.episodes }} Episodes</span>
      </div>
      
      <div class="preview__actions">
        <button class="preview__btn preview__btn--primary" @click.stop="navigateToWatch">
          <i class="fas fa-play"></i>
        </button>
        <button 
          class="preview__btn" 
          :class="{ 'preview__btn--active': inWatchlist }"
          @click.stop="toggleWatchlist"
        >
          <i :class="inWatchlist ? 'fas fa-check' : 'fas fa-plus'"></i>
        </button>
        <button class="preview__btn">
          <i class="fas fa-thumbs-up"></i>
        </button>
      </div>
    </div>
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
const showPreview = ref(false)
const alignLeft = ref(false)
const cardRef = ref(null)

function handleMouseEnter() {
  if (cardRef.value) {
    const rect = cardRef.value.getBoundingClientRect()
    const spaceRight = window.innerWidth - rect.right
    alignLeft.value = spaceRight < 320
  }
  showPreview.value = true
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

/* Minimalist Rating - Top Right */
.content-card__rating {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  color: #f1c40f;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 5;
}

.content-card__rating i {
  font-size: 9px;
}

/* Quality Badge */
.quality-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  z-index: 5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.quality-standard {
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
}

.quality-gold {
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  color: #000;
}

/* Watchlist Indicator */
.content-card__watchlist-indicator {
  position: absolute;
  top: 32px;
  left: 8px;
  color: var(--accent-primary);
  font-size: 1.1rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  z-index: 5;
}

/* Overlay with play button */
.content-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: var(--radius-md);
}

.content-card:hover .content-card__overlay {
  opacity: 1;
}

.content-card__play {
  width: 52px;
  height: 52px;
  background: var(--accent-red-gradient);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  box-shadow: 0 4px 20px rgba(231, 76, 60, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: scale(0.8);
}

.content-card:hover .content-card__play {
  transform: scale(1);
}

.content-card__info {
  padding: 0 4px;
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

/* Quick Add Button - Floating */
.content-card__quick-add {
  position: absolute;
  bottom: 65px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.25s ease;
  z-index: 10;
}

.content-card:hover .content-card__quick-add {
  opacity: 1;
  transform: translateY(0);
}

.content-card__quick-add:hover {
  background: var(--accent-primary);
  color: #000;
  border-color: var(--accent-primary);
  transform: scale(1.15);
}

.content-card__quick-add.active {
  background: var(--accent-primary);
  color: #000;
  opacity: 1;
  border-color: var(--accent-primary);
}

/* Hover Preview */
.content-card__preview {
  position: absolute;
  top: 0;
  left: 100%;
  width: 280px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  z-index: 100;
  box-shadow: 0 15px 40px rgba(0,0,0,0.5);
  animation: fadeInRight 0.2s ease;
  margin-left: var(--spacing-sm);
}

.content-card__preview.align-left {
  left: auto;
  right: 100%;
  margin-left: 0;
  margin-right: var(--spacing-sm);
  animation: fadeInLeft 0.2s ease;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.preview__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
  gap: var(--spacing-sm);
}

.preview__header h4 {
  font-size: var(--font-sm);
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.preview__badge-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.preview__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-xs);
  color: #f39c12;
  white-space: nowrap;
}

.preview__quality {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  font-weight: 700;
  color: var(--text-secondary);
}

.preview__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: var(--spacing-sm);
}

.preview__genre {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--bg-glass);
  border-radius: var(--radius-xl);
  color: var(--text-secondary);
}

.preview__meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-xs);
  color: var(--text-muted);
  margin-bottom: var(--spacing-sm);
}

.preview__meta i {
  margin-right: 4px;
  color: var(--accent-primary);
}

.preview__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.preview__btn {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-xs);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all var(--transition-normal);
}

.preview__btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.preview__btn--primary {
  background: var(--accent-gradient);
  border: none;
  color: var(--bg-primary);
}

.preview__btn--primary:hover {
  opacity: 0.9;
  color: var(--bg-primary);
}

.preview__btn--active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .content-card__preview {
    display: none;
  }
  
  .content-card:hover {
    transform: translateY(-4px) scale(1.02);
  }
}

@media (max-width: 480px) {
  .content-card__title {
    font-size: 13px;
  }
  
  .content-card__meta {
    font-size: 10px;
  }
  
  .content-card__play {
    width: 40px;
    height: 40px;
  }
  
  .content-card__play i {
    font-size: 14px;
  }
}
</style>
