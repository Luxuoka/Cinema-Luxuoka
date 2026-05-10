<template>
  <div class="watch-view">
    <div v-if="loading" class="watch-skeleton animate-pulse-subtle">
      <div class="skeleton-player"></div>
      <div class="skeleton-info">
        <div class="skeleton-line title"></div>
        <div class="skeleton-badges"><div class="skeleton-badge"></div><div class="skeleton-badge"></div></div>
        <div class="skeleton-line synopsis mt"></div>
        <div class="skeleton-line synopsis"></div>
      </div>
    </div>

    <template v-else-if="content">
      <!-- Player Section -->
      <div v-if="tmdbId || content.trailer" class="player-section-wrapper" style="margin-bottom: 24px;">
        <div class="player-container" ref="playerContainer">
          <!-- Server Selector Bar -->
          <div class="server-selector" v-if="tmdbId">
            <div class="server-group">
              <span class="server-label">Server:</span>
              <div class="server-btns">
                <button 
                  v-for="server in servers"
                  :key="server.id"
                  :class="['server-btn', { active: selectedServer === server.id }]"
                  @click="selectedServer = server.id"
                >
                  {{ server.label }}
                </button>
              </div>
            </div>
            
            <div class="player-actions">
              <button 
                v-if="content.trailer"
                :class="['action-btn', { active: playerMode === 'trailer' }]"
                @click="playerMode = playerMode === 'trailer' ? 'stream' : 'trailer'"
              >
                <i :class="playerMode === 'trailer' ? 'fas fa-play' : 'fab fa-youtube'"></i>
                <span>{{ playerMode === 'trailer' ? 'Tonton Anime' : 'Trailer' }}</span>
              </button>
              
              <button class="action-btn" @click="toggleFullscreen" title="Fullscreen">
                <i class="fas fa-expand"></i>
                <span>Layar Penuh</span>
              </button>
            </div>
          </div>
          
          <!-- Video Player Iframe -->
          <div class="video-wrapper">
            <iframe 
              v-if="playerMode === 'stream' && tmdbId"
              :key="`stream-${currentEpisode}-${selectedServer}-${tmdbId}`"
              :src="getEmbedUrl()"
              frameborder="0"
              allowfullscreen
              webkitallowfullscreen
              mozallowfullscreen
              allow="autoplay; fullscreen; encrypted-media"
              referrerpolicy="origin"
            ></iframe>
            <iframe 
              v-else-if="playerMode === 'trailer' && content.trailer"
              :src="content.trailer.includes('?') ? content.trailer + '&autoplay=1' : content.trailer + '?autoplay=1'"
              frameborder="0"
              allowfullscreen
              allow="autoplay; fullscreen"
            ></iframe>
            <div v-else class="no-stream-fallback">
              <i class="fas fa-video-slash"></i>
              <p>Streaming tidak tersedia untuk anime ini.</p>
            </div>
          </div>

          <!-- Player Footer -->
          <div v-if="playerMode === 'stream' && tmdbId && content.episodes > 1" class="player-footer">
            <div class="current-info">
              Sedang Menonton: <span>Episode {{ currentEpisode }}</span>
            </div>
            <button 
              v-if="currentEpisode < content.episodes"
              class="btn btn-primary next-episode-btn"
              @click="nextEpisode"
            >
              Episode Selanjutnya <i class="fas fa-forward"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Anime Banner (hidden if playing stream to save space, but kept for aesthetics) -->
      <div v-if="!tmdbId || playerMode === 'trailer'" class="anime-banner" :style="bannerStyle">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <button @click="goBack" class="back-btn"><i class="fas fa-arrow-left"></i></button>
          <div class="banner-info">
            <div class="anime-badge">{{ content.mediaType || 'ANIME' }}</div>
            <h1>{{ content.title }}</h1>
            <p v-if="content.titleJapanese" class="jp-title">{{ content.titleJapanese }}</p>
          </div>
        </div>
      </div>

      <!-- Content Info -->
      <div class="watch-content-layout">
        <div class="main-info">
          <div class="header-row">
            <div class="title-section">
              <h1 class="content-title">{{ content.title }}</h1>
              <div v-if="content.titleEnglish && content.titleEnglish !== content.title" class="content-subtitle">
                {{ content.titleEnglish }}
              </div>
            </div>
            <div class="user-actions">
              <button class="btn-circle" :class="{ active: inWatchlist }" @click="toggleWatchlist">
                <i :class="inWatchlist ? 'fas fa-check' : 'fas fa-plus'"></i>
              </button>
              <button class="btn-circle" @click="shareContent"><i class="fas fa-share-alt"></i></button>
            </div>
          </div>

          <div class="content-meta">
            <span v-if="content.rating" class="meta-item rating"><i class="fas fa-star"></i> {{ content.rating }}</span>
            <span v-if="content.year" class="meta-item"><i class="fas fa-calendar"></i> {{ content.year }}</span>
            <span v-if="content.episodes" class="meta-item"><i class="fas fa-list"></i> {{ content.episodes }} Episodes</span>
            <span v-if="content.averageDuration" class="meta-item"><i class="fas fa-clock"></i> {{ content.averageDuration }} min/ep</span>
            <span v-if="content.rated" class="meta-item"><i class="fas fa-shield-alt"></i> {{ content.rated }}</span>
            <span v-if="content.rank" class="meta-item rank"><i class="fas fa-trophy"></i> #{{ content.rank }}</span>
          </div>

          <div v-if="content.genres?.length" class="genres">
            <span v-for="genre in content.genres" :key="genre" class="genre-tag">{{ genre }}</span>
          </div>

          <div class="synopsis">
            <h3>Synopsis</h3>
            <p>{{ content.synopsis || 'Synopsis belum tersedia.' }}</p>
          </div>

          <div class="details-grid">
            <div v-if="content.studios?.length" class="detail-row"><strong>Studio:</strong> {{ content.studios.join(', ') }}</div>
            <div v-if="content.source" class="detail-row"><strong>Source:</strong> {{ content.source }}</div>
            <div v-if="content.status" class="detail-row"><strong>Status:</strong> {{ content.status }}</div>
            <div v-if="content.season" class="detail-row"><strong>Season:</strong> {{ content.season }}</div>
          </div>

          <!-- Related Anime -->
          <div v-if="content.recommendations?.length" class="related-section">
            <h3>Recommendations</h3>
            <div class="related-grid">
              <router-link v-for="rec in content.recommendations.slice(0, 6)" :key="rec.id" :to="`/watch/anime/${rec.id}`" class="related-card">
                <img v-if="rec.poster" :src="rec.poster" :alt="rec.title" loading="lazy" />
                <div class="related-title">{{ rec.title }}</div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="side-panel">
          <!-- Episodes List -->
          <div v-if="tmdbId && content.episodes > 1" class="episodes-panel">
            <div class="panel-header">
              <h3>Episodes</h3>
              <span class="count">{{ content.episodes }} episodes</span>
            </div>
            <div class="episode-list">
              <button 
                v-for="ep in content.episodes" 
                :key="ep"
                :class="['ep-item', { active: currentEpisode === ep }]"
                @click="selectEpisode(ep)"
              >
                <span class="ep-num">{{ ep }}</span>
                <span class="ep-label">Episode {{ ep }}</span>
                <i v-if="currentEpisode === ep" class="fas fa-play icon-playing"></i>
              </button>
            </div>
          </div>
          
          <div class="poster-panel" v-if="!tmdbId || playerMode === 'trailer'">
            <img v-if="content.poster" :src="content.poster" :alt="content.title" class="side-poster" />
          </div>

          <div v-if="content.openingThemes?.length" class="themes-panel">
            <h4>🎵 Opening Themes</h4>
            <ul><li v-for="(t, i) in content.openingThemes.slice(0, 5)" :key="i">{{ t }}</li></ul>
          </div>

          <div v-if="content.endingThemes?.length" class="themes-panel">
            <h4>🎶 Ending Themes</h4>
            <ul><li v-for="(t, i) in content.endingThemes.slice(0, 5)" :key="i">{{ t }}</li></ul>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>Anime Not Found</h2>
      <p>We couldn't find the anime you're looking for.</p>
      <router-link to="/anime" class="btn btn-primary"><i class="fas fa-torii-gate"></i> Back to Anime</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAnimeById } from '../services/animeApi'
import { searchSeries, searchMovies, tmdbFetch } from '../services/api'
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../stores/userStore'

const route = useRoute()
const router = useRouter()
const showToast = inject('toast')

const content = ref(null)
const loading = ref(true)

// Player state
const playerContainer = ref(null)
const playerMode = ref('stream') // stream or trailer
const tmdbId = ref(null)
const isMovie = ref(false)
const currentEpisode = ref(1)
const episodesMapping = ref({})

const movieServer = ref(localStorage.getItem('preferred_movie_server') || 'vidlink')
const selectedServer = computed({
  get: () => movieServer.value,
  set: (val) => {
    movieServer.value = val
    localStorage.setItem('preferred_movie_server', val)
  }
})

const servers = [
  { id: 'vidsrcpro', label: 'VidSrc Pro' },
  { id: 'vidsrccc', label: 'VidSrc CC' },
  { id: 'vidsrcme', label: 'VidSrc Me' },
  { id: 'vidlink', label: 'VidLink' },
  { id: 'vidsrc', label: 'VidSrc.to' },
  { id: 'embedsu', label: 'Embed.su' },
  { id: '2embed', label: '2Embed' }
]

const inWatchlist = computed(() => content.value ? isInWatchlist(content.value.id, 'anime') : false)
const bannerStyle = computed(() => ({
  backgroundImage: content.value?.poster ? `url(${content.value.poster})` : 'none'
}))

function formatNum(n) {
  if (!n) return '0'
  return Number(n).toLocaleString()
}

function getEmbedUrl() {
  if (!tmdbId.value) return ''
  const id = tmdbId.value
  
  // Use AniZip mapping if available, otherwise default to S1
  const epData = episodesMapping.value[currentEpisode.value]
  const s = epData?.seasonNumber || 1
  const ep = epData?.episodeNumber || currentEpisode.value
  
  if (selectedServer.value === 'vidsrcpro') {
    return isMovie.value ? `https://vidsrc.pro/embed/movie/${id}` : `https://vidsrc.pro/embed/tv/${id}/${s}/${ep}`
  } else if (selectedServer.value === 'vidsrccc') {
    return isMovie.value ? `https://vidsrc.cc/v2/embed/movie/${id}` : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${ep}`
  } else if (selectedServer.value === 'vidsrcme') {
    return isMovie.value ? `https://vidsrc.me/embed/movie/${id}` : `https://vidsrc.me/embed/tv/${id}/${s}/${ep}`
  } else if (selectedServer.value === 'vidlink') {
    return isMovie.value ? `https://vidlink.pro/embed/movie/${id}` : `https://vidlink.pro/embed/tv/${id}/${s}/${ep}`
  } else if (selectedServer.value === 'vidsrc') {
    return isMovie.value ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${s}/${ep}`
  } else if (selectedServer.value === 'embedsu') {
    return isMovie.value ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${s}/${ep}`
  } else if (selectedServer.value === '2embed') {
    return isMovie.value ? `https://multiembed.mov/directstream.php?video_id=${id}` : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${ep}`
  }
  return ''
}

function selectEpisode(ep) {
  currentEpisode.value = ep
  playerMode.value = 'stream'
}

function nextEpisode() {
  if (currentEpisode.value < content.value.episodes) {
    selectEpisode(currentEpisode.value + 1)
  }
}

function toggleFullscreen() {
  if (!playerContainer.value) return
  if (!document.fullscreenElement) {
    playerContainer.value.requestFullscreen().catch(err => {})
  } else {
    document.exitFullscreen()
  }
}

async function findTmdbMapping(anime) {
  try {
    // 1. Try AniZip API first (Most accurate mapping for MAL -> TMDB seasons/episodes)
    try {
      const res = await fetch(`https://api.ani.zip/mappings?mal_id=${anime.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.mappings?.themoviedb_id) {
          tmdbId.value = data.mappings.themoviedb_id;
          episodesMapping.value = data.episodes || {};
          
          // Determine if it's a movie based on AniZip episode 1 data having no seasonNumber
          const ep1 = data.episodes?.['1'];
          isMovie.value = ep1 ? !ep1.seasonNumber : anime.mediaType === 'Movie';
          return; // Success!
        }
      }
    } catch (e) {
      console.warn('AniZip mapping failed, falling back to TMDB Search', e);
    }

    // 2. Fallback: Search TMDB Directly
    const title = anime.title;
    const englishTitle = anime.titleEnglish;
    const year = anime.year ? parseInt(anime.year) : null;
    const isMovieType = anime.mediaType === 'Movie';
    
    let results = [];
    
    if (isMovieType) {
      let res = await tmdbFetch('/search/movie', { query: title });
      if (!res.results?.length && englishTitle) {
        res = await tmdbFetch('/search/movie', { query: englishTitle });
      }
      results = res.results || [];
    } else {
      let res = await tmdbFetch('/search/tv', { query: title });
      if (!res.results?.length && englishTitle) {
        res = await tmdbFetch('/search/tv', { query: englishTitle });
      }
      results = res.results || [];
    }

    if (results.length > 0) {
      let bestMatch = null;
      if (year) {
        bestMatch = results.find(r => {
          const rYear = isMovieType ? r.release_date?.split('-')[0] : r.first_air_date?.split('-')[0];
          return rYear && Math.abs(parseInt(rYear) - year) <= 1; 
        });
      }
      
      if (!bestMatch) bestMatch = results[0];

      tmdbId.value = bestMatch.id;
      isMovie.value = isMovieType;
      episodesMapping.value = {}; // Reset since we don't have accurate TMDB season mapping
    }
  } catch (e) {
    console.error('TMDB Mapping failed:', e);
  }
}

async function loadContent() {
  loading.value = true
  content.value = null
  tmdbId.value = null
  currentEpisode.value = 1
  playerMode.value = 'stream'
  episodesMapping.value = {}
  
  try {
    const { id } = route.params
    content.value = await getAnimeById(id)
    
    // Attempt to map MAL anime to TMDB for streaming
    await findTmdbMapping(content.value)
    
    // If no stream found, fallback to trailer
    if (!tmdbId.value && content.value.trailer) {
      playerMode.value = 'trailer'
    }
    
  } catch (error) {
    console.error('Failed to load anime:', error)
    if (showToast) showToast('Gagal memuat anime.', 'error')
  } finally {
    loading.value = false
  }
}

function toggleWatchlist() {
  if (inWatchlist.value) {
    removeFromWatchlist(content.value.id, 'anime')
    if (showToast) showToast('Dihapus dari Watchlist', 'info')
  } else {
    addToWatchlist(content.value, 'planned')
    if (showToast) showToast('Ditambahkan ke Watchlist', 'success')
  }
}

function shareContent() {
  const url = window.location.href
  const text = `Cek anime ${content.value.title} di Cinema Luxuoka! ${url}`
  if (navigator.share) {
    navigator.share({ title: content.value.title, text, url }).catch(() => {})
  } else {
    navigator.clipboard.writeText(text).then(() => {
      if (showToast) showToast('Link berhasil disalin!', 'success')
    })
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/anime')
}

onMounted(loadContent)
watch(() => route.params, loadContent)
</script>

<style scoped>
.watch-view { animation: fadeIn 0.4s ease; min-height: 100vh; padding: var(--spacing-md); max-width: 1400px; margin: 0 auto; }

.anime-banner { position: relative; height: 320px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--spacing-xl); background-size: cover; background-position: center top; }
.banner-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg-primary) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.3) 100%); }
.banner-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; }
.back-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.back-btn:hover { background: linear-gradient(135deg, #FF6B9D, #C44FE0); }
.banner-info { }
.anime-badge { display: inline-block; padding: 4px 12px; background: linear-gradient(135deg, #FF6B9D, #C44FE0); color: #fff; font-size: 10px; font-weight: 800; border-radius: 4px; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px; }
.banner-info h1 { font-size: 36px; font-weight: 800; text-shadow: 0 2px 20px rgba(0,0,0,0.5); }
.jp-title { color: rgba(255,255,255,0.6); font-size: 16px; margin-top: 4px; }

.watch-content-layout { display: grid; grid-template-columns: 1fr 320px; gap: var(--spacing-2xl); }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-lg); gap: 20px; }
.content-title { font-size: 30px; font-weight: 800; line-height: 1.1; margin-bottom: 4px; }
.content-subtitle { color: var(--text-muted); font-size: 16px; }
.user-actions { display: flex; gap: 10px; }
.btn-circle { width: 44px; height: 44px; border-radius: 50%; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.btn-circle:hover { border-color: #C44FE0; transform: translateY(-2px); }
.btn-circle.active { background: linear-gradient(135deg, #FF6B9D, #C44FE0); color: #fff; border-color: transparent; }

.content-meta { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
.meta-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); font-weight: 500; }
.meta-item i { color: #C44FE0; font-size: 12px; }
.meta-item.rating { color: #f1c40f; }
.meta-item.rating i { color: #f1c40f; }
.meta-item.rank { color: #FF6B9D; }
.meta-item.rank i { color: #FF6B9D; }

.genres { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 25px; }
.genre-tag { padding: 4px 14px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px; font-weight: 600; border: 1px solid var(--border-color); color: var(--text-secondary); }

.synopsis { margin-bottom: 30px; }
.synopsis h3 { margin-bottom: 12px; font-size: 18px; color: #C44FE0; font-weight: 700; }
.synopsis p { line-height: 1.8; color: var(--text-secondary); font-size: 15px; }

.details-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; padding: 24px; background: var(--bg-tertiary); border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 30px; }
.detail-row { font-size: 14px; color: var(--text-secondary); }
.detail-row strong { color: var(--text-primary); font-weight: 600; margin-right: 6px; }

.related-section { margin-top: 30px; }
.related-section h3 { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #C44FE0; }
.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
.related-card { text-decoration: none; color: inherit; transition: transform 0.2s; }
.related-card:hover { transform: translateY(-4px); }
.related-card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 8px; margin-bottom: 6px; }
.related-title { font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.side-panel { display: flex; flex-direction: column; gap: var(--spacing-xl); }
.side-poster { width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
.themes-panel, .stats-panel { background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
.themes-panel h4, .stats-panel h4 { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.themes-panel ul { list-style: none; padding: 0; }
.themes-panel li { font-size: 12px; color: var(--text-secondary); padding: 6px 0; border-bottom: 1px solid var(--border-color); }
.themes-panel li:last-child { border-bottom: none; }
.stat-row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); }
.stat-row:last-child { border-bottom: none; }

/* Player Styles */
.player-section-wrapper {
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #000;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.player-container { position: relative; width: 100%; }

.server-selector {
  background: var(--bg-secondary);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 15px;
}

.server-group { display: flex; align-items: center; gap: 12px; }
.server-label { font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

.server-btns { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.server-btns::-webkit-scrollbar { display: none; }

.server-btn {
  padding: 6px 14px; font-size: 11px; font-weight: 600; background: var(--bg-tertiary);
  border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-secondary);
  cursor: pointer; white-space: nowrap; transition: all 0.2s;
}
.server-btn:hover { border-color: var(--accent-primary); color: var(--text-primary); }
.server-btn.active { background: #C44FE0; color: #fff; border-color: #C44FE0; }

.player-actions { display: flex; gap: 10px; }
.action-btn { display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 6px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; font-size: 12px; font-weight: 600; }
.action-btn.active { background: #ff0000; border-color: #ff0000; color: #fff; }

.video-wrapper { position: relative; width: 100%; padding-top: 56.25%; }
.video-wrapper iframe { position: absolute; inset: 0; width: 100%; height: 100%; }

.no-stream-fallback { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
.no-stream-fallback i { font-size: 40px; margin-bottom: 10px; opacity: 0.5; }

.player-footer { background: var(--bg-secondary); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
.current-info { font-size: 13px; color: var(--text-secondary); }
.current-info span { color: #C44FE0; font-weight: 700; }
.next-episode-btn { padding: 8px 24px; font-size: 13px; font-weight: 700; border-radius: 8px; }

/* Episode List */
.episodes-panel { background: var(--bg-secondary); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); margin-bottom: 20px; }
.panel-header { padding: 16px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.panel-header h3 { font-size: 15px; font-weight: 700; margin: 0; }
.panel-header .count { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.episode-list { max-height: 480px; overflow-y: auto; scrollbar-width: thin; }
.ep-item { width: 100%; border: none; background: transparent; display: flex; align-items: center; gap: 15px; padding: 12px 20px; border-bottom: 1px solid var(--border-color); cursor: pointer; color: var(--text-secondary); transition: all 0.2s; text-align: left; }
.ep-item:hover { background: rgba(196, 79, 224, 0.05); color: var(--text-primary); }
.ep-item.active { background: rgba(196, 79, 224, 0.1); border-left: 3px solid #C44FE0; color: #C44FE0; font-weight: 600; }
.ep-num { font-size: 16px; font-weight: 800; opacity: 0.5; width: 25px; }
.ep-label { flex: 1; font-size: 13px; }
.icon-playing { font-size: 12px; }

.watch-skeleton { width: 100%; }
.skeleton-player { width: 100%; height: 320px; background: var(--bg-tertiary); border-radius: 16px; margin-bottom: 30px; }
.skeleton-info { max-width: 800px; }
.skeleton-line { height: 20px; background: var(--bg-tertiary); border-radius: 4px; margin-bottom: 12px; }
.skeleton-line.title { height: 40px; width: 60%; margin-bottom: 24px; }
.skeleton-line.mt { margin-top: 30px; }
.skeleton-badges { display: flex; gap: 12px; }
.skeleton-badge { width: 80px; height: 24px; background: var(--bg-tertiary); border-radius: 6px; }
.animate-pulse-subtle { animation: pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulseSubtle { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.error-state { text-align: center; padding: 80px 20px; }
.error-state i { font-size: 4rem; color: #C44FE0; margin-bottom: 20px; opacity: 0.5; }
.error-state h2 { margin-bottom: 10px; }
.error-state p { color: var(--text-muted); margin-bottom: 20px; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #FF6B9D, #C44FE0); color: #fff; border-radius: 10px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(196, 79, 224, 0.4); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1024px) {
  .watch-content-layout { grid-template-columns: 1fr; }
  .anime-banner { height: 240px; }
}

@media (max-width: 768px) {
  .banner-info h1 { font-size: 24px; }
  .content-title { font-size: 24px; }
}
</style>
