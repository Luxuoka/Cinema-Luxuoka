<template>
  <header class="topbar">
    <!-- MENU TOGGLE (mobile) -->
    <button class="menu-toggle" @click="$emit('toggle-sidebar')" aria-label="Toggle menu">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <!-- SEARCH -->
    <div class="search-wrap">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        ref="searchInputRef"
        class="search-input"
        type="text"
        v-model="searchQuery"
        placeholder="Cari film, series, anime..."
        aria-label="Cari konten"
        @input="handleSearch"
        @focus="searchFocused = true"
        @blur="handleBlur"
        autocomplete="off"
      >
      <button v-if="searchQuery" class="search-clear" @click="clearSearch">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- DROPDOWN -->
      <div v-if="searchFocused" class="search-dropdown">
        <!-- Suggestions when empty -->
        <template v-if="!searchQuery">
          <div class="search-suggestions-title">Trending Sekarang</div>
          <div
            v-for="(term, i) in trendingTerms"
            :key="term"
            class="search-suggestion"
            @mousedown.prevent="quickSearch(term)"
          >
            <span class="suggestion-rank">{{ i + 1 }}</span>
            <span>{{ term }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:auto;color:var(--green);opacity:0.8">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
          </div>
        </template>

        <!-- Loading -->
        <div v-else-if="searching" class="search-status">
          <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".3"/>
            <path d="M12 3a9 9 0 019 9"/>
          </svg>
          Mencari...
        </div>

        <!-- Results -->
        <template v-else-if="searchQuery">
          <!-- Movies -->
          <div v-if="results.movies.length" class="search-group">
            <div class="search-group-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
              Movies
            </div>
            <router-link
              v-for="item in results.movies.slice(0, 4)"
              :key="item.id"
              :to="`/watch/movie/${item.id}`"
              class="search-result"
              @click="clearSearch"
            >
              <div class="search-thumb">
                <img v-if="item.poster" :src="item.poster" :alt="item.title" />
                <div v-else class="search-thumb-placeholder">🎬</div>
              </div>
              <div class="search-meta">
                <div class="search-title" v-html="highlight(item.title, searchQuery)"></div>
                <div class="search-sub"> {{ item.rating }} · {{ item.year }}</div>
              </div>
              <span class="search-category">Movie</span>
            </router-link>
          </div>

          <!-- Series -->
          <div v-if="results.series.length" class="search-group">
            <div class="search-group-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              TV Series
            </div>
            <router-link
              v-for="item in results.series.slice(0, 4)"
              :key="item.id"
              :to="`/watch/series/${item.id}`"
              class="search-result"
              @click="clearSearch"
            >
              <div class="search-thumb">
                <img v-if="item.poster" :src="item.poster" :alt="item.title" />
                <div v-else class="search-thumb-placeholder">📺</div>
              </div>
              <div class="search-meta">
                <div class="search-title" v-html="highlight(item.title, searchQuery)"></div>
                <div class="search-sub"> {{ item.rating }} · {{ item.year }}</div>
              </div>
              <span class="search-category">Series</span>
            </router-link>
          </div>

          <!-- Anime -->
          <div v-if="results.anime && results.anime.length" class="search-group">
            <div class="search-group-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Anime
            </div>
            <router-link
              v-for="item in results.anime.slice(0, 4)"
              :key="item.id"
              :to="`/watch/anime/${item.id}`"
              class="search-result"
              @click="clearSearch"
            >
              <div class="search-thumb">
                <img v-if="item.poster" :src="item.poster" :alt="item.title" />
                <div v-else class="search-thumb-placeholder"></div>
              </div>
              <div class="search-meta">
                <div class="search-title" v-html="highlight(item.title, searchQuery)"></div>
                <div class="search-sub"> {{ item.rating }} · {{ item.year }}</div>
              </div>
              <span class="search-category" style="color:var(--blue)">Anime</span>
            </router-link>
          </div>

          <!-- Drama Asia -->
          <div v-if="results.dramas && results.dramas.length" class="search-group">
            <div class="search-group-title">
              <span style="font-size:12px;margin-right:4px"></span>
              Drama Asia
            </div>
            <router-link
              v-for="item in results.dramas.slice(0, 4)"
              :key="item.id"
              :to="`/watch/series/${item.id}`"
              class="search-result"
              @click="clearSearch"
            >
              <div class="search-thumb">
                <img v-if="item.poster" :src="item.poster" :alt="item.title" />
                <div v-else class="search-thumb-placeholder">📺</div>
              </div>
              <div class="search-meta">
                <div class="search-title" v-html="highlight(item.title, searchQuery)"></div>
                <div class="search-sub">
                  <span style="margin-right: 4px;">{{ item.flag }}</span>
                   {{ item.rating }} · {{ item.year }}
                </div>
              </div>
              <span class="search-category" style="color:var(--accent)">Drama</span>
            </router-link>
          </div>

          <!-- No results -->
          <div v-if="!results.movies.length && !results.series.length && (!results.anime || !results.anime.length) && (!results.dramas || !results.dramas.length) && !searching" class="search-status">
            Tidak ditemukan "{{ searchQuery }}"
          </div>
        </template>
      </div>
    </div>

    <!-- RIGHT ACTIONS -->
    <div class="topbar-right">
    </div>
  </header>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { searchAll } from '../services/api'
import { searchDrama } from '../services/dramaApi'

defineEmits(['toggle-sidebar'])

const searchQuery = ref('')
const searchFocused = ref(false)
const searching = ref(false)
const searchInputRef = ref(null)
const results = reactive({ movies: [], series: [], anime: [], dramas: [] })

const trendingTerms = ['Squid Game 2', 'Deadpool & Wolverine', 'Arcane', 'Attack on Titan', 'The Boys']

let searchTimeout = null
let searchAbortController = null

function handleSearch() {
  clearTimeout(searchTimeout)
  const q = searchQuery.value.trim()
  if (!q) { clearResults(); return }
  searching.value = true
  searchTimeout = setTimeout(async () => {
    if (searchAbortController) searchAbortController.abort()
    searchAbortController = new AbortController()
    try {
      const [data, dramas] = await Promise.all([
        searchAll(q, searchAbortController.signal),
        searchDrama(q, null, searchAbortController.signal)
      ])
      results.dramas = dramas || []
      results.movies = data.movies || []
      results.anime = data.anime || []
      // Filter out dramas from regular series
      results.series = (data.series || []).filter(s => !results.dramas.some(d => d.id === s.id))
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Search error:', err)
    } finally {
      searching.value = false
    }
  }, 400)
}

function clearResults() {
  results.movies = []
  results.series = []
  results.anime = []
  results.dramas = []
}

function clearSearch() {
  searchQuery.value = ''
  clearResults()
  searchFocused.value = false
}

function handleBlur() {
  setTimeout(() => { searchFocused.value = false }, 200)
}

function quickSearch(term) {
  searchQuery.value = term
  handleSearch()
}

function highlight(text, query) {
  if (!text || !query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<span class="hl">$1</span>')
}
</script>

<style scoped>
.topbar {
  height: 64px;
  background: rgba(17, 17, 24, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 50;
}

/* MENU TOGGLE */
.menu-toggle {
  display: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  align-items: center;
  justify-content: center;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  z-index: 2;
}

.menu-toggle:hover {
  background: var(--surface2);
  color: var(--text);
}

/* SEARCH */
.search-wrap {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  z-index: 1;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
  pointer-events: none;
  color: var(--text2);
}

.search-input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 24px;
  padding: 10px 40px 10px 44px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: var(--text3);
}

.search-input:focus {
  border-color: var(--accent);
  background: var(--surface2);
  box-shadow: 0 0 0 3px rgba(232, 54, 79, 0.15);
}

@media (max-width: 768px) {
  .search-wrap {
    max-width: 100%;
    padding: 0 10px;
    position: relative;
    left: 0;
    transform: none;
    order: 3;
    margin-top: 10px;
  }
  .topbar {
    height: auto;
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .search-input {
    font-size: 13px;
    padding: 8px 32px 8px 36px;
  }
  .topbar-right {
    order: 2;
  }
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text3);
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.search-clear:hover {
  color: var(--text);
}

/* DROPDOWN */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  overflow: hidden;
  z-index: 200;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  max-height: 480px;
  overflow-y: auto;
}

.search-suggestions-title {
  padding: 12px 16px 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: var(--text3);
  text-transform: uppercase;
}

.search-suggestion {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  color: var(--text2);
}

.search-suggestion:hover {
  background: var(--surface);
  color: var(--text);
}

.suggestion-rank {
  font-weight: 700;
  color: var(--accent);
  width: 18px;
  text-align: center;
  font-size: 16px;
}

.search-group {
  border-top: 1px solid var(--border);
}

.search-group:first-child {
  border-top: none;
}

.search-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: var(--text3);
  text-transform: uppercase;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s;
  text-decoration: none;
  color: var(--text);
}

.search-result:hover {
  background: var(--surface);
}

.search-thumb {
  width: 40px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface2);
}

.search-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--surface2);
}

.search-meta {
  flex: 1;
  min-width: 0;
}

.search-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-title :deep(.hl) {
  color: var(--accent);
  font-weight: 700;
}

.search-sub {
  font-size: 12px;
  color: var(--text3);
  margin-top: 2px;
}

.search-category {
  font-size: 11px;
  background: var(--surface2);
  color: var(--text2);
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.search-status {
  padding: 20px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin {
  animation: spinAnim 0.8s linear infinite;
}

@keyframes spinAnim {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* TOPBAR RIGHT */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  z-index: 2;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text2);
  position: relative;
}

.icon-btn:hover {
  background: var(--surface2);
  color: var(--text);
  border-color: var(--border2);
}

.notif-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  border: 2px solid var(--bg2);
}

/* NOTIFICATION PANEL */
.notif-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  display: none;
  z-index: 300;
  overflow: hidden;
  text-align: left;
}

.notif-panel.open {
  display: block;
}

.notif-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.notif-mark-read {
  font-size: 11px;
  color: var(--accent);
  cursor: pointer;
  font-weight: 500;
}

.notif-item {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
  align-items: flex-start;
}

.notif-item:hover {
  background: var(--surface);
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-dot-sm {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

.notif-text {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
}

.notif-text b {
  color: var(--text);
}

.notif-time {
  font-size: 11px;
  color: var(--text3);
  margin-top: 3px;
}

@media (max-width: 1024px) {
  .menu-toggle {
    display: flex;
  }
  .topbar {
    padding: 0 12px;
    height: 56px;
  }
}

@media (max-width: 600px) {
  .search-wrap {
    max-width: 100%;
  }
}

/* USER PROFILE */
.user-profile-btn {
  position: relative;
  cursor: pointer;
  margin-left: 8px;
}
.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.user-profile-btn:hover .user-avatar {
  border-color: var(--accent);
}
.user-menu-panel {
  width: 240px;
}
.user-menu-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.user-menu-name {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}
.user-menu-email {
  font-size: 12px;
  color: var(--text3);
  word-break: break-all;
}
.user-menu-item {
  color: var(--text2);
  font-size: 14px;
}
.user-menu-item:hover {
  color: var(--accent);
}
.login-wrapper {
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.google-login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 15px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.sign-in-btn {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border2);
}
.sign-in-btn:hover {
  background: var(--surface);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-1px);
}
.sign-up-btn {
  background: var(--accent-gradient);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(232, 54, 79, 0.2);
}
.sign-up-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(232, 54, 79, 0.4);
  filter: brightness(1.1);
}
.google-icon {
  flex-shrink: 0;
}

</style>
