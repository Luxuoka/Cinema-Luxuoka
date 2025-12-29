<template>
  <div class="content-slider">
    <div class="slider-header">
      <h2 class="slider-title">{{ title }}</h2>
      <div class="slider-controls">
        <button class="control-btn" @click="scroll('left')" :disabled="isStart">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="control-btn" @click="scroll('right')" :disabled="isEnd">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <div 
      class="slider-track" 
      ref="track" 
      @scroll="checkScroll"
    >
      <div v-for="item in items" :key="item.id" class="slider-item">
        <ContentCard :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ContentCard from './ContentCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  }
})

const track = ref(null)
const isStart = ref(true)
const isEnd = ref(false)

function scroll(direction) {
  if (!track.value) return
  
  const scrollAmount = track.value.clientWidth * 0.8
  const currentScroll = track.value.scrollLeft
  
  track.value.scrollTo({
    left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
    behavior: 'smooth'
  })
}

function checkScroll() {
  if (!track.value) return
  
  const { scrollLeft, scrollWidth, clientWidth } = track.value
  isStart.value = scrollLeft <= 0
  isEnd.value = Math.ceil(scrollLeft + clientWidth) >= scrollWidth
}

onMounted(() => {
  checkScroll()
})
</script>

<style scoped>
.content-slider {
  margin-bottom: var(--spacing-2xl);
  position: relative;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-xs);
}

.slider-title {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.slider-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.control-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider-track {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: var(--spacing-sm) 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  /* Fix negative margin causing overflow */
  margin: 0; 
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
}

.slider-track::-webkit-scrollbar {
  display: none;
}

.slider-item {
  flex: 0 0 auto;
  width: 200px;
  scroll-snap-align: start;
}

@media (max-width: 768px) {
  .slider-item {
    width: 150px; /* Resize for tablet */
  }
}

@media (max-width: 480px) {
  .slider-item {
    width: 130px; /* Resize for mobile */
  }
  
  .slider-title {
    font-size: var(--font-md); /* Smaller Title */
  }

  .content-slider {
    margin-bottom: var(--spacing-lg); /* Reduce vertical gap */
  }
  
  .slider-controls {
    display: none; /* Hide controls on mobile */
  }
}
</style>
