<template>
  <div class="drama-country-view">
    <!-- HERO -->
    <div class="hero-wrapper">
      <div v-if="heroLoading" class="skeleton-hero shimmer-bg"></div>
      <DramaHero v-else-if="heroDramas.length" :items="heroDramas" />
    </div>

    <!-- CONTENT AREA -->
    <div class="content-area">
      <div class="country-header">
        <h1>{{ countryInfo.label }}</h1>
        <p class="subtitle">Koleksi drama terbaik dari {{ countryInfo.originName }}</p>
      </div>

      <!-- FILTER COMPONENT -->
      <DramaFilter @filter-change="handleFilterChange" />

      <!-- LOADING STATE (Initial Page) -->
      <div v-if="loading && dramas.length === 0" class="loading-state">
        <div class="content-grid">
          <div v-for="i in 12" :key="i" class="skeleton-card shimmer-bg"></div>
        </div>
      </div>

      <!-- DRAMAS GRID -->
      <template v-else-if="dramas.length > 0">
        <div class="content-grid">
          <DramaCard v-for="item in dramas" :key="item.id" :item="item" />
        </div>

        <!-- INFINITE SCROLL / LOAD MORE TRIGGER -->
        <div ref="loadMoreTrigger" class="load-more-section">
          <div v-if="loadingMore" class="loading-more-spinner">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            <span>Memuat lebih banyak drama...</span>
          </div>
          <p v-else-if="page >= totalPages" class="end-message">Kamu telah melihat semua drama.</p>
        </div>
      </template>

      <!-- NO RESULTS -->
      <div v-else class="no-results">
        <svg class="no-results-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h3>Tidak ada drama ditemukan</h3>
        <p>Coba sesuaikan filter pencarian atau status kamu.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import DramaHero from '../components/DramaHero.vue'
import DramaCard from '../components/DramaCard.vue'
import DramaFilter from '../components/DramaFilter.vue'
import { getDramaByCountry, DRAMA_COUNTRIES, discoverDramaByLanguage, searchDrama } from '../services/dramaApi'

const props = defineProps({
  country: {
    type: String,
    required: true
  }
})

const route = useRoute()

const dramas = ref([])
const heroDramas = ref([])
const loading = ref(true)
const heroLoading = ref(true)
const loadingMore = ref(false)

const page = ref(1)
const totalPages = ref(1)
const activeFilters = ref({
  query: '',
  status: '',
  year: '',
  sortBy: 'popularity',
  genre: ''
})

const loadMoreTrigger = ref(null)
let observer = null

const countryInfo = computed(() => {
  const c = props.country.toLowerCase();
  if (c === 'korea') return { label: 'Drama Korea', originName: 'Korea Selatan', code: 'ko' };
  if (c === 'china') return { label: 'Drama China', originName: 'Tiongkok', code: 'zh' };
  if (c === 'jepang') return { label: 'Drama Jepang', originName: 'Jepang', code: 'ja' };
  if (c === 'thailand') return { label: 'Drama Thailand', originName: 'Thailand', code: 'th' };
  return { label: 'Drama Asia', originName: 'Asia', code: 'ko' };
})

function getCountryCode(slug) {
  const c = slug.toLowerCase();
  if (c === 'korea') return 'ko';
  if (c === 'china') return 'zh';
  if (c === 'jepang') return 'ja';
  if (c === 'thailand') return 'th';
  return 'ko';
}

async function loadHeroDramas() {
  heroLoading.value = true
  try {
    const code = getCountryCode(props.country)
    const result = await discoverDramaByLanguage(code, 1, { sortBy: 'popularity' })
    heroDramas.value = result.results.slice(0, 5)
  } catch (error) {
    console.error('Failed to load country hero dramas:', error)
  } finally {
    heroLoading.value = false
  }
}

async function loadDramas(append = false) {
  if (!append) {
    loading.value = true
    page.value = 1
  } else {
    loadingMore.value = true
  }

  try {
    const code = getCountryCode(props.country)
    let results = []
    let tPages = 1

    if (activeFilters.value.query.trim()) {
      // Search
      const searchRes = await searchDrama(activeFilters.value.query.trim(), code)
      results = searchRes
      tPages = 1
    } else {
      // Discover
      const discoverRes = await discoverDramaByLanguage(code, page.value, activeFilters.value)
      results = discoverRes.results
      tPages = discoverRes.totalPages
    }

    if (append) {
      dramas.value = [...dramas.value, ...results]
    } else {
      dramas.value = results
    }
    totalPages.value = tPages
  } catch (error) {
    console.error('Failed to load dramas:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function handleFilterChange(newFilters) {
  activeFilters.value = newFilters
  loadDramas(false)
}

function setupIntersectionObserver() {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting && !loading.value && !loadingMore.value && page.value < totalPages.value) {
      page.value++
      loadDramas(true)
    }
  }, {
    rootMargin: '150px'
  })

  nextTick(() => {
    if (loadMoreTrigger.value) {
      observer.observe(loadMoreTrigger.value)
    }
  })
}

// Watch country change to reset all states and load new data
watch(() => props.country, (newVal) => {
  dramas.value = []
  heroDramas.value = []
  page.value = 1
  loadHeroDramas()
  loadDramas(false).then(() => {
    setupIntersectionObserver()
  })
})

onMounted(() => {
  loadHeroDramas()
  loadDramas(false).then(() => {
    setupIntersectionObserver()
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.drama-country-view {
  min-height: 100vh;
  padding-bottom: 50px;
  animation: fadeIn 0.4s ease;
}

.hero-wrapper {
  margin-top: -20px;
}

.skeleton-hero {
  height: 460px;
  border-radius: 20px;
  margin-bottom: 28px;
}

.content-area {
  padding: 0 4px;
}

.country-header {
  margin-bottom: 24px;
}

.country-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text3);
  font-size: 14px;
}

/* SKELETONS */
.skeleton-card {
  height: 230px;
  border-radius: var(--radius-sm);
}

.shimmer-bg {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 75%
  );
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* DRAMAS GRID */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

/* INFINITE SCROLL SPINNER */
.load-more-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  min-height: 60px;
  width: 100%;
}

.loading-more-spinner {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text3);
  font-size: 13px;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 24px;
  height: 24px;
}

.spinner .path {
  stroke: var(--accent);
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.end-message {
  color: var(--text3);
  font-size: 13px;
  opacity: 0.7;
}

/* NO RESULTS */
.no-results {
  padding: 60px;
  text-align: center;
  color: var(--text3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-results-icon {
  opacity: 0.3;
  margin-bottom: 10px;
}

.no-results h3 {
  color: var(--text);
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .hero-wrapper {
    margin-top: 0;
  }
  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
