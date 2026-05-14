<template>
  <div class="section">
    <!-- SECTION HEADER -->
    <div class="section-header">
      <div class="section-title">
        <span v-if="titleAccent" class="title-serif">{{ titleAccent }}</span>
        <span v-if="titleAccent"> {{ titleRest }}</span>
        <span v-else>{{ title }}</span>
        <span v-if="subtitle" class="section-sub">{{ subtitle }}</span>
      </div>
      <div class="section-nav">
        <button class="section-nav-btn" @click="scroll('left')" :disabled="isStart" aria-label="Prev">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        <button class="section-nav-btn" @click="scroll('right')" :disabled="isEnd" aria-label="Next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- CARDS TRACK -->
    <div class="cards-scroll" ref="track" @scroll="checkScroll">
      <ContentCard v-for="item in items" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ContentCard from './ContentCard.vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
  ,
  items: { type: Array, default: () => [] }
})

const track = ref(null)
const isStart = ref(true)
const isEnd = ref(false)

// Parse title for serif accent (e.g. "Rekomendasi untuk Kamu" → "Rekomendasi" in serif)
const titleAccent = computed(() => {
  const firstWord = props.title.split(' ')[0]
  // Only italicize if the title has more than 1 word
  if (props.title.split(' ').length > 1) return firstWord
  return ''
})

const titleRest = computed(() => {
  const words = props.title.split(' ')
  return words.slice(1).join(' ')
})

function scroll(dir) {
  if (!track.value) return
  const amount = track.value.clientWidth * 0.75
  track.value.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
}

function checkScroll() {
  if (!track.value) return
  const { scrollLeft, scrollWidth, clientWidth } = track.value
  isStart.value = scrollLeft <= 0
  isEnd.value = Math.ceil(scrollLeft + clientWidth) >= scrollWidth
}

onMounted(() => checkScroll())
</script>

<style scoped>
.section {
  margin-bottom: 36px;
}

/* HEADER */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 2px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text);
}

.title-serif {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--accent);
}

.section-sub {
  font-size: 12px;
  color: var(--text3);
  font-weight: 400;
  margin-left: 4px;
}

/* NAV BUTTONS */
.section-nav {
  display: flex;
  gap: 6px;
}

.section-nav-btn {
  width: 32px;
  height: 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text2);
  transition: all 0.2s;
}

.section-nav-btn:hover:not(:disabled) {
  background: var(--accent);
  color: #fff;
  border-color: transparent;
}

.section-nav-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* CARDS SCROLL */
.cards-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.cards-scroll::-webkit-scrollbar {
  display: none;
}
</style>
