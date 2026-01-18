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
            <span v-if="item.year" class="meta-item">
              <i class="fas fa-calendar"></i>
              {{ item.year }}
            </span>
            <span v-if="item.type" class="meta-item type">
              {{ item.type === 'series' ? 'TV SERIES' : 'MOVIE' }}
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
    <button class="nav-btn prev" @click="prevSlide" v-if="displayItems.length > 1">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button class="nav-btn next" @click="nextSlide" v-if="displayItems.length > 1">
      <i class="fas fa-chevron-right"></i>
    </button>

    <!-- Indicators -->
    <div class="carousel-indicators" v-if="displayItems.length > 1">
      <button 
        v-for="(item, index) in displayItems" 
        :key="index"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
      ></button>
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
  height: 550px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: var(--spacing-2xl);
  background: #000;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
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
  filter: blur(20px) brightness(0.4);
  z-index: 0;
}

.hero-main-bg {
  position: absolute;
  right: 0;
  top: 0;
  width: 70%;
  height: 100%;
  background-size: cover;
  background-position: center top;
  z-index: 1;
  mask-image: linear-gradient(to right, transparent, black 40%);
  -webkit-mask-image: linear-gradient(to right, transparent, black 40%);
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(10, 10, 15, 1) 0%,
    rgba(10, 10, 15, 0.8) 40%,
    rgba(10, 10, 15, 0) 100%
  ),
  linear-gradient(
    to top,
    rgba(10, 10, 15, 1) 0%,
    rgba(10, 10, 15, 0) 30%
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
  padding: 5px 12px;
  background: var(--accent-primary);
  color: #000;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 4px;
  margin-bottom: 20px;
}

.hero__title {
  font-size: 52px;
  font-weight: 800;
  margin-bottom: 15px;
  line-height: 1.1;
  color: #fff;
  text-wrap: balance;
}

.hero__description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin-bottom: 25px;
  font-size: 16px;
  max-width: 500px;
}

.hero__meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.meta-item i { color: var(--accent-primary); }
.meta-item.rating i { color: #f1c40f; }

.meta-item.type {
  padding: 2px 8px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  font-size: 10px;
}

.hero__actions {
  display: flex;
  gap: 15px;
}

.hero-btn-watch {
  padding: 12px 30px;
  font-weight: 700;
}

.hero-btn-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}
.hero-btn-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}
.nav-btn:hover { background: var(--accent-primary); color: #000; transform: translateY(-50%) scale(1.1); }
.prev { left: 20px; }
.next { right: 20px; }

.carousel-indicators {
  position: absolute;
  bottom: 30px;
  left: 60px;
  display: flex;
  gap: 10px;
  z-index: 10;
}
.carousel-indicators button {
  width: 30px;
  height: 4px;
  border-radius: 2px;
  border: none;
  background: rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.3s;
}
.carousel-indicators button.active {
  background: var(--accent-primary);
  width: 50px;
}

@media (max-width: 1024px) {
  .hero-main-bg { width: 100%; mask-image: none; opacity: 0.6; }
  .hero__content { padding: 0 40px; }
  .hero__title { font-size: 40px; }
}

@media (max-width: 768px) {
  .hero-carousel { height: 450px; border-radius: 0; margin-left: -20px; margin-right: -20px; }
  .hero__title { font-size: 32px; }
  .hero__description { display: -webkit-box; -webkit-line-clamp: 2; font-size: 14px; }
  .carousel-indicators { left: 40px; bottom: 20px; }
  .nav-btn { display: none; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
