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
        <div class="hero-bg">
          <picture v-if="item.backdrop || item.poster" class="hero-img-picture">
            <source media="(max-width: 768px)" :srcset="item.backdrop || item.poster" />
            <source media="(min-width: 769px)" :srcset="item.backdropLarge || item.backdrop || item.poster" />
            <img
              :src="item.backdropLarge || item.backdrop || item.poster"
              :alt="item.title"
              :fetchpriority="index === 0 ? 'high' : 'auto'"
              :loading="index === 0 ? 'eager' : 'lazy'"
              class="hero-img"
              width="1280"
              height="720"
            />
          </picture>
          <div
            v-else
            class="hero-bg-fallback"
            :style="{ background: bgGradients[index % bgGradients.length] }"
          ></div>
        </div>

        <!-- Gradient overlay -->
        <div class="hero-overlay" :class="item.countryKey"></div>

        <!-- Content -->
        <div class="hero-content">
          <div class="hero-info">
            <div class="hero-badge" :style="{ backgroundColor: getCountryColor(item.countryKey) }">
              <span class="badge-dot"></span>
              {{ item.flag }} {{ getDramaTag(item.countryKey) }} TRENDING
            </div>

            <h1 class="hero-title">{{ item.title }}</h1>

            <div class="hero-meta">
              <span class="hero-rating">⭐ {{ item.rating || '8.0' }}</span>
              <span class="hero-sep">•</span>
              <span class="hero-year">{{ item.year || 'TBA' }}</span>
              <span class="hero-tag">13+</span>
              <span class="hero-tag">{{ getCountryLabel(item.countryKey) }}</span>
              <span class="hero-sep">•</span>
              <span class="hero-genre">Drama, Series</span>
            </div>

            <p class="hero-desc">{{ truncate(item.overview, 160) }}</p>

            <div class="hero-btns">
              <router-link :to="`/watch/series/${item.id}`" class="btn-primary hero-btn" :style="{ backgroundColor: getCountryColor(item.countryKey), borderColor: getCountryColor(item.countryKey) }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21 5,3"/>
                </svg>
                Tonton Sekarang
              </router-link>
              <router-link :to="`/watch/series/${item.id}`" class="btn-secondary hero-btn">
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
        :style="i === currentIndex ? { backgroundColor: getCountryColor(item.countryKey) } : {}"
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
import { DRAMA_COUNTRIES } from '../services/dramaApi'

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
]

const displayItems = computed(() => (props.items || []).slice(0, 5))

function getCountryColor(key) {
  switch (key) {
    case 'korea': return '#ff4b72'; // Sweet Pink
    case 'china': return '#e8364f'; // Majestic Red
    case 'jepang': return '#3399ff'; // Calm Blue
    case 'thailand': return '#d4af37'; // Royal Gold
    default: return 'var(--accent)';
  }
}

function getDramaTag(key) {
  switch (key) {
    case 'korea': return 'K-DRAMA';
    case 'china': return 'C-DRAMA';
    case 'jepang': return 'J-DRAMA';
    case 'thailand': return 'T-DRAMA';
    default: return 'ASIAN DRAMA';
  }
}

function getCountryLabel(key) {
  const config = DRAMA_COUNTRIES[key];
  return config ? config.label : 'Drama Asia';
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
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
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
}

.hero-img-picture {
  display: block;
  width: 100%;
  height: 100%;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.hero-bg-fallback {
  width: 100%;
  height: 100%;
}

/* OVERLAY WITH COUNTRY ACCENT VARIATIONS */
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(10,10,15,0.95) 30%, rgba(10,10,15,0.4) 70%, transparent 100%),
    linear-gradient(to top, rgba(10,10,15,1) 0%, rgba(10,10,15,0.2) 30%, transparent 60%);
}

.hero-overlay.korea {
  background:
    linear-gradient(to right, rgba(15,8,12,0.95) 35%, rgba(15,8,12,0.3) 70%, transparent 100%),
    linear-gradient(to top, rgba(15,8,12,1) 0%, rgba(15,8,12,0.2) 35%, transparent 60%);
}

.hero-overlay.china {
  background:
    linear-gradient(to right, rgba(15,7,7,0.95) 35%, rgba(15,7,7,0.3) 70%, transparent 100%),
    linear-gradient(to top, rgba(15,7,7,1) 0%, rgba(15,7,7,0.2) 35%, transparent 60%);
}

.hero-overlay.jepang {
  background:
    linear-gradient(to right, rgba(7,10,15,0.95) 35%, rgba(7,10,15,0.3) 70%, transparent 100%),
    linear-gradient(to top, rgba(7,10,15,1) 0%, rgba(7,10,15,0.2) 35%, transparent 60%);
}

.hero-overlay.thailand {
  background:
    linear-gradient(to right, rgba(14,13,8,0.95) 35%, rgba(14,13,8,0.3) 70%, transparent 100%),
    linear-gradient(to top, rgba(14,13,8,1) 0%, rgba(14,13,8,0.2) 35%, transparent 60%);
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
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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
  font-size: 56px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0,0,0,0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
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
  max-width: 460px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* BUTTONS */
.hero-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 13px 28px;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-primary.hero-btn:hover {
  filter: brightness(1.15);
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
}

.btn-secondary.hero-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
}

.btn-secondary.hero-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.3);
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
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text2);
  transition: all 0.2s;
}

.hero-arrow:hover {
  background: #fff;
  color: #000;
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
  .hero-title { font-size: 38px; }
  .hero-content { padding: 24px; }
  .hero-desc { display: none; }
  .hero-arrows { left: 24px; }
}

@media (max-width: 480px) {
  .hero { height: 320px; }
  .hero-title { font-size: 30px; }
}
</style>
