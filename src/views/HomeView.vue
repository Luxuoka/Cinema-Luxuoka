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
      </div>

      <!-- SKELETON SLIDERS -->
      <div v-if="initialLoading || filtering" class="sliders-skeleton">
        <!-- CONTINUE WATCHING SKELETON -->
        <div v-if="userState.isLoggedIn" class="skeleton-section">
          <div class="skeleton-title shimmer-bg"></div>
          <div class="skeleton-row">
            <div v-for="j in 4" :key="j" class="skeleton-card shimmer-bg" style="min-width:260px"></div>
          </div>
        </div>

        <div v-for="i in 3" :key="i" class="skeleton-section">
          <div class="skeleton-title shimmer-bg"></div>
          <div class="skeleton-row">
            <div v-for="j in 6" :key="j" class="skeleton-card shimmer-bg"></div>
          </div>
        </div>
      </div>


      <template v-else>
        <!-- CONTINUE WATCHING SECTION -->
        <div v-if="userState.isLoggedIn && (watchHistory.length > 0 || userState.historyLoading) && activeFilter === 'all'" class="section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-play" style="color:var(--accent);margin-right:8px;font-size:14px"></i> 
              Lanjutkan Menonton
              <i v-if="userState.historyLoading" class="fas fa-spinner fa-spin" style="font-size:12px;margin-left:8px;opacity:.5"></i>
            </div>
          </div>
          
          <div v-if="userState.historyLoading && watchHistory.length === 0" class="cards-scroll">
             <div v-for="j in 4" :key="j" class="skeleton-card shimmer-bg" style="min-width:260px;height:140px"></div>
          </div>

          <div v-else class="cards-scroll">
            <router-link
              v-for="item in watchHistory.slice(0, 10)"
              :key="item.id"
              :to="`/watch/${item.type}/${item.id}`"
              class="cw-card"
              style="text-decoration:none"
            >
              <div class="cw-thumb">
                <img v-if="item.poster" :src="item.poster" :alt="item.title" style="width:100%;height:100%;object-fit:cover"/>
                <div v-else class="cw-emoji">🎬</div>
                <div class="cw-play-overlay">
                  <div class="cw-play-btn"><svg width="24" height="24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>
                </div>
              </div>
              <div class="cw-info">
                <div class="cw-title">{{ item.title }}</div>
                <div class="cw-ep" v-if="item.episode">Episode {{ item.episode }}</div>
                <div class="cw-ep" v-else>Film</div>
              </div>
            </router-link>
          </div>
        </div>
        <!-- FILTERED OR DEFAULT SECTIONS -->
        <template v-if="activeFilter !== 'all'">
          <ContentSlider
            v-if="filteredMovies.length > 0"
            :title="`${activeFilterLabel} Movies`"
            :items="filteredMovies"
          />
          <ContentSlider
            v-if="filteredSeries.length > 0"
            :title="`${activeFilterLabel} TV Series`"
            :items="filteredSeries"
          />
          <div v-if="filteredMovies.length === 0 && filteredSeries.length === 0" class="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p>Tidak ada hasil untuk "{{ activeFilterLabel }}"</p>
          </div>
        </template>

        <template v-else>
          <div v-if="!userState.isLoggedIn" class="login-banner-home">
            <div class="lb-content">
              <h2>Ingin Pengalaman Lebih Seru?</h2>
              <p>Login sekarang untuk menyimpan favorit Anda, riwayat tontonan, dan mendapatkan rekomendasi yang pas buat Anda!</p>
              <button @click="loginUser" class="btn btn-primary lb-btn">Login dengan Google</button>
            </div>
          </div>

          <!-- RECOMMENDATIONS -->
          <ContentSlider
            v-if="recommendations.length > 0"
            title="Rekomendasi untuk Kamu"
            :subtitle="recommendationContext"
            :items="recommendations"
          />

          <!-- TRENDING MOVIES -->
          <ContentSlider
            title="🔥 Trending"
            subtitle="— minggu ini"
            :items="trendingMovies"
          />

          <!-- NEW RELEASES -->
          <ContentSlider
            title="✨ Baru Ditambahkan"
            :items="newReleases"
          />

          <!-- TOP 10 RANKING -->
          <div class="section top-10-section">
            <div class="section-header">
              <div class="section-title">🏆 Top 10 Pekan Ini</div>
            </div>
            <div class="top-10-scroll">
              <router-link 
                v-for="(item, index) in trendingMovies.slice(0, 10)" 
                :key="item.id"
                :to="`/watch/${item.type || 'movie'}/${item.id}`"
                class="top-10-card"
              >
                <div class="rank-number">{{ index + 1 }}</div>
                <div class="rank-poster">
                  <img :src="item.poster" :alt="item.title" />
                </div>
              </router-link>
            </div>
          </div>

          <!-- TRENDING SERIES -->
          <ContentSlider
            v-if="trendingSeries.length > 0"
            title="📺 Trending TV Shows"
            :items="trendingSeries"
          />

          <!-- TRENDING ANIME -->
          <ContentSlider
            v-if="trendingAnime.length > 0"
            title="⚡ Trending Anime"
            :items="trendingAnime"
          />
        </template>

        <!-- GENRE GRID -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">Jelajahi Genre</div>
          </div>
          <div class="genre-grid">
            <div
              v-for="genre in genres"
              :key="genre.label"
              class="genre-card"
              :style="{ background: genre.bg }"
              @click="setFilter(genre.filter)"
            >
              <span class="genre-emoji">{{ genre.emoji }}</span>
              {{ genre.label }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- FOOTER -->
    <AppFooter @open-auth="openAuth" />
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted } from 'vue'
import HeroSection from '../components/HeroSection.vue'
import ContentSlider from '../components/ContentSlider.vue'
import AppFooter from '../components/AppFooter.vue'
import {
  getTrendingMovies,
  getTrendingSeries,
  getNowPlayingMovies,
  discoverMovies,
  discoverSeries
} from '../services/api'
import { getTrendingAnime } from '../services/animeApi'
import { getPersonalizedRecommendations } from '../services/recommendations'
import { 
  watchlist, 
  watchHistory, 
  userState, 
  loginUser,
  initTheme 
} from '../stores/userStore'

const showToast = inject('toast', null)

const trendingMovies = ref([])
const trendingSeries = ref([])
const trendingAnime = ref([])
const newReleases = ref([])
const featuredItems = ref([])
const recommendations = ref([])
const initialLoading = ref(true)
const filtering = ref(false)
const filteredMovies = ref([])
const filteredSeries = ref([])
const activeFilter = ref('all')

const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Action', value: 'action' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Drama', value: 'drama' },
  { label: 'Horror', value: 'horror' },
  { label: 'Sci-Fi', value: 'scifi' },
  { label: 'Anime', value: 'anime' },
  { label: '2024', value: '2024' },
  { label: 'Top Rated', value: 'top' },
]

const genres = [
  { emoji: '💥', label: 'Action', filter: 'action', bg: 'linear-gradient(135deg,rgba(232,54,79,.12),rgba(232,54,79,.04))' },
  { emoji: '😂', label: 'Comedy', filter: 'comedy', bg: 'linear-gradient(135deg,rgba(245,200,66,.12),rgba(245,200,66,.04))' },
  { emoji: '🎭', label: 'Drama', filter: 'drama', bg: 'linear-gradient(135deg,rgba(74,158,255,.12),rgba(74,158,255,.04))' },
  { emoji: '👻', label: 'Horror', filter: 'horror', bg: 'linear-gradient(135deg,rgba(139,92,246,.12),rgba(139,92,246,.04))' },
  { emoji: '🚀', label: 'Sci-Fi', filter: 'scifi', bg: 'linear-gradient(135deg,rgba(6,182,212,.12),rgba(6,182,212,.04))' },
  { emoji: '⚔️', label: 'Anime', filter: 'anime', bg: 'linear-gradient(135deg,rgba(46,204,130,.12),rgba(46,204,130,.04))' },
  { emoji: '❤️', label: 'Romance', filter: 'romance', bg: 'linear-gradient(135deg,rgba(249,124,22,.12),rgba(249,124,22,.04))' },
  { emoji: '🔍', label: 'Thriller', filter: 'thriller', bg: 'linear-gradient(135deg,rgba(153,153,255,.12),rgba(153,153,255,.04))' },
]

const continueWatching = []

const genreMap = { action: 28, comedy: 35, drama: 18, horror: 27, scifi: 878 }

const activeFilterLabel = computed(() => {
  const f = filters.find(f => f.value === activeFilter.value)
  return f ? f.label : ''
})

const recommendationContext = computed(() => {
  if (watchlist.length > 0) {
    const last = watchlist[watchlist.length - 1]
    return `— Karena kamu menambahkan "${last.title}"`
  }
  return '— Dipilih khusus untuk kamu'
})

function openAuth() {
  // Emit to App.vue via provide/inject or event bus
  // For now we use a global event
  window.dispatchEvent(new CustomEvent('open-auth'))
}

async function loadContent() {
  if (activeFilter.value === 'all') {
    initialLoading.value = true
    try {
      const [movies, series, anime, newMovies, recs] = await Promise.all([
        getTrendingMovies(),
        getTrendingSeries(),
        getTrendingAnime(15),
        getNowPlayingMovies(),
        getPersonalizedRecommendations(15)
      ])
      trendingMovies.value = movies
      trendingSeries.value = series
      trendingAnime.value = anime
      newReleases.value = newMovies
      recommendations.value = recs || []
      const source = newMovies.length > 0 ? newMovies : movies
      featuredItems.value = source.filter(m => m.poster || m.backdrop).slice(0, 8)
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
    else if (filter === '2024') params.year = '2024'
    else if (filter === 'top') params.sortBy = 'vote_average'
    const [movies, series] = await Promise.all([
      discoverMovies(params),
      discoverSeries(params)
    ])
    filteredMovies.value = movies
    filteredSeries.value = series
  } catch (err) {
    console.error('Filter failed:', err)
  } finally {
    filtering.value = false
  }
}

function setFilter(value) {
  activeFilter.value = value
}

watch(activeFilter, () => loadContent())

onMounted(() => {
  loadContent()
  // Listen for auth event from footer
  window.addEventListener('open-auth', () => {
    window.dispatchEvent(new CustomEvent('cinema-open-auth'))
  })
})
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
  gap: 40px;
  overflow-x: auto;
  padding: 20px var(--spacing-md);
  scrollbar-width: none;
}
.top-10-scroll::-webkit-scrollbar { display: none; }

.top-10-card {
  display: flex;
  align-items: flex-end;
  position: relative;
  min-width: 220px;
  height: 250px;
  text-decoration: none;
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
