<template>
  <section class="hero" :style="heroStyle">
    <div class="hero__overlay"></div>
    
    <div class="hero__content">
      <div class="hero__badge" v-if="featured">
        <i class="fas fa-fire"></i>
        Featured
      </div>
      
      <h1 class="hero__title">{{ featured?.title || 'Loading...' }}</h1>
      
      <p v-if="featured?.synopsis" class="hero__description">
        {{ truncateText(featured.synopsis, 200) }}
      </p>
      
      <div class="hero__meta">
        <span v-if="featured?.rating" class="meta-item">
          <i class="fas fa-star"></i>
          {{ featured.rating }}
        </span>
        <span v-if="featured?.year" class="meta-item">
          <i class="fas fa-calendar"></i>
          {{ featured.year }}
        </span>
        <span v-if="featured?.genres?.length" class="meta-item">
          <i class="fas fa-tags"></i>
          {{ featured.genres.slice(0, 3).join(', ') }}
        </span>
      </div>
      
      <div class="hero__actions">
        <router-link 
          v-if="featured" 
          :to="`/watch/${featured.type}/${featured.id}`" 
          class="btn btn-primary"
        >
          <i class="fas fa-play"></i>
          Watch Now
        </router-link>
        <button class="btn btn-secondary">
          <i class="fas fa-info-circle"></i>
          More Info
        </button>
      </div>
    </div>
    
    <div v-if="featured" class="hero__play-button" @click="navigateToWatch">
      <i class="fas fa-play"></i>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  featured: {
    type: Object,
    default: null
  }
})

const router = useRouter()

const heroStyle = computed(() => {
  if (props.featured?.poster) {
    return {
      backgroundImage: `url(${props.featured.poster})`
    }
  }
  return {}
})

function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function navigateToWatch() {
  if (props.featured) {
    router.push(`/watch/${props.featured.type}/${props.featured.id}`)
  }
}
</script>

<style scoped>
.hero {
  position: relative;
  height: 450px;
  background-size: cover;
  background-position: center top;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: var(--spacing-2xl);
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(10, 10, 15, 0.95) 0%,
    rgba(10, 10, 15, 0.7) 50%,
    rgba(10, 10, 15, 0.4) 100%
  );
}

.hero__content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-2xl);
  max-width: 600px;
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
}

.hero__description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
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

.hero__play-button {
  position: absolute;
  top: 50%;
  right: 15%;
  transform: translateY(-50%);
  width: 80px;
  height: 80px;
  background: var(--accent-red-gradient);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 0 40px rgba(231, 76, 60, 0.5);
  z-index: 2;
}

.hero__play-button:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 0 60px rgba(231, 76, 60, 0.7);
}

.hero__play-button i {
  font-size: 2rem;
  margin-left: 5px;
}

@media (max-width: 768px) {
  .hero {
    height: 400px; /* Slightly taller for mobile to fit content */
    margin-bottom: var(--spacing-lg);
  }
  
  .hero__content {
    padding: var(--spacing-lg) var(--spacing-md);
    max-width: 100%;
    justify-content: flex-end; /* Push content to bottom */
  }
  
  .hero__title {
    font-size: var(--font-xl); /* Smaller title */
    margin-bottom: var(--spacing-sm);
  }
  
  .hero__play-button {
    display: none;
  }
  
  .hero__description {
    display: none; /* Hide description on mobile */
  }

  .hero__meta {
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .hero__actions {
    width: 100%;
  }

  .hero__actions .btn {
    flex: 1;
    justify-content: center;
    padding: var(--spacing-sm);
    font-size: var(--font-sm);
  }
}

@media (max-width: 480px) {
  .hero {
    height: 350px;
    border-radius: var(--radius-lg);
  }
}
</style>
