<template>
  <section class="hero-carousel" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
    <div class="carousel-track" :style="trackStyle">
      <div 
        v-for="(item, index) in displayItems" 
        :key="item.id" 
        class="hero-slide"
        :class="{ active: index === currentIndex }"
      >
        <!-- Blurred background layer -->
        <div class="hero-blur-bg" :style="{ backgroundImage: `url(${item.backdrop || item.poster})` }"></div>
        
        <!-- Sharp background image -->
        <div class="hero-main-bg" :style="{ backgroundImage: `url(${item.backdrop || item.poster})` }"></div>
        
        <div class="hero__overlay"></div>
        
        <div class="hero__content">
          <div class="hero__badge" v-if="index === currentIndex">
            <i class="fas fa-fire"></i>
            Trending Now
          </div>
          
          <h1 class="hero__title">{{ item.title }}</h1>
          
          <p v-if="item.synopsis" class="hero__description">
            {{ truncateText(item.synopsis, 180) }}
          </p>
          
          <div class="hero__meta">
            <span v-if="item.rating" class="meta-item rating">
              <i class="fas fa-star"></i>
              {{ item.rating }}
            </span>
            <span class="meta-divider">|</span>
            <span v-if="item.year" class="meta-item">
              <i class="fas fa-calendar"></i>
              {{ item.year }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item age-rating">18+</span>
            <span class="meta-divider">|</span>
            <span class="meta-item type">
              {{ item.type === 'series' ? 'TV SERIES' : 'MOVIE' }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item duration">
              <i class="fas fa-clock"></i>
              {{ item.type === 'series' ? 'S' + (item.seasons || 1) : (item.duration || '1h 47m') }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item genres">
              {{ item.genres ? (Array.isArray(item.genres) ? item.genres.slice(0, 2).join(', ') : item.genres) : 'Action, Thriller' }}
            </span>
          </div>
          
          <div class="hero__actions">
            <router-link 
              :to="`/watch/${item.type || 'movie'}/${item.id}`" 
              class="btn btn-primary hero-btn-watch"
            >
              <i class="fas fa-play"></i>
              Watch Now
            </router-link>
            <button class="btn btn-secondary hero-btn-info" @click="navigateToWatch(item)">
              <i class="fas fa-info-circle"></i>
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="carousel-nav prev" @click="prevSlide" v-if="displayItems.length > 1">
      <i class="fas fa-chevron-left"></i>
    </div>
    <div class="carousel-nav next" @click="nextSlide" v-if="displayItems.length > 1">
      <i class="fas fa-chevron-right"></i>
    </div>

    <!-- Indicators -->
    <div class="carousel-indicators" v-if="displayItems.length > 1">
      <button 
        v-for="(item, index) in displayItems" 
        :key="index"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
        :aria-label="`Go to slide ${index + 1}`"
      >
        <span class="indicator-progress" v-if="index === currentIndex"></span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const currentIndex = ref(0)
let autoPlayInterval = null

const displayItems = computed(() => {
  return (props.items || []).slice(0, 6)
})

const trackStyle = computed(() => {
  return {
    transform: `translateX(-${currentIndex.value * 100}%)`
  }
})

function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function navigateToWatch(item) {
  router.push(`/watch/${item.type || 'movie'}/${item.id}`)
}

function nextSlide() {
  if (displayItems.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % displayItems.value.length
}

function prevSlide() {
  if (displayItems.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + displayItems.value.length) % displayItems.value.length
}

function startAutoPlay() {
  stopAutoPlay()
  autoPlayInterval = setInterval(nextSlide, 6000)
}

function stopAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.hero-carousel {
  position: relative;
  height: 560px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: var(--spacing-2xl);
  background: #000;
  box-shadow: 0 15px 40px rgba(0,0,0,0.6);
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-slide {
  flex: 0 0 100%;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-blur-bg {
  position: absolute;
  inset: -20px;
  background-size: cover;
  background-position: center;
  filter: blur(20px) brightness(0.35);
  z-index: 0;
}

.hero-main-bg {
  position: absolute;
  right: 0;
  top: 0;
  width: 65%;
  height: 100%;
  background-size: cover;
  background-position: center top;
  z-index: 1;
  mask-image: linear-gradient(to right, transparent 5%, black 45%);
  -webkit-mask-image: linear-gradient(to right, transparent 5%, black 45%);
}

/* Improved gradient overlay for better readability and cinematic look */
.hero__overlay {
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(
      90deg,
      rgba(10, 10, 10, 1) 0%,    /* Full black start */
      rgba(10, 10, 10, 0.95) 15%,
      rgba(10, 10, 10, 0.7) 40%,
      rgba(10, 10, 10, 0.2) 70%,
      transparent 100%
    ),
    linear-gradient(
      to top,
      rgba(10, 10, 10, 0.9) 0%,
      rgba(10, 10, 10, 0.4) 20%,
      transparent 50%
    );
  z-index: 2;
}

.hero__content {
  position: relative;
  z-index: 3;
  padding: 0 60px;
  max-width: 700px;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.6s ease 0.4s;
}

.hero-slide.active .hero__content {
  opacity: 1;
  transform: translateX(0);
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--accent-primary);
  color: #000;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 6px;
  margin-bottom: 20px;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 5px rgba(0, 212, 170, 0.3); }
  50% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.5); }
}

.hero__title {
  font-size: 52px;
  font-weight: 900;
  margin-bottom: 15px;
  line-height: 1.08;
  color: #fff;
  text-wrap: balance;
  text-shadow: 0 2px 10px rgba(0,0,0,0.7), 0 4px 30px rgba(0,0,0,0.5);
  letter-spacing: -0.5px;
}

.hero__description {
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.7;
  margin-bottom: 25px;
  font-size: 15px;
  max-width: 480px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}

.hero__meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 30px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.meta-divider {
  color: rgba(255,255,255,0.3);
  font-size: 14px;
  font-weight: 300;
}

.meta-item i { color: var(--accent-primary); }
.meta-item.rating i { color: #f1c40f; }

.meta-item.type {
  padding: 3px 10px;
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 4px;
  font-size: 10px;
  letter-spacing: 1px;
}

.hero__actions {
  display: flex;
  gap: 15px;
}

.hero-btn-watch {
  padding: 14px 34px;
  font-weight: 700;
  font-size: 15px;
  border-radius: 12px;
}

.hero-btn-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  padding: 14px 28px;
  font-size: 15px;
  border-radius: 12px;
}
.hero-btn-info:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

/* Navigation Buttons - Premium Glassy Look */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  font-size: 18px;
}

.hero-carousel:hover .carousel-nav {
  opacity: 1;
}

.carousel-nav:hover {
  background: var(--accent-primary);
  color: #000;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 0 30px rgba(0, 212, 170, 0.4);
  border-color: var(--accent-primary);
}

.carousel-nav.prev { left: 30px; }
.carousel-nav.next { right: 30px; }

/* Carousel Indicators - Enhanced with progress bar */
.carousel-indicators {
  position: absolute;
  bottom: 28px;
  left: 60px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.carousel-indicators button {
  width: 36px;
  height: 4px;
  border-radius: 4px;
  border: none;
  background: rgba(255,255,255,0.25);
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.carousel-indicators button:hover {
  background: rgba(255,255,255,0.45);
}

.carousel-indicators button.active {
  background: rgba(255,255,255,0.2);
  width: 56px;
}

.indicator-progress {
  position: absolute;
  inset: 0;
  background: var(--accent-primary);
  border-radius: 4px;
  animation: indicatorFill 6s linear forwards;
}

@keyframes indicatorFill {
  from { width: 0; }
  to { width: 100%; }
}

@media (max-width: 1024px) {
  .hero-main-bg { width: 100%; mask-image: none; -webkit-mask-image: none; opacity: 0.5; }
  .hero__content { padding: 0 40px; }
  .hero__title { font-size: 40px; }
  .nav-btn { opacity: 1; }
}

@media (max-width: 768px) {
  .hero-carousel { height: 480px; border-radius: 0; margin-left: -20px; margin-right: -20px; }
  .hero__title { font-size: 32px; }
  .hero__description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 14px; }
  .carousel-indicators { left: 40px; bottom: 20px; }
  .nav-btn { display: none; }
  .hero__content { padding: 0 24px; }
  .hero-btn-watch, .hero-btn-info { padding: 12px 20px; font-size: 13px; }
}
</style>
