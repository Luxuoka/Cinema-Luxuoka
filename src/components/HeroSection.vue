<template>
  <div class="hero" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
    <!-- SLIDES -->
    <div class="hero-slides" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div
        v-for="(item, index) in displayItems"
        :key="item.id"
        class="hero-slide"
      >
        <!-- Background Image -->
        <div
          class="hero-bg"
          :style="item.backdrop || item.poster
            ? { backgroundImage: `url(${item.backdrop || item.poster})` }
            : { background: bgGradients[index % bgGradients.length] }"
        ></div>

        <!-- Gradient overlay -->
        <div class="hero-overlay"></div>

        <!-- Content -->
        <div class="hero-content">
          <div class="hero-info">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              {{ item.badge || (index === 0 ? '🔥 TRENDING NOW' : index === 1 ? '🎬 NEW SERIES' : '🌟 TOP RATED') }}
            </div>

            <h1 class="hero-title">{{ item.title }}</h1>

            <div class="hero-meta">
              <span class="hero-rating">⭐ {{ formatRating(item.rating) }}</span>
              <span class="hero-sep">•</span>
              <span class="hero-year">{{ item.year }}</span>
              <span class="hero-tag">18+</span>
              <span class="hero-tag">{{ item.type === 'series' ? 'SERIES' : item.type === 'anime' ? 'ANIME' : 'MOVIE' }}</span>
              <span class="hero-sep">•</span>
              <span class="hero-dur">{{ item.type === 'series' ? 'Season ' + (item.seasons || 1) : item.duration || '~2j' }}</span>
              <span class="hero-sep">•</span>
              <span class="hero-genre">{{ item.genres ? (Array.isArray(item.genres) ? item.genres.slice(0, 2).join(', ') : item.genres) : 'Action' }}</span>
            </div>

            <p class="hero-desc">{{ truncate(item.synopsis || item.description, 160) }}</p>

            <div class="hero-btns">
              <router-link :to="`/watch/${item.type || 'movie'}/${item.id}`" class="btn-primary hero-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21 5,3"/>
                </svg>
                Tonton Sekarang
              </router-link>
              <router-link :to="`/watch/${item.type || 'movie'}/${item.id}`" class="btn-secondary hero-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Info Lengkap
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DOTS INDICATOR -->
    <div class="hero-dots">
      <div
        v-for="(item, i) in displayItems"
        :key="i"
        class="hero-dot"
        :class="{ active: i === currentIndex }"
        @click="goSlide(i)"
      ></div>
    </div>

    <!-- PREV / NEXT arrows -->
    <div class="hero-arrows">
      <div class="hero-arrow" @click="prevSlide">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
      </div>
      <div class="hero-arrow" @click="nextSlide">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const currentIndex = ref(0)
let autoPlayInterval = null

const bgGradients = [
  'linear-gradient(135deg,#1a0a2e,#0d1a3a)',
  'linear-gradient(135deg,#0a1a0a,#0d2d1a)',
  'linear-gradient(135deg,#2a0a0a,#1a0a1a)',
  'linear-gradient(135deg,#1a1a0a,#2d2a0d)',
  'linear-gradient(135deg,#0a0a2a,#0d1a3a)',
]

const displayItems = computed(() => (props.items || []).slice(0, 6))

function formatRating(rating) {
  if (!rating) return '8.0'
  return typeof rating === 'number' ? rating.toFixed(1) : rating
}

function truncate(text, len) {
  if (!text) return ''
  return text.length <= len ? text : text.substring(0, len) + '...'
}

function goSlide(n) {
  currentIndex.value = n
}

function nextSlide() {
  if (!displayItems.value.length) return
  currentIndex.value = (currentIndex.value + 1) % displayItems.value.length
}

function prevSlide() {
  if (!displayItems.value.length) return
  currentIndex.value = (currentIndex.value - 1 + displayItems.value.length) % displayItems.value.length
}

function startAutoPlay() {
  stopAutoPlay()
  autoPlayInterval = setInterval(nextSlide, 5500)
}

function stopAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
}

onMounted(() => startAutoPlay())
onUnmounted(() => stopAutoPlay())
</script>

<style scoped>
.hero {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 460px;
  margin-bottom: 28px;
}

/* SLIDES TRACK */
.hero-slides {
  display: flex;
  height: 100%;
  transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
  flex-shrink: 0;
}

/* BACKGROUND */
.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

/* OVERLAY */
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(10,10,15,0.9) 40%, transparent 75%),
    linear-gradient(to top, rgba(10,10,15,1) 0%, rgba(10,10,15,0.3) 30%, transparent 55%);
}

/* CONTENT */
.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 40px 48px;
}

.hero-info {
  max-width: 520px;
}

/* BADGE */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 5px 12px;
  border-radius: 20px;
  margin-bottom: 14px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* TITLE */
.hero-title {
  font-family: var(--font-display);
  font-size: 68px;
  line-height: 0.95;
  letter-spacing: 1px;
  margin-bottom: 14px;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0,0,0,0.6);
}

/* META */
.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  font-weight: 600;
  color: var(--gold);
}

.hero-year, .hero-dur, .hero-genre {
  font-size: 13px;
  color: var(--text2);
}

.hero-tag {
  background: var(--surface);
  border: 1px solid var(--border2);
  color: var(--text2);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.hero-sep {
  color: var(--text3);
  font-size: 10px;
}

/* DESC */
.hero-desc {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.7;
  margin-bottom: 24px;
  max-width: 440px;
}

/* BUTTONS */
.hero-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 13px 28px;
  font-size: 15px;
}

/* DOTS */
.hero-dots {
  position: absolute;
  bottom: 20px;
  right: 32px;
  display: flex;
  gap: 8px;
}

.hero-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.3s;
}

.hero-dot.active {
  width: 24px;
  background: var(--accent);
}

/* ARROWS */
.hero-arrows {
  position: absolute;
  bottom: 20px;
  left: 48px;
  display: flex;
  gap: 6px;
}

.hero-arrow {
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text2);
  transition: all 0.2s;
}

.hero-arrow:hover {
  background: var(--accent);
  color: #fff;
  border-color: transparent;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .hero { border-radius: 16px; }
  .hero-content { padding: 32px 32px; }
}

@media (max-width: 768px) {
  .hero {
    height: 380px;
    border-radius: 12px;
    margin-left: -16px;
    margin-right: -16px;
    border-radius: 0;
  }
  .hero-title { font-size: 42px; }
  .hero-content { padding: 24px; }
  .hero-desc { display: none; }
  .hero-arrows { left: 24px; }
}

@media (max-width: 480px) {
  .hero { height: 320px; }
  .hero-title { font-size: 34px; }
}
</style>
