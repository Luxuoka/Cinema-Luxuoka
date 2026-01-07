<template>
  <section class="hero-carousel">
    <div class="carousel-track" :style="trackStyle">
      <div 
        v-for="(item, index) in items" 
        :key="item.id" 
        class="hero-slide"
        :class="{ active: index === currentIndex }"
        :style="{ backgroundImage: `url(${item.poster})` }"
      >
        <div class="hero__overlay"></div>
        
        <div class="hero__content">
          <div class="hero__badge" v-if="index === currentIndex">
            <i class="fas fa-fire"></i>
            New Release
          </div>
          
          <h1 class="hero__title">{{ item.title }}</h1>
          
          <p v-if="item.synopsis" class="hero__description">
            {{ truncateText(item.synopsis, 200) }}
          </p>
          
          <div class="hero__meta">
            <span v-if="item.rating" class="meta-item">
              <i class="fas fa-star"></i>
              {{ item.rating }}
            </span>
            <span v-if="item.year" class="meta-item">
              <i class="fas fa-calendar"></i>
              {{ item.year }}
            </span>
            <span v-if="item.genres?.length" class="meta-item">
              <i class="fas fa-tags"></i>
              {{ item.genres.slice(0, 3).join(', ') }}
            </span>
          </div>
          
          <div class="hero__actions">
            <router-link 
              :to="`/watch/${item.type || 'movie'}/${item.id}`" 
              class="btn btn-primary"
            >
              <i class="fas fa-play"></i>
              Watch Now
            </router-link>
            <button class="btn btn-secondary" @click="navigateToWatch(item)">
              <i class="fas fa-info-circle"></i>
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <button class="nav-btn prev" @click="prevSlide" v-if="items.length > 1">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button class="nav-btn next" @click="nextSlide" v-if="items.length > 1">
      <i class="fas fa-chevron-right"></i>
    </button>

    <!-- Indicators -->
    <div class="carousel-indicators" v-if="items.length > 1">
      <button 
        v-for="(item, index) in items.slice(0, 5)" 
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

// Only show first 5 items in carousel to keep it performant
const displayItems = computed(() => props.items.slice(0, 5))

// Simple translation logic: show only current slide? 
// Or actual slider? Let's do a crossfade/absolute position stack or simple flex translate.
// For the requested "peek" effect (visualized in mind), standard full-width slider is safer first. 
// Adding transition-group or simple style binding.
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
  currentIndex.value = (currentIndex.value + 1) % displayItems.value.length
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + displayItems.value.length) % displayItems.value.length
}

function startAutoPlay() {
  stopAutoPlay()
  autoPlayInterval = setInterval(nextSlide, 8000) // 8 seconds per slide
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
  height: 500px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: var(--spacing-2xl);
  background: var(--bg-tertiary);
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.hero-slide {
  flex: 0 0 100%; /* Full width slides */
  position: relative;
  background-size: cover;
  background-position: center top;
  display: flex;
  align-items: center; /* Center content vertically */
}

/* Specific styling for slide content similar to previous Hero */
.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(10, 10, 15, 0.95) 0%,
    rgba(10, 10, 15, 0.6) 50%,
    rgba(10, 10, 15, 0.2) 100%
  );
  z-index: 1;
}

.hero__content {
  position: relative;
  z-index: 2;
  padding: var(--spacing-2xl);
  max-width: 600px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease 0.3s; /* Delay content appearance */
}

.hero-slide.active .hero__content {
  opacity: 1;
  transform: translateY(0);
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--accent-red-gradient);
  color: white;
  font-size: var(--font-xs);
  font-weight: 700;
  text-transform: uppercase;
  border-radius: var(--radius-md);
  width: fit-content;
  margin-bottom: var(--spacing-md);
}

.hero__title {
  font-size: var(--font-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.hero__description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.meta-item i {
  color: var(--accent-primary);
}

.hero__actions {
  display: flex;
  gap: var(--spacing-md);
}

/* Navigation Buttons */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all var(--transition-normal);
  backdrop-filter: blur(4px);
}

.nav-btn:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.prev { left: var(--spacing-lg); }
.next { right: var(--spacing-lg); }

/* Indicators */
.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  z-index: 10;
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.3s;
}

.carousel-indicators button.active {
  background: var(--accent-primary);
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .hero-carousel {
    height: 400px;
  }
  
  .hero__content {
    padding: var(--spacing-lg);
    max-width: 100%;
    margin-top: auto; /* Push content down on mobile */
  }
  
  .hero__title {
    font-size: var(--font-xl);
  }
  
  .hero__description {
    display: none;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
  }

  .hero__actions .btn {
    padding: var(--spacing-sm);
    font-size: var(--font-sm);
  }
}
</style>
