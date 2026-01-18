<template>
  <div class="watch-view">
    <div v-if="loading" class="watch-skeleton animate-pulse-subtle">
      <div class="skeleton-player"></div>
      <div class="skeleton-info">
        <div class="skeleton-line title"></div>
        <div class="skeleton-badges">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
        </div>
        <div class="skeleton-line synopsis mt"></div>
        <div class="skeleton-line synopsis"></div>
      </div>
    </div>

    <template v-else-if="content">
      <!-- Player Section -->
      <div class="player-section-wrapper">
        <div class="player-container">
          <!-- Back Button inside player area -->
          <button @click="goBack" class="back-overlay-btn" title="Go Back">
            <i class="fas fa-arrow-left"></i>
          </button>

          <!-- Server Selector Bar -->
          <div class="server-selector">
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
                <span>{{ playerMode === 'trailer' ? 'Tonton Film' : 'Trailer' }}</span>
              </button>
            </div>
          </div>
          
          <!-- Video Player Iframe -->
          <div class="video-wrapper">
            <iframe 
              :key="`${playerMode}-${currentEpisode}-${selectedServer}-${content.tmdbMapping?.id}`"
              :src="getVideoUrl()"
              frameborder="0"
              allowfullscreen
              allow="autoplay; fullscreen; encrypted-media"
              referrerpolicy="origin"
            ></iframe>
          </div>

          <!-- Player Footer: Next Episode & Controls -->
          <div v-if="playerMode === 'stream' && isSeries" class="player-footer">
            <div class="current-info">
              Sedang Menonton: <span>Episode {{ currentEpisode }}</span>
            </div>
            <button 
              v-if="currentEpisode < (content.episodes || 0)"
              class="btn btn-primary next-episode-btn"
              @click="nextEpisode"
            >
              Episode Selanjutnya <i class="fas fa-forward"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Content Info Section -->
      <div class="watch-content-layout">
        <div class="main-info">
          <div class="header-row">
            <div class="title-section">
              <div class="content-badge">{{ typeBadge }}</div>
              <h1 class="content-title">{{ content.title }}</h1>
              <div v-if="content.titleEnglish && content.titleEnglish !== content.title" class="content-subtitle">
                {{ content.titleEnglish }}
              </div>
            </div>
            
            <div class="user-actions">
              <button 
                class="btn-circle" 
                :class="{ 'active': inWatchlist }"
                @click="toggleWatchlist"
                title="Add to Watchlist"
              >
                <i :class="inWatchlist ? 'fas fa-check' : 'fas fa-plus'"></i>
              </button>
              <button class="btn-circle" @click="shareContent" title="Share Content">
                <i class="fas fa-share-alt"></i>
              </button>
            </div>
          </div>

          <!-- Ad Slot: Below Title -->
          <div class="ad-slot-horizontal">
            <div id="container-d2706426593aec9632d99709a3ac7c63"></div>
          </div>

          <div class="content-meta">
            <span v-if="content.rating" class="meta-item rating">
              <i class="fas fa-star"></i>
              {{ content.rating }}
            </span>
            <span v-if="content.year" class="meta-item">
              <i class="fas fa-calendar"></i>
              {{ content.year }}
            </span>
            <span v-if="content.runtime" class="meta-item">
              <i class="fas fa-clock"></i>
              {{ content.runtime }}
            </span>
            <span v-if="content.episodes" class="meta-item">
              <i class="fas fa-list"></i>
              {{ content.episodes }} Episodes
            </span>
            <span v-if="content.rated" class="meta-item">
              <i class="fas fa-shield-alt"></i>
              {{ content.rated }}
            </span>
          </div>

          <div v-if="content.genres?.length" class="genres">
            <span v-for="genre in content.genres" :key="genre" class="genre-tag">
              {{ genre }}
            </span>
          </div>



          <div v-if="streamingSources.length > 0" class="streaming-sources">
            <h3>Tersedia di:</h3>
            <div class="source-buttons">
              <div 
                v-for="source in streamingSources" 
                :key="source.source_id"
                class="source-badge"
              >
                 <img v-if="source.logo" :src="source.logo" :alt="source.name" class="source-icon" />
                 <span v-else>{{ source.name }}</span>
                 <span class="source-price" v-if="source.price">{{ source.price }}</span>
              </div>
            </div>
          </div>

          <div class="synopsis">
            <h3>Sinopsis</h3>
            <p>{{ content.synopsis || 'Sinopsis belum tersedia.' }}</p>
          </div>

          <div class="details-grid">
            <div v-if="content.director" class="detail-row">
              <strong>Sutradara:</strong> {{ content.director }}
            </div>
            <div v-if="content.actors?.length" class="detail-row">
              <strong>Pemeran:</strong> {{ content.actors.slice(0, 8).join(', ') }}
            </div>
            <div v-if="content.studios?.length" class="detail-row">
              <strong>Studio:</strong> {{ content.studios.join(', ') }}
            </div>
            <div v-if="content.status" class="detail-row">
              <strong>Status:</strong> {{ content.status }}
            </div>
          </div>
        </div>

        <!-- Sidebar Panel: Episodes for Series, Trailer for Movies -->
        <div class="side-panel">
          <div v-if="isSeries" class="episodes-panel">
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
          
          <div v-else-if="content.trailer && playerMode !== 'trailer'" class="trailer-panel">
            <div class="panel-header">
              <h3>Trailer</h3>
            </div>
            <div class="trailer-preview" @click="playerMode = 'trailer'">
              <img :src="content.backdrop || content.poster" alt="Trailer Preview" />
              <div class="play-overlay">
                <i class="fas fa-play"></i>
              </div>
            </div>
          </div>
          
          <div class="poster-panel">
             <img :src="content.poster" :alt="content.title" class="side-poster" />
          </div>

          <!-- Ad Slot: Sidebar -->
          <div class="ad-slot-vertical">
            <div id="container-d2706426593aec9632d99709a3ac7c63"></div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>Oops! Content Not Found</h2>
      <p>We couldn't find the content you're looking for. It might have been moved or removed.</p>
      <router-link to="/" class="btn btn-primary">
        <i class="fas fa-home"></i> Go Back Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAnimeById, getMovieById, getSeriesById, findTmdbIdForAnime, getStreamingSources } from '../services/api'
import { addToHistory, addToWatchlist, removeFromWatchlist, isInWatchlist, trackGenreInteraction, updateEpisodeProgress } from '../stores/userStore'

const route = useRoute()
const router = useRouter()

let abortController = null

const content = ref(null)
const loading = ref(true)
const streamingSources = ref([])
const playerMode = ref('stream') // 'stream' or 'trailer'
const movieServer = ref(localStorage.getItem('preferred_movie_server') || 'vidlink')
const animeServer = ref(localStorage.getItem('preferred_anime_server') || 'vidsrccc')

const selectedServer = computed({
  get: () => route.params.type === 'anime' ? animeServer.value : movieServer.value,
  set: (val) => {
    if (route.params.type === 'anime') {
      animeServer.value = val
      localStorage.setItem('preferred_anime_server', val)
    } else {
      movieServer.value = val
      localStorage.setItem('preferred_movie_server', val)
    }
  }
})

const currentEpisode = ref(1)
const currentSeason = ref(1)
const volume = ref(parseFloat(localStorage.getItem('player_volume')) || 1.0)

const servers = [
  { id: 'vidsrcpro', label: 'VidSrc Pro' },
  { id: 'vidsrccc', label: 'VidSrc CC' },
  { id: 'vidsrcme', label: 'VidSrc Me' },
  { id: 'vidlink', label: 'VidLink' },
  { id: 'vidsrc', label: 'VidSrc.to' },
  { id: 'embedsu', label: 'Embed.su' },
  { id: '2embed', label: '2Embed' },
  { id: 'animesrc', label: 'AnimeSrc' }
]


const isSeries = computed(() => {
  if (!content.value) return false
  return content.value.type === 'anime' || content.value.type === 'series'
})

const inWatchlist = computed(() => {
  if (!content.value) return false
  return isInWatchlist(content.value.id, content.value.type)
})

const typeBadge = computed(() => {
  if (!content.value) return ''
  switch (content.value.type) {
    case 'anime': return 'Anime'
    case 'series': return 'TV Series'
    default: return 'Movie'
  }
})

// Generate embed URL based on selected server
function getEmbedUrl() {
  if (!content.value) return ''
  
  const { type, id } = route.params
  const tmdbMapping = content.value.tmdbMapping
  const tmdbId = tmdbMapping?.id
  const mappedSeason = tmdbMapping?.season
  const imdbId = content.value.imdbId
  const animeType = content.value.animeType
  
  // Decide if it's movie logic - For anime, use animeType directly
  const isMovie = (type === 'anime' && (animeType === 'Movie' || animeType === 'Special' || tmdbMapping?.type === 'movie')) ||
                  (type !== 'anime' && !isSeries.value)
  
  // Use TMDB Season if mapped, otherwise use currentSeason
  const activeSeason = mappedSeason || currentSeason.value
  const activeEpisode = currentEpisode.value

  // Priority ID for standard servers
  const mainId = tmdbId || imdbId
  
  if (selectedServer.value === 'vidsrcpro') {
    // For anime without TMDB mapping, use 2embed.skin which works better with anime
    if (type === 'anime' && !mainId) {
      // Use 2embed.skin for anime with MAL ID format
      if (isMovie) return `https://2embed.skin/embed/anime/mal-${id}`
      return `https://2embed.skin/embed/anime/mal-${id}/${activeEpisode}`
    }
    if (mainId) {
       if (isMovie) return `https://vidsrc.pro/embed/movie/${mainId}`
       return `https://vidsrc.pro/embed/tv/${mainId}/${activeSeason}/${activeEpisode}`
    }
    if (isMovie) return `https://vidsrc.pro/embed/movie/${id}`
    return `https://vidsrc.pro/embed/tv/${id}/${activeSeason}/${activeEpisode}`

  } else if (selectedServer.value === 'vidsrccc') {
    // For anime without TMDB mapping, use 2embed.skin which works better with anime
    if (type === 'anime' && !mainId) {
      if (isMovie) return `https://2embed.skin/embed/anime/mal-${id}`
      return `https://2embed.skin/embed/anime/mal-${id}/${activeEpisode}`
    }
    if (mainId) {
      if (isMovie) return `https://vidsrc.cc/v2/embed/movie/${mainId}`
      return `https://vidsrc.cc/v2/embed/tv/${mainId}/${activeSeason}/${activeEpisode}`
    }
    if (isMovie) return `https://vidsrc.cc/v2/embed/movie/${id}`
    return `https://vidsrc.cc/v2/embed/tv/${id}/${activeSeason}/${activeEpisode}`

  } else if (selectedServer.value === 'vidsrcme') {
    // For anime, try 2embed.skin which has better anime support
    if (type === 'anime' && !mainId) {
      if (isMovie) return `https://2embed.skin/embed/anime/mal-${id}`
      return `https://2embed.skin/embed/anime/mal-${id}/${activeEpisode}`
    }
    if (mainId) {
       // Prefer TMDB/IMDB ID if available as it's often more reliable
       if (isMovie) return `https://vidsrc.me/embed/movie/${mainId}`
       return `https://vidsrc.me/embed/tv/${mainId}/${activeSeason}/${activeEpisode}`
    }
    if (isMovie) return `https://vidsrc.me/embed/movie/${id}`
    return `https://vidsrc.me/embed/tv/${id}/${activeSeason}/${activeEpisode}`

  } else if (selectedServer.value === 'vidlink') {
    // For anime without TMDB mapping, use 2embed.skin
    if (type === 'anime' && !mainId) {
      if (isMovie) return `https://2embed.skin/embed/anime/mal-${id}`
      return `https://2embed.skin/embed/anime/mal-${id}/${activeEpisode}`
    }
    if (mainId) {
      if (isMovie) return `https://vidlink.pro/embed/movie/${mainId}`
      return `https://vidlink.pro/embed/tv/${mainId}/${activeSeason}/${activeEpisode}`
    }
    if (isMovie) return `https://vidlink.pro/embed/movie/${id}`
    return `https://vidlink.pro/embed/tv/${id}/${activeSeason}/${activeEpisode}`
    
  } else if (selectedServer.value === 'vidsrc') {
    // VidSrc.to requires TMDB or IMDB
    if (!mainId) return '' 
    if (isMovie) return `https://vidsrc.to/embed/movie/${mainId}`
    return `https://vidsrc.to/embed/tv/${mainId}/${activeSeason}/${activeEpisode}`

  } else if (selectedServer.value === 'embedsu') {
    if (!mainId) return ''
    if (isMovie) return `https://embed.su/embed/movie/${mainId}`
    return `https://embed.su/embed/tv/${mainId}/${activeSeason}/${activeEpisode}`
    
  } else if (selectedServer.value === '2embed') {
    // 2Embed has better anime support via 2embed.skin
    if (type === 'anime') {
      if (isMovie) return `https://2embed.skin/embed/anime/mal-${id}`
      return `https://2embed.skin/embed/anime/mal-${id}/${activeEpisode}`
    }
    if (mainId) {
      if (isMovie) return `https://2embed.skin/embed/movie/${mainId}`
      return `https://2embed.skin/embed/tv/${mainId}/${activeSeason}/${activeEpisode}`
    }
    return ''
    
  } else if (selectedServer.value === 'animesrc') {
    // AnimeSrc uses a different approach - anime-specific embeds
    if (type === 'anime') {
      // Try gogoanime-based embed that supports anime titles
      const animeName = encodeURIComponent(content.value?.title || '')
      if (isMovie) return `https://embtaku.pro/embedplus?id=${animeName}&episode=1`
      return `https://embtaku.pro/embedplus?id=${animeName}&episode=${activeEpisode}`
    }
    // Fallback to regular embed for non-anime
    if (mainId) {
      if (isMovie) return `https://vidsrc.cc/v2/embed/movie/${mainId}`
      return `https://vidsrc.cc/v2/embed/tv/${mainId}/${activeSeason}/${activeEpisode}`
    }
    return ''
  }
  
  return ''
}

function selectEpisode(ep) {
  currentEpisode.value = ep
  playerMode.value = 'stream'
  saveProgress()
}

function nextEpisode() {
  if (currentEpisode.value < content.value.episodes) {
    selectEpisode(currentEpisode.value + 1)
  }
}

function saveProgress() {
  if (!content.value) return
  
  // Save to localStorage
  const progressKey = `progress_${content.value.type}_${content.value.id}`
  localStorage.setItem(progressKey, JSON.stringify({
    episode: currentEpisode.value,
    season: currentSeason.value,
    timestamp: Date.now()
  }))
  
  // Global last played tracker
  localStorage.setItem('last_played', JSON.stringify({
    id: content.value.id,
    type: content.value.type,
    title: content.value.title,
    poster: content.value.poster,
    episode: currentEpisode.value,
    lastSeen: Date.now()
  }))

  updateEpisodeProgress(content.value.id, content.value.type, currentEpisode.value)
  addToHistory(content.value)
}

function loadProgress() {
  if (!content.value) return
  const progressKey = `progress_${content.value.type}_${content.value.id}`
  const saved = localStorage.getItem(progressKey)
  if (saved) {
    const { episode, season } = JSON.parse(saved)
    currentEpisode.value = episode || 1
    currentSeason.value = season || 1
  }
}

function getVideoUrl() {
  if (playerMode.value === 'trailer') {
    if (content.value?.trailer) {
      return content.value.trailer.includes('?') 
        ? content.value.trailer + '&autoplay=1' 
        : content.value.trailer + '?autoplay=1'
    }
  }
  return getEmbedUrl()
}

async function loadContent() {
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()
  const signal = abortController.signal

  loading.value = true
  // Don't clear content immediately if we are just switching episodes
  // but for new title, we should
  content.value = null
  
  try {
    const { type, id } = route.params
    let data = null
    
    if (type === 'anime') {
      data = await getAnimeById(id, signal)
      data.type = type
      content.value = data
      loading.value = false // Set loading to false early for anime
      
      loadProgress()
      saveProgress()
      if (data.genres) trackGenreInteraction(data.genres)

      // Background search for TMDB mapping to support more servers
      // Passing imdbId for 100% accuracy
      findTmdbIdForAnime(data.title, data.titleEnglish, data.animeType, data.year, data.imdbId)
        .then(tmdbMapping => {
          if (tmdbMapping && !signal.aborted && content.value?.id === id) {
            content.value.tmdbMapping = tmdbMapping
            
            // Fetch sources once we have TMDB ID
            getStreamingSources(tmdbMapping.id, tmdbMapping.type).then(sources => {
                if (!signal.aborted && content.value?.id === id) {
                   streamingSources.value = sources
                }
            })
          }
        })
        .catch(e => console.warn('TMDB mapping failed (background):', e))
        
    } else {
      if (type === 'series') {
        data = await getSeriesById(id, signal)
      } else {
        data = await getMovieById(id, signal)
      }
      
      if (data && !signal.aborted) {
        data.type = type
        content.value = data
        loadProgress()
        saveProgress()
        if (data.genres) trackGenreInteraction(data.genres)

        // Fetch streaming sources
        streamingSources.value = []
        getStreamingSources(id, type).then(sources => {
          if (!signal.aborted && content.value?.id === id) {
             streamingSources.value = sources
          }
        })
      }
      loading.value = false
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    console.error('Failed to load content:', error)
    loading.value = false
  }
}

function toggleWatchlist() {
  if (inWatchlist.value) {
    removeFromWatchlist(content.value.id, content.value.type)
  } else {
    addToWatchlist(content.value, 'watching')
  }
}

function shareContent() {
  const url = window.location.href
  const text = `Nonton ${content.value.title} gratis di Cinema Luxuoka! Kualitas mantap, tanpa ribet. Liat di sini: ${url}`
  
  if (navigator.share) {
    navigator.share({
      title: content.value.title,
      text: text,
      url: url
    }).catch(() => {})
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert('Link & pesan ajakan berhasil disalin! Bagikan ke temanmu.')
    })
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

watch(selectedServer, (val) => {
  localStorage.setItem('preferred_server', val)
})

watch(volume, (val) => {
  localStorage.setItem('player_volume', val.toString())
})

onMounted(loadContent)
watch(() => route.params, loadContent)
</script>

<style scoped>
.watch-view {
  animation: fadeIn 0.4s ease;
  min-height: 100vh;
  padding: var(--spacing-md);
  max-width: 1400px;
  margin: 0 auto;
}

.loading-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--spacing-md);
  color: var(--text-muted);
}

/* Player Section Wrapper */
.player-section-wrapper {
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #000;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.player-container {
  position: relative;
  width: 100%;
}

.back-overlay-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 100;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.back-overlay-btn:hover { background: var(--accent-primary); color: #000; }

.video-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Server Selector */
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

.server-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.server-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.server-btns {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.server-btns::-webkit-scrollbar { display: none; }

.server-btn {
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.server-btn:hover { border-color: var(--accent-primary); color: var(--text-primary); }
.server-btn.active { background: var(--accent-primary); color: #000; border-color: var(--accent-primary); }

.player-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.player-actions .action-btn.active { background: #ff0000; border-color: #ff0000; color: #fff; }

/* Player Footer */
.player-footer {
  background: var(--bg-secondary);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-info { font-size: 13px; color: var(--text-secondary); }
.current-info span { color: var(--accent-primary); font-weight: 700; }

.next-episode-btn {
  padding: 8px 24px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
}

/* Page Layout */
.watch-content-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--spacing-2xl);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  gap: 20px;
}

.content-badge {
  display: inline-block;
  padding: 3px 10px;
  background: var(--accent-gradient);
  color: #000;
  font-size: 10px;
  font-weight: 800;
  border-radius: 4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.content-title { font-size: 36px; font-weight: 800; line-height: 1.1; margin-bottom: 4px; }
.content-subtitle { color: var(--text-muted); font-size: 18px; font-weight: 500; }

.user-actions { display: flex; gap: 10px; }
.btn-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-circle:hover { border-color: var(--accent-primary); transform: translateY(-2px); }
.btn-circle.active { background: var(--accent-primary); color: #000; border-color: var(--accent-primary); }

.content-meta { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 25px; }
.meta-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); font-weight: 500; }
.meta-item i { color: var(--accent-primary); font-size: 12px; }
.meta-item.rating { color: #f1c40f; }

.genres { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 25px; }
.genre-tag {
  padding: 4px 14px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.synopsis { margin-bottom: 30px; }
.synopsis h3 { margin-bottom: 12px; font-size: 18px; color: var(--accent-primary); font-weight: 700; }
.synopsis p { line-height: 1.8; color: var(--text-secondary); font-size: 15px; }

/* Ad Slots */
.ad-slot-horizontal {
  margin-bottom: 25px;
  width: 100%;
}

.ad-slot-vertical {
  width: 100%;
  margin-top: 10px;
}

/* Streaming Sources */
.streaming-sources {
  margin-bottom: 25px;
}
.streaming-sources h3 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
}
.source-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.source-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: default;
}


.source-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.ml-2 { margin-left: 6px; font-size: 10px; opacity: 0.7; }

.ad-placeholder {
  background: var(--bg-tertiary);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 10px;
  transition: all 0.3s;
}

.ad-slot-horizontal .ad-placeholder {
  height: 90px;
}

.ad-slot-vertical .ad-placeholder {
  min-height: 250px;
}

.ad-placeholder:hover {
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.03);
}

.ad-placeholder i {
  font-size: 24px;
  opacity: 0.5;
}

.ad-placeholder span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Skeleton Loading */
.watch-skeleton {
  width: 100%;
}

.skeleton-player {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--bg-tertiary);
  border-radius: 16px;
  margin-bottom: 30px;
}

.skeleton-info {
  max-width: 800px;
}

.skeleton-line {
  height: 20px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-line.title {
  height: 40px;
  width: 60%;
  margin-bottom: 24px;
}

.skeleton-line.mt {
  margin-top: 30px;
}

.skeleton-badges {
  display: flex;
  gap: 12px;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.animate-pulse-subtle {
  animation: pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  padding: 24px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
.detail-row { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
.detail-row strong { color: var(--text-primary); font-weight: 600; margin-right: 6px; }

/* Side Panel */
.side-panel { display: flex; flex-direction: column; gap: var(--spacing-xl); }
.episodes-panel, .trailer-panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h3 { font-size: 15px; font-weight: 700; margin: 0; }
.panel-header .count { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

.episode-list { max-height: 480px; overflow-y: auto; scrollbar-width: thin; }
.ep-item {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.ep-item:not(:last-child) { border-bottom: 1px solid var(--border-color); }
.ep-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.ep-item.active { background: rgba(0, 212, 170, 0.08); color: var(--accent-primary); }
.ep-num { font-size: 12px; font-weight: 800; width: 20px; opacity: 0.4; }
.ep-label { flex: 1; font-size: 13px; font-weight: 600; }
.icon-playing { font-size: 9px; }

.trailer-preview { position: relative; cursor: pointer; padding: 10px; border-radius: 8px; overflow: hidden; }
.trailer-preview img { width: 100%; border-radius: 6px; display: block; filter: brightness(0.8); transition: filter 0.3s; }
.trailer-preview:hover img { filter: brightness(1); }
.play-overlay {
  position: absolute; inset: 10px; background: rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; color: #fff; border-radius: 6px; opacity: 1;
}

.side-poster { width: 100%; border-radius: 12px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); }

/* Error State */
.error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 70vh; text-align: center; gap: 20px;
}
.error-state i { font-size: 4rem; color: var(--accent-primary); }

/* Response Mobile */
@media (max-width: 1100px) {
  .watch-content-layout { grid-template-columns: 1fr; }
  .side-panel { order: -1; } /* Episodes above context on tablet/mobile? */
  .poster-panel { display: none; }
}
@media (max-width: 768px) {
  .watch-view { padding: 10px; }
  .content-title { font-size: 26px; }
  .header-row { flex-direction: column; }
  .user-actions { width: 100%; justify-content: flex-start; }
}
@media (max-width: 480px) {
  .watch-view { padding: 0; }
  .player-section-wrapper { border-radius: 0; margin-bottom: 15px; }
  .watch-content-layout { padding: 15px; }
  .server-selector { padding: 10px; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
