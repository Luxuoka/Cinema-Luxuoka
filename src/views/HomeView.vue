<template>
  <div class="home-view">
    <!-- HERO -->
    <div class="hero-wrapper">
      <div v-if="initialLoading" class="skeleton-hero shimmer-bg"></div>
      <HeroSection v-else :items="featuredItems" />
    </div>

    <!-- CONTENT ROW: main + right panel (right panel is in App.vue as RightSidebar) -->
    <div class="content-area">
      <!-- FILTER CHIPS -->
      <div class="filter-row" v-if="!initialLoading">
        <button
          v-for="filter in filters"
          :key="filter.label"
          class="filter-chip"
          :class="{ active: activeFilter === filter.value }"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>

        <div class="filter-divider"></div>

        <select v-model="activeYear" class="filter-select">
          <option value="">Tahun</option>
          <option v-for="year in yearFilters" :key="year" :value="year">{{ year }}</option>
        </select>

        <select v-model="activeRating" class="filter-select">
          <option value="">Rating</option>
          <option v-for="r in ratingFilters" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
      </div>

      <!-- SKELETON SLIDERS -->
      <div v-if="initialLoading || filtering" class="sliders-skeleton">
        <div v-for="i in 3" :key="i" class="skeleton-section">
          <div class="skeleton-title shimmer-bg"></div>
          <div class="skeleton-row">
            <div v-for="j in 6" :key="j" class="skeleton-card shimmer-bg"></div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- FILTERED OR DEFAULT SECTIONS -->
        <template v-if="activeFilter !== 'all'">
          <ContentSlider
            v-if="filteredMovies.length > 0"
            :title="`${activeFilterLabel} Movies`"
            :items="filteredMovies"
            show-see-more
            :has-more="categoryHasMore.filteredMovies"
            :see-more-loading="categoryLoading.filteredMovies"
            @see-more="loadMoreFiltered('movies')"
          />
          <ContentSlider
            v-if="filteredSeries.length > 0"
            :title="`${activeFilterLabel} TV Series`"
            :items="filteredSeries"
            show-see-more
            :has-more="categoryHasMore.filteredSeries"
            :see-more-loading="categoryLoading.filteredSeries"
            @see-more="loadMoreFiltered('series')"
          />
          <ContentSlider
            v-if="filteredAnime.length > 0"
            title="Anime"
            :items="filteredAnime"
            show-see-more
            :has-more="categoryHasMore.filteredAnime"
            :see-more-loading="categoryLoading.filteredAnime"
            @see-more="loadMoreFiltered('anime')"
          />
          <div v-if="filteredMovies.length === 0 && filteredSeries.length === 0 && filteredAnime.length === 0" class="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p>Tidak ada hasil untuk "{{ activeFilterLabel }}"</p>
          </div>
        </template>

        <template v-else>

          <!-- TRENDING TODAY -->
          <ContentSlider
            v-if="trendingToday.length > 0"
            title="Trending Hari Ini"
            subtitle="— paling banyak ditonton"
            :items="trendingToday"
            show-see-more
            :has-more="categoryHasMore.today"
            :see-more-loading="categoryLoading.today"
            @see-more="loadMoreCategory('today')"
          />

          <!-- RECOMMENDATIONS -->
          <ContentSlider
            v-if="recommendations.length > 0"
            title="Rekomendasi untuk Kamu"
            :subtitle="recommendationContext"
            :items="recommendations"
          />

          <!-- TRENDING MOVIES -->
          <ContentSlider
            title="Populer Minggu Ini"
            subtitle="— film pilihan"
            :items="trendingMovies"
            show-see-more
            :has-more="categoryHasMore.movies"
            :see-more-loading="categoryLoading.movies"
            @see-more="loadMoreCategory('movies')"
          />

          <!-- NEW RELEASES -->
          <ContentSlider
            title="Baru Ditambahkan"
            :items="newReleases"
          />

          <!-- TOP 10 RANKING -->
          <div class="section top-10-section">
            <div class="section-header">
              <div class="section-title">Top 10 Pekan Ini</div>
              <div class="section-nav">
                <button class="section-nav-btn" @click="scrollTop10('left')" :disabled="isTop10Start" aria-label="Prev">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                </button>
                <button class="section-nav-btn" @click="scrollTop10('right')" :disabled="isTop10End" aria-label="Next">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="top-10-scroll" ref="top10Track" @scroll="checkTop10Scroll">
              <router-link 
                v-for="(item, index) in trendingMovies.slice(0, 10)" 
                :key="item.id"
                :to="`/watch/${item.type || 'movie'}/${item.id}`"
                class="top-10-card"
              >
                <div class="rank-number">{{ index + 1 }}</div>
                <div class="rank-poster">
                  <img :src="item.poster" :alt="item.title" style="aspect-ratio:150/220" width="150" height="220" loading="lazy" decoding="async" />
                </div>
              </router-link>
            </div>
          </div>

          <!-- TRENDING SERIES -->
          <ContentSlider
            v-if="trendingSeries.length > 0"
            title="Trending TV Shows"
            :items="trendingSeries"
          />

          <!-- TRENDING ANIME -->
          <ContentSlider
            v-if="trendingAnime.length > 0"
            title="Trending Anime"
            :items="trendingAnime"
          />

          <!-- DRAMA KOREA -->
          <DramaSlider
            v-if="homeKDramas.length > 0"
            title="🇰🇷 Drama Korea Terpopuler"
            subtitle="— paling romantis & menegangkan"
            :items="homeKDramas"
          />

          <!-- DRAMA CHINA -->
          <DramaSlider
            v-if="homeCDramas.length > 0"
            title="🇨🇳 Drama China Trending"
            subtitle="— fantasi & kolosal legendaris"
            :items="homeCDramas"
          />
        </template>


      </template>
    </div>

    <!-- FOOTER -->
    <AppFooter @open-auth="openAuth" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import HeroSection from '../components/HeroSection.vue'
import ContentSlider from '../components/ContentSlider.vue'
import AppFooter from '../components/AppFooter.vue'
import {
  getTrendingMovies,
  getTrendingSeries,
  getNowPlayingMovies,
  discoverMovies,
  discoverSeries,
  getTrendingToday
} from '../services/api'
import { getTrendingAnime } from '../services/animeApi'
import { getPersonalizedRecommendations } from '../services/recommendations'
import DramaSlider from '../components/DramaSlider.vue'
import { getDramaByCountry } from '../services/dramaApi'


const trendingMovies = ref([])
const trendingSeries = ref([])
const trendingAnime = ref([])
const trendingToday = ref([])
const newReleases = ref([])
const featuredItems = ref([])
const recommendations = ref([])
const initialLoading = ref(true)
const filtering = ref(false)
const filteredMovies = ref([])
const filteredSeries = ref([])
const activeFilter = ref('all')
const activeYear = ref('')
const activeRating = ref('')
const homeKDramas = ref([])
const homeCDramas = ref([])

const categoryHasMore = ref({
  filteredMovies: false,
  filteredSeries: false,
  filteredAnime: false,
  today: false,
  movies: false
})

const categoryLoading = ref({
  filteredMovies: false,
  filteredSeries: false,
  filteredAnime: false,
  today: false,
  movies: false
})

const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Action', value: 'action' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Drama', value: 'drama' },
  { label: 'Horror', value: 'horror' },
  { label: 'Sci-Fi', value: 'scifi' },
  { label: 'Anime', value: 'anime' },
  { label: 'Top Rated', value: 'top' },
]

const yearFilters = ['2025', '2024', '2023', '2022', '2021', '2020']
const ratingFilters = [
  { label: '⭐ 8+', value: '8' },
  { label: '⭐ 7+', value: '7' },
  { label: '⭐ 6+', value: '6' }
]



const continueWatching = []

const genreMap = { action: 28, comedy: 35, drama: 18, horror: 27, scifi: 878 }

const activeFilterLabel = computed(() => {
  const f = filters.find(f => f.value === activeFilter.value)
  return f ? f.label : ''
})

const recommendationContext = computed(() => '— Dipilih khusus untuk kamu')

function openAuth() {
  // Emit to App.vue via provide/inject or event bus
  // For now we use a global event
  window.dispatchEvent(new CustomEvent('open-auth'))
}

async function loadContent() {
  if (activeFilter.value === 'all') {
    const hasExistingData = featuredItems.value.length > 0 || trendingMovies.value.length > 0
    if (!hasExistingData) {
      initialLoading.value = true
    }

    try {
      // STAGE 1: Above-the-fold critical content (Hero, Trending Today, Popular Movies, New Releases)
      // Fast TMDB requests: resolves in ~150-250ms (or 0ms if cached in sessionStorage)
      const [movies, today, newMovies] = await Promise.all([
        getTrendingMovies().catch(err => { console.error('Error loading trending movies:', err); return []; }),
        getTrendingToday().catch(err => { console.error('Error loading trending today:', err); return []; }),
        getNowPlayingMovies().catch(err => { console.error('Error loading now playing movies:', err); return []; })
      ])

      trendingMovies.value = movies || []
      trendingToday.value = today || []
      newReleases.value = newMovies || []

      const source = (newMovies && newMovies.length > 0) ? newMovies : (movies || [])
      featuredItems.value = source.filter(m => m.poster || m.backdrop).slice(0, 8)

      // Instantly reveal Hero & Top content to eliminate loading wait!
      initialLoading.value = false

      // STAGE 2: Progressively load remaining below-the-fold sections in parallel (non-blocking)
      getTrendingSeries()
        .then(series => { trendingSeries.value = series || [] })
        .catch(err => console.error('Error loading trending series:', err))

      getPersonalizedRecommendations(15)
        .then(recs => { recommendations.value = recs || [] })
        .catch(err => console.error('Error loading recommendations:', err))

      getDramaByCountry('korea', 1)
        .then(kdrama => { homeKDramas.value = kdrama.results || [] })
        .catch(err => console.error('Error loading K-dramas:', err))

      getDramaByCountry('china', 1)
        .then(cdrama => { homeCDramas.value = cdrama.results || [] })
        .catch(err => console.error('Error loading C-dramas:', err))

      getTrendingAnime(15)
        .then(anime => { trendingAnime.value = anime || [] })
        .catch(err => console.error('Error loading trending anime:', err))

    } catch (err) {
      console.error('Initial load failed:', err)
    } finally {
      initialLoading.value = false
    }
    return
  }

  filtering.value = true
  try {
    const filter = activeFilter.value
    let params = {}
    if (genreMap[filter]) params.genre = genreMap[filter]
    else if (filter === 'top') params.sortBy = 'vote_average'
    
    if (activeYear.value) params.year = activeYear.value
    if (activeRating.value) params.ratingGte = activeRating.value

    const [moviesRes, seriesRes] = await Promise.all([
      discoverMovies(params),
      discoverSeries(params)
    ])
    filteredMovies.value = moviesRes.results || []
    filteredSeries.value = seriesRes.results || []
  } catch (err) {
    console.error('Filter failed:', err)
  } finally {
    filtering.value = false
  }
}

function setFilter(value) {
  activeFilter.value = value
  if (value === 'all') {
    activeYear.value = ''
    activeRating.value = ''
  }
}

watch([activeFilter, activeYear, activeRating], () => loadContent())

onMounted(() => {
  loadContent()
  // Listen for auth event from footer
  window.addEventListener('open-auth', () => {
    window.dispatchEvent(new CustomEvent('cinema-open-auth'))
  })
})

const top10Track = ref(null)
const isTop10Start = ref(true)
const isTop10End = ref(false)

function checkTop10Scroll() {
  if (!top10Track.value) return
  const { scrollLeft, scrollWidth, clientWidth } = top10Track.value
  isTop10Start.value = scrollLeft <= 0
  isTop10End.value = Math.ceil(scrollLeft + clientWidth) >= scrollWidth
}

function scrollTop10(dir) {
  if (!top10Track.value) return
  const amount = top10Track.value.clientWidth * 0.6
  top10Track.value.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  requestAnimationFrame(checkTop10Scroll)
}

watch(trendingMovies, () => nextTick(checkTop10Scroll), { flush: 'post' })
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* App.vue main-content provides the 28px padding */
  margin: -28px; /* pull hero and footer to full-width */
}

.hero-wrapper,
.content-area {
  padding: 28px;
}

.hero-wrapper {
  padding-bottom: 0;
}

/* SKELETON HERO */
.skeleton-hero {
  height: 460px;
  border-radius: 20px;
  margin-bottom: 28px;
}

/* FILTER ROW */
.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-chip {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text2);
  font-family: var(--font-body);
  font-size: 13px;
  padding: 7px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: var(--border2);
  color: var(--text);
}

.filter-chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 500;
}

.filter-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 10px;
}

.filter-select {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: var(--border2);
}

.filter-select:focus {
  border-color: var(--accent);
}

/* SKELETON SLIDERS */
.sliders-skeleton {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.skeleton-section {}

.skeleton-title {
  height: 22px;
  width: 200px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.skeleton-row {
  display: flex;
  gap: 14px;
  overflow: hidden;
}

.skeleton-card {
  min-width: 160px;
  height: 230px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

/* SECTION (shared) */
.section {
  margin-bottom: 36px;
}

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
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
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
  padding: 0;
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

.section-nav-btn svg {
  display: block;
  flex-shrink: 0;
}

/* CONTINUE WATCHING */
.cards-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.cards-scroll::-webkit-scrollbar { display: none; }

.cw-card {
  min-width: 260px;
  max-width: 260px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  scroll-snap-align: start;
  transition: all 0.25s;
}

.cw-card:hover {
  border-color: var(--border2);
  transform: translateY(-3px);
}

.cw-thumb {
  height: 140px;
  position: relative;
  overflow: hidden;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cw-emoji {
  font-size: 56px;
}

.cw-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.2s;
}

.cw-card:hover .cw-play-overlay {
  opacity: 1;
}

.cw-play-btn {
  width: 48px;
  height: 48px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cw-bar {
  height: 3px;
  background: var(--surface2);
}

.cw-progress {
  height: 100%;
  background: linear-gradient(to right, var(--accent), var(--accent2));
  border-radius: 3px;
  transition: width 0.3s;
}

.cw-info {
  padding: 12px;
}

.cw-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 3px;
  color: var(--text);
}

.cw-ep {
  font-size: 11px;
  color: var(--text3);
}

/* GENRE GRID */
.genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.genre-card {
  height: 80px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  position: relative;
  overflow: hidden;
}

.genre-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.04);
  opacity: 0;
  transition: opacity 0.2s;
}

.genre-card:hover::after {
  opacity: 1;
}

.genre-card:hover {
  transform: translateY(-2px);
  border-color: var(--border2);
  color: var(--text);
}

.genre-emoji {
  font-size: 22px;
}

/* NO RESULTS */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text3);
  text-align: center;
  gap: 16px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero-wrapper, .content-area {
    padding: 16px;
  }
  .hero-wrapper {
    padding-bottom: 0;
  }
}
.login-banner-home {
  margin: 40px var(--spacing-md);
  background: linear-gradient(135deg, rgba(232, 54, 79, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%);
  border: 1px solid rgba(232, 54, 79, 0.3);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.lb-content { position: relative; z-index: 2; }
.lb-content h2 { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
.lb-content p { color: var(--text-secondary); max-width: 600px; margin: 0 auto 24px; font-size: 15px; }
.lb-btn { padding: 12px 32px; font-weight: 700; border-radius: 30px; box-shadow: 0 10px 20px rgba(232, 54, 79, 0.3); }

/* TOP 10 STYLES */
.top-10-section { margin-bottom: 40px; }
.top-10-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 4px 24px;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.top-10-scroll::-webkit-scrollbar { display: none; }

.top-10-card {
  display: flex;
  align-items: flex-end;
  position: relative;
  min-width: 220px;
  height: 250px;
  text-decoration: none;
  flex-shrink: 0;
  scroll-snap-align: start;
}

.rank-number {
  font-size: 180px;
  font-weight: 900;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 3px rgba(255, 255, 255, 0.4);
  position: absolute;
  left: -20px;
  bottom: -20px;
  z-index: 1;
  font-family: var(--font-display);
}

.top-10-card:hover .rank-number {
  -webkit-text-stroke-color: var(--accent);
  text-shadow: 0 0 30px rgba(232, 54, 79, 0.4);
}

.rank-poster {
  width: 150px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  margin-left: 60px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transition: transform 0.3s;
  z-index: 2;
}

.top-10-card:hover .rank-poster {
  transform: translateY(-10px) scale(1.05);
}

.rank-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .login-banner-home { padding: 30px 20px; }
  .lb-content h2 { font-size: 20px; }
  .rank-number { font-size: 120px; }
  .top-10-card { min-width: 160px; height: 180px; }
  .rank-poster { width: 100px; height: 150px; margin-left: 40px; }
}
</style>
