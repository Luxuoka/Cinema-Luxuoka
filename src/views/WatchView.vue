<template>
  <div class="watch-view">
    <div v-if="loading" class="loading-full">
      <div class="spinner"></div>
      <p>Loading content...</p>
    </div>

    <template v-else-if="content">
      <!-- Hero / Backdrop -->
      <div class="watch-hero" :style="heroStyle">
        <div class="watch-hero__overlay"></div>
        <button @click="goBack" class="back-button">
          <i class="fas fa-arrow-left"></i>
          Back
        </button>
      </div>

      <!-- Content Details -->
      <div class="watch-content">
        <div class="poster-section">
          <div class="poster">
            <img v-if="content.poster" :src="content.poster" :alt="content.title" />
            <div v-else class="poster-placeholder">
              <i class="fas fa-film"></i>
            </div>
            <div v-if="inWatchlist" class="poster-badge">
              <i class="fas fa-bookmark"></i>
            </div>
          </div>
          
          <button class="btn btn-primary watch-btn" @click="openPlayer('stream')">
            <i class="fas fa-play"></i>
            Watch Now
          </button>
          
          <button v-if="content.trailer" class="btn btn-secondary watch-btn trailer-btn" @click="openPlayer('trailer')">
            <i class="fab fa-youtube"></i>
            Watch Trailer
          </button>
          
          <div class="action-buttons">
            <button class="btn btn-secondary" title="Rate this title">
              <i class="fas fa-star"></i>
              Rate
            </button>
            <button 
              class="btn btn-secondary" 
              :class="{ 'active': inWatchlist }"
              @click="toggleWatchlist"
            >
              <i :class="inWatchlist ? 'fas fa-check' : 'fas fa-plus'"></i>
              Watchlist
            </button>
          </div>
        </div>

        <div class="info-section">
          <div class="content-badge">
            {{ typeBadge }}
          </div>
          
          <h1 class="content-title">{{ content.title }}</h1>
          
          <div v-if="content.titleEnglish && content.titleEnglish !== content.title" class="content-subtitle">
            {{ content.titleEnglish }}
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
            <span v-if="content.totalSeasons" class="meta-item">
              <i class="fas fa-layer-group"></i>
              {{ content.totalSeasons }} Seasons
            </span>
            <span v-if="content.rated" class="meta-item">
              <i class="fas fa-shield-alt"></i>
              {{ content.rated }}
            </span>
            <span v-if="content.status" class="meta-item status">
              {{ content.status }}
            </span>
          </div>

          <div v-if="content.genres?.length" class="genres">
            <span v-for="genre in content.genres" :key="genre" class="genre-tag">
              {{ genre }}
            </span>
          </div>

          <div class="synopsis">
            <h3>Synopsis</h3>
            <p>{{ content.synopsis || 'No synopsis available.' }}</p>
          </div>

          <div v-if="content.director" class="detail-row">
            <strong>Director:</strong> {{ content.director }}
          </div>

          <div v-if="content.actors?.length" class="detail-row">
            <strong>Cast:</strong> {{ content.actors.join(', ') }}
          </div>

          <div v-if="content.studios?.length" class="detail-row">
            <strong>Studios:</strong> {{ content.studios.join(', ') }}
          </div>

          <div v-if="content.awards" class="awards">
            <i class="fas fa-trophy"></i>
            {{ content.awards }}
          </div>
        </div>
      </div>

      <!-- Video Player Modal -->
      <div v-if="showPlayer" class="player-modal" @click.self="showPlayer = false">
        <div class="player-container">
          <button class="close-player" @click="showPlayer = false">
            <i class="fas fa-arrow-left"></i> Return
          </button>
          
          <!-- Player Mode Toggle -->
          <div class="player-mode-toggle">
            <button 
              :class="['mode-btn', { active: playerMode === 'stream' }]"
              @click="playerMode = 'stream'"
            >
              <i class="fas fa-play"></i> Stream
            </button>
            <button 
              v-if="content.trailer"
              :class="['mode-btn', { active: playerMode === 'trailer' }]"
              @click="playerMode = 'trailer'"
            >
              <i class="fab fa-youtube"></i> Trailer
            </button>
          </div>
          
          <!-- Server Selector (Only in Stream Mode) -->
          <div v-if="playerMode === 'stream'" class="server-selector">
            <span class="server-label">Server:</span>
            <button 
              :class="['server-btn', { active: selectedServer === 'vidlink' }]"
              @click="selectedServer = 'vidlink'"
            >
              VidLink
            </button>
            <button 
              :class="['server-btn', { active: selectedServer === 'vidsrc' }]"
              @click="selectedServer = 'vidsrc'"
            >
              VidSrc
            </button>
            <button 
              :class="['server-btn', { active: selectedServer === 'vidsrccc' }]"
              @click="selectedServer = 'vidsrccc'"
            >
              VidSrc.cc
            </button>
            <button 
              :class="['server-btn', { active: selectedServer === 'embedsu' }]"
              @click="selectedServer = 'embedsu'"
            >
              Embed.su
            </button>
             <button 
              :class="['server-btn', { active: selectedServer === 'superembed' }]"
              @click="selectedServer = 'superembed'"
            >
              SuperEmbed
            </button>
          </div>
          
          <!-- Video Player -->
          <div class="video-wrapper">
            <iframe 
              :key="currentEpisode"
              :src="getVideoUrl()"
              frameborder="0"
              allowfullscreen
              allow="autoplay; fullscreen; encrypted-media"
              referrerpolicy="origin"
            ></iframe>
          </div>

          <!-- Episode Selector (for Series/Anime) -->
          <div v-if="playerMode === 'stream' && (content.type === 'anime' || content.type === 'series') && content.episodes" class="episode-selector">
            <div class="selector-header">
              <h3>Episodes</h3>
              <span class="episode-count">{{ content.episodes }} Episodes</span>
            </div>
            <div class="episode-grid">
              <button 
                v-for="ep in content.episodes" 
                :key="ep"
                :class="['episode-btn', { active: currentEpisode === ep }]"
                @click="selectEpisode(ep)"
              >
                {{ ep }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>Content not found</h2>
      <p>The content you're looking for doesn't exist or has been removed.</p>
      <router-link to="/" class="btn btn-primary">
        <i class="fas fa-home"></i>
        Go Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAnimeById, getMovieById, getSeriesById, findTmdbIdForAnime } from '../services/api'
import { addToHistory, addToWatchlist, removeFromWatchlist, isInWatchlist, trackGenreInteraction } from '../stores/userStore'

const route = useRoute()
const router = useRouter()

const content = ref(null)
const loading = ref(true)
const showPlayer = ref(false)
const playerMode = ref('stream') // 'stream' or 'trailer'
const selectedServer = ref('vidlink')

const currentEpisode = ref(1)
const currentSeason = ref(1)

// Generate embed URL based on selected server
function getEmbedUrl() {
  const { type, id } = route.params
  const tmdbId = content.value?.tmdbMapping?.id || id
  const isMovie = type === 'movie' || (type === 'anime' && (content.value?.animeType === 'Movie' || content.value?.tmdbMapping?.type === 'movie'))
  
  if (selectedServer.value === 'vidlink') {
    // VidLink
    if (type === 'anime') {
      // Use MAL ID directly for anime
      return `https://vidlink.pro/anime/${id}/${currentEpisode.value}/sub`
    }
    
    if (isMovie) {
      return `https://vidlink.pro/movie/${tmdbId}`
    } else {
      return `https://vidlink.pro/tv/${tmdbId}/${currentSeason.value}/${currentEpisode.value}`
    }
  } else if (selectedServer.value === 'vidsrc') {
    // VidSrc.to
    if (isMovie) {
      return `https://vidsrc.to/embed/movie/${tmdbId}`
    } else {
      return `https://vidsrc.to/embed/tv/${tmdbId}/${currentSeason.value}/${currentEpisode.value}`
    }
  } else if (selectedServer.value === 'vidsrccc') {
    // VidSrc.cc
    if (type === 'anime') {
      // Use MAL ID for anime
      return `https://vidsrc.cc/v2/embed/anime/${id}`
    }
    
    if (isMovie) {
      return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`
    } else {
      return `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${currentSeason.value}/${currentEpisode.value}`
    }
  } else if (selectedServer.value === 'embedsu') {
    // Embed.su
    if (isMovie) {
      return `https://embed.su/embed/movie/${tmdbId}`
    } else {
      return `https://embed.su/embed/tv/${tmdbId}/${currentSeason.value}/${currentEpisode.value}`
    }
  } else if (selectedServer.value === 'superembed') {
    // SuperEmbed
    if (isMovie) {
       return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`
    } else {
       return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${currentSeason.value}&e=${currentEpisode.value}`
    }
  }
  
  return ''
}

// Open player with stream or trailer
function openPlayer(mode = 'stream') {
  playerMode.value = mode
  showPlayer.value = true
  
  // Add to history when watching
  if (content.value) {
    addToHistory(content.value)
    
    // Auto-update watchlist status to watching if it was planned
    if (inWatchlist.value) {
      // Logic handled inside userStore's update logic or could be explicit here
      addToWatchlist(content.value, 'watching')
    }
  }
}

function goBack() {
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    // Fallback based on content type
    const type = route.params.type
    if (type === 'movie') {
      router.push('/movies')
    } else if (type === 'series') {
      router.push('/series')
    } else if (type === 'anime') {
      router.push('/anime')
    } else {
      router.push('/')
    }
  }
}

function selectEpisode(ep) {
  currentEpisode.value = ep
  // If player is already open, it will reload because currentEpisode is a ref used in computed/methods? 
  // Wait, getEmbedUrl is called in the template so it's reactive.
}

// Get the video URL based on mode
function getVideoUrl() {
  const { type } = route.params
  
  // For trailer mode
  if (playerMode.value === 'trailer') {
    if (content.value?.trailer) {
      // Ensure autoplay
      return content.value.trailer.includes('?') 
        ? content.value.trailer + '&autoplay=1' 
        : content.value.trailer + '?autoplay=1'
    }
  }
  
  // For stream mode (movies, series, and mapped anime)
  return getEmbedUrl()
}

async function loadContent() {
  loading.value = true
  content.value = null
  currentEpisode.value = 1 // Reset to ep 1
  
  try {
    const { type, id } = route.params
    let data = null
    
    if (type === 'anime') {
      data = await getAnimeById(id)
      // Try to find TMDB mapping for streaming
      const tmdbMapping = await findTmdbIdForAnime(data.title, data.titleEnglish, data.animeType)
      if (tmdbMapping) {
        data.tmdbMapping = tmdbMapping
      }
    } else if (type === 'series') {
      data = await getSeriesById(id)
    } else {
      data = await getMovieById(id)
    }
    
    if (data) {
      // Ensure type is set on content object for store usage
      data.type = type
      content.value = data
      
      // Track genre view
      if (data.genres) {
        trackGenreInteraction(data.genres)
      }
    }
  } catch (error) {
    console.error('Failed to load content:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadContent)

watch(() => route.params, loadContent)
</script>

<style scoped>
.watch-view {
  animation: fadeIn 0.5s ease;
  min-height: 100vh;
  margin: calc(-1 * var(--spacing-xl));
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

.watch-hero {
  position: relative;
  height: 300px;
  background-size: cover;
  background-position: center top;
  background-color: var(--bg-tertiary);
}

.watch-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 15, 0.3) 0%,
    rgba(10, 10, 15, 1) 100%
  );
}

.back-button {
  position: absolute;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: all var(--transition-normal);
  z-index: 10;
  border: none;
  font-size: var(--font-md);
  cursor: pointer;
}

.back-button:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.watch-content {
  display: flex;
  gap: var(--spacing-2xl);
  padding: var(--spacing-xl);
  margin-top: -100px;
  position: relative;
  z-index: 5;
}

.poster-section {
  flex-shrink: 0;
  width: 280px;
}

.poster {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 4rem;
}

.poster-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.watch-btn {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-md);
  margin-bottom: var(--spacing-md);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.action-buttons .btn {
  flex: 1;
  justify-content: center;
}

.action-buttons .btn.active {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
}

.info-section {
  flex: 1;
  min-width: 0;
}

.content-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--accent-gradient);
  color: var(--bg-primary);
  font-size: var(--font-xs);
  font-weight: 700;
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-md);
}

.content-title {
  font-size: var(--font-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  line-height: 1.2;
}

.content-subtitle {
  font-size: var(--font-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.content-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
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

.meta-item.rating {
  background: rgba(243, 156, 18, 0.2);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.meta-item.rating i {
  color: #f39c12;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.genre-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  font-size: var(--font-sm);
}

.synopsis {
  margin-bottom: var(--spacing-xl);
}

.synopsis h3 {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--accent-primary);
}

.synopsis p {
  color: var(--text-secondary);
  line-height: 1.8;
}

.detail-row {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.detail-row strong {
  color: var(--text-primary);
}

.awards {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(243, 156, 18, 0.1);
  border: 1px solid rgba(243, 156, 18, 0.3);
  border-radius: var(--radius-md);
  color: #f39c12;
  margin-top: var(--spacing-lg);
}

/* Player Modal */
.player-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-xl);
}

.player-container {
  position: relative;
  width: 100%;
  max-width: 1000px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.close-player {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 10;
  transition: all var(--transition-normal);
  padding: 0 var(--spacing-md);
  width: auto;
  border-radius: var(--radius-md);
  gap: var(--spacing-sm);
  font-weight: 600;
}

.close-player:hover {
  background: var(--accent-secondary);
}

.trailer-btn {
  background: transparent;
  border: 1px solid #ff0000;
  color: #ff0000;
}

.trailer-btn:hover {
  background: #ff0000;
  color: white;
  border-color: #ff0000;
}

.player-mode-toggle {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.server-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.server-label {
  color: var(--text-muted);
  font-size: var(--font-xs);
  font-weight: 600;
  text-transform: uppercase;
  margin-right: var(--spacing-xs);
}

.server-btn {
  padding: 4px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-xs);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-short);
}

.server-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.server-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.mode-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.mode-btn.active {
  background: var(--accent-gradient);
  border-color: transparent;
  color: var(--bg-primary);
}

.mode-btn.active i {
  color: var(--bg-primary);
}

.video-wrapper {
  position: relative;
  padding-top: 56.25%;
}

.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: var(--spacing-xl);
}

.error-state i {
  font-size: 4rem;
  color: var(--accent-secondary);
  margin-bottom: var(--spacing-lg);
}

.error-state h2 {
  margin-bottom: var(--spacing-sm);
}

.error-state p {
  color: var(--text-muted);
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 768px) {
  .watch-content {
    flex-direction: column;
    padding: var(--spacing-md);
  }
  
  .poster-section {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
  
  .content-title {
    font-size: var(--font-2xl);
  }
}

/* Episode Selector */
.episode-selector {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  max-height: 300px;
  overflow-y: auto;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.selector-header h3 {
  font-size: var(--font-lg);
  color: var(--text-primary);
}

.episode-count {
  color: var(--text-muted);
  font-size: var(--font-sm);
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: var(--spacing-sm);
}

.episode-btn {
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.episode-btn:hover {
  background: var(--bg-primary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.episode-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
