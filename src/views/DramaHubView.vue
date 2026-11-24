<template>
  <div class="drama-hub-view">
    <!-- HERO -->
    <div class="hero-wrapper">
      <div v-if="initialLoading" class="skeleton-hero shimmer-bg"></div>
      <DramaHero v-else-if="featuredDramas.length" :items="featuredDramas" />
    </div>

    <!-- CONTENT AREA -->
    <div class="content-area">
      <!-- SKELETON LOADERS -->
      <div v-if="initialLoading" class="sliders-skeleton">
        <div v-for="i in 4" :key="i" class="skeleton-section">
          <div class="skeleton-title shimmer-bg"></div>
          <div class="skeleton-row">
            <div v-for="j in 6" :key="j" class="skeleton-card shimmer-bg"></div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- TRENDING DRAMA ASIA -->
        <DramaSlider
          v-if="trendingDramas.length"
          title="Trending Minggu Ini"
          subtitle="Drama Asia terpopuler saat ini"
          :items="trendingDramas"
        />

        <!-- KOREA DRAMA -->
        <div v-if="koreanDramas.length" class="section-wrapper">
          <div class="custom-section-header">
            <div class="section-title">
              <span class="title-serif">🇰🇷 Drama</span> Korea
              <span class="section-sub">Drama romantis & thriller terbaik</span>
            </div>
            <router-link to="/drama/korea" class="see-all-btn">
              Lihat Semua
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </router-link>
          </div>
          <div class="grid-8">
            <DramaCard v-for="item in koreanDramas.slice(0, 8)" :key="item.id" :item="item" />
          </div>
        </div>

        <!-- CHINA DRAMA -->
        <div v-if="chineseDramas.length" class="section-wrapper">
          <div class="custom-section-header">
            <div class="section-title">
              <span class="title-serif">🇨🇳 Drama</span> China
              <span class="section-sub">Kisah wuxia, fantasi & kolosal megah</span>
            </div>
            <router-link to="/drama/china" class="see-all-btn">
              Lihat Semua
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </router-link>
          </div>
          <div class="grid-8">
            <DramaCard v-for="item in chineseDramas.slice(0, 8)" :key="item.id" :item="item" />
          </div>
        </div>

        <!-- NEWLY ADDED -->
        <DramaSlider
          v-if="newDramas.length"
          title="Baru Ditambahkan"
          subtitle="Drama-drama segar rilis bulan ini"
          :items="newDramas"
        />

        <!-- JEPANG DRAMA -->
        <div v-if="japaneseDramas.length" class="section-wrapper">
          <div class="custom-section-header">
            <div class="section-title">
              <span class="title-serif">🇯🇵 Drama</span> Jepang
              <span class="section-sub">Live action unik & melodrama menyentuh</span>
            </div>
            <router-link to="/drama/jepang" class="see-all-btn">
              Lihat Semua
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </router-link>
          </div>
          <div class="grid-8">
            <DramaCard v-for="item in japaneseDramas.slice(0, 8)" :key="item.id" :item="item" />
          </div>
        </div>

        <!-- THAILAND DRAMA -->
        <div v-if="thaiDramas.length" class="section-wrapper">
          <div class="custom-section-header">
            <div class="section-title">
              <span class="title-serif">🇹🇭 Drama</span> Thailand
              <span class="section-sub">Kisah seru penuh komedi & romansa manis</span>
            </div>
            <router-link to="/drama/thailand" class="see-all-btn">
              Lihat Semua
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </router-link>
          </div>
          <div class="grid-8">
            <DramaCard v-for="item in thaiDramas.slice(0, 8)" :key="item.id" :item="item" />
          </div>
        </div>

        <!-- EDITOR'S CHOICE / EDITORIAL GRID -->
        <div class="editorial-banner">
          <div class="editorial-content">
            <span class="editorial-tag">PILIHAN EDITOR</span>
            <h2>Wajib Ditonton: Fenomena Drama Terbaik</h2>
            <p>Jelajahi jajaran drama dengan rating tertinggi dan paling banyak dibicarakan yang mendefinisikan standar hiburan Asia saat ini.</p>
            <div class="editorial-links">
              <router-link to="/drama/korea" class="editorial-link-btn">Jelajahi K-Drama</router-link>
              <router-link to="/drama/china" class="editorial-link-btn out-btn">Jelajahi C-Drama</router-link>
            </div>
          </div>
          <div class="editorial-glow"></div>
        </div>
      </template>
    </div>

    <!-- FOOTER -->
    <AppFooter @open-auth="openAuth" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DramaHero from '../components/DramaHero.vue'
import DramaCard from '../components/DramaCard.vue'
import DramaSlider from '../components/DramaSlider.vue'
import AppFooter from '../components/AppFooter.vue'
import {
  getTrendingDramaAsia,
  getDramaByCountry,
  getNewDramaThisMonth
} from '../services/dramaApi'


const initialLoading = ref(true)
const featuredDramas = ref([])
const trendingDramas = ref([])
const koreanDramas = ref([])
const chineseDramas = ref([])
const japaneseDramas = ref([])
const thaiDramas = ref([])
const newDramas = ref([])

function openAuth() {
  window.dispatchEvent(new CustomEvent('open-auth'))
}

async function loadData() {
  const hasData = featuredDramas.value.length > 0
  if (!hasData) {
    initialLoading.value = true
  }

  try {
    // Stage 1: Trending & Korean Drama (powers Hero and first section)
    const [trending, korea] = await Promise.all([
      getTrendingDramaAsia().catch(() => []),
      getDramaByCountry('korea', 1).catch(() => ({ results: [] }))
    ])

    trendingDramas.value = trending || []
    koreanDramas.value = korea?.results || []

    featuredDramas.value = (trending || []).slice(0, 5)
    if (featuredDramas.value.length === 0 && koreanDramas.value.length > 0) {
      featuredDramas.value = koreanDramas.value.slice(0, 5)
    }

    initialLoading.value = false

    // Stage 2: Progressively load other countries and new dramas in parallel
    getDramaByCountry('china', 1)
      .then(res => { chineseDramas.value = res?.results || [] })
      .catch(() => {})

    getDramaByCountry('jepang', 1)
      .then(res => { japaneseDramas.value = res?.results || [] })
      .catch(() => {})

    getDramaByCountry('thailand', 1)
      .then(res => { thaiDramas.value = res?.results || [] })
      .catch(() => {})

    getNewDramaThisMonth()
      .then(res => { newDramas.value = res || [] })
      .catch(() => {})

  } catch (error) {
    console.error('Error loading Asian drama hub data:', error)
  } finally {
    initialLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.drama-hub-view {
  min-height: 100vh;
  padding-bottom: 40px;
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

/* SKELETONS */
.sliders-skeleton {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.skeleton-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-title {
  height: 24px;
  width: 200px;
  border-radius: 4px;
}

.skeleton-row {
  display: flex;
  gap: 14px;
  overflow-x: hidden;
}

.skeleton-card {
  min-width: 160px;
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

/* CUSTOM SECTION HEADERS */
.section-wrapper {
  margin-bottom: 40px;
}

.custom-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
  padding: 0 2px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
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
  margin-left: 8px;
}

.see-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
  transition: transform 0.2s, color 0.2s;
}

.see-all-btn:hover {
  transform: translateX(4px);
  color: var(--accent-light);
}

/* GRID 8 COLUMNS FOR LANDING SECTIONS */
.grid-8 {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 14px;
}

/* EDITORIAL BANNER */
.editorial-banner {
  position: relative;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(232, 54, 79, 0.15) 0%, rgba(20, 10, 15, 0.95) 100%), var(--surface2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 48px;
  overflow: hidden;
  margin: 50px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.editorial-content {
  position: relative;
  z-index: 2;
  max-width: 480px;
}

.editorial-tag {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 1.5px;
  display: inline-block;
  margin-bottom: 12px;
}

.editorial-content h2 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #fff;
  line-height: 1.2;
}

.editorial-content p {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  margin-bottom: 24px;
}

.editorial-links {
  display: flex;
  gap: 12px;
}

.editorial-link-btn {
  padding: 12px 24px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.25s;
}

.editorial-link-btn:hover {
  background: var(--accent-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(232, 54, 79, 0.3);
}

.editorial-link-btn.out-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.editorial-link-btn.out-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: none;
}

.editorial-glow {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(232, 54, 79, 0.35) 0%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
}

@media (max-width: 1200px) {
  .grid-8 {
    grid-template-columns: repeat(6, 1fr);
  }
  .grid-8 > *:nth-child(n+7) {
    display: none;
  }
}

@media (max-width: 900px) {
  .grid-8 {
    grid-template-columns: repeat(4, 1fr);
  }
  .grid-8 > *:nth-child(n+5) {
    display: none;
  }
  .editorial-banner {
    padding: 32px;
  }
  .editorial-content h2 {
    font-size: 26px;
  }
}

@media (max-width: 768px) {
  .hero-wrapper {
    margin-top: 0;
  }
  .grid-8 {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .grid-8 > *:nth-child(n+4) {
    display: none;
  }
  .editorial-banner {
    padding: 24px;
    margin: 30px 0;
  }
  .editorial-content h2 {
    font-size: 22px;
  }
  .editorial-content p {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .grid-8 {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid-8 > *:nth-child(n+3) {
    display: none;
  }
  .section-title {
    font-size: 16px;
  }
  .section-sub {
    display: none;
  }
}
</style>
