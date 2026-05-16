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
                <div class="search-sub">⭐ {{ item.rating }} · {{ item.year }}</div>
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
                <div class="search-sub">⭐ {{ item.rating }} · {{ item.year }}</div>
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
                <div v-else class="search-thumb-placeholder">⚡</div>
              </div>
              <div class="search-meta">
                <div class="search-title" v-html="highlight(item.title, searchQuery)"></div>
                <div class="search-sub">⭐ {{ item.rating }} · {{ item.year }}</div>
              </div>
              <span class="search-category" style="color:var(--blue)">Anime</span>
            </router-link>
          </div>

          <!-- No results -->
          <div v-if="!results.movies.length && !results.series.length && (!results.anime || !results.anime.length) && !searching" class="search-status">
            Tidak ditemukan "{{ searchQuery }}" 😕
          </div>
        </template>
      </div>
    </div>

    <!-- RIGHT ACTIONS -->
    <div class="topbar-right">
      <!-- Notification -->
      <div class="icon-btn" style="position:relative" @click="toggleNotif" id="notif-btn">
        <div class="notif-dot"></div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>

        <!-- Notif Panel -->
        <div class="notif-panel" :class="{ open: notifOpen }">
          <div class="notif-header">
            <span>Notifikasi ({{ notifications.length }})</span>
            <span class="notif-mark-read" @click.stop="handleMarkRead">Tandai semua dibaca</span>
          </div>
          
          <div v-if="notifications.length === 0" class="notif-empty">
            <p>Belum ada notifikasi baru.</p>
          </div>
          
          <div 
            v-for="notif in notifications" 
            :key="notif.id" 
            class="notif-item"
            :style="{ opacity: notif.read ? 0.6 : 1 }"
          >
            <div v-if="!notif.read" class="notif-dot-sm"></div>
            <div v-else style="width:8px;height:8px;flex-shrink:0"></div>
            <div>
              <div class="notif-text" v-html="notif.text"></div>
              <div class="notif-time">{{ formatDate(notif.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state for auth -->
      <div v-if="userState.loading" class="icon-btn" style="border:none;background:transparent">
        <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".3"/>
          <path d="M12 3a9 9 0 019 9"/>
        </svg>
      </div>

      <div v-else-if="userState.isLoggedIn" class="user-profile-btn" @click="toggleUserMenu" id="user-btn">
        <img :src="currentProfile.avatar || userProfile.avatar" alt="Avatar" class="user-avatar" />
        
        <!-- User Menu Panel -->
        <div class="notif-panel user-menu-panel" :class="{ open: userMenuOpen }">
          <div class="user-menu-header">
            <div class="user-menu-name">{{ currentProfile.name || userProfile.username }}</div>
            <div class="user-menu-email">{{ userProfile.email }}</div>
          </div>
          <router-link to="/profiles" class="notif-item user-menu-item" style="text-decoration:none">
            <i class="fas fa-users" style="width:16px"></i>
            <span>Ganti Profil</span>
          </router-link>
          <router-link to="/profile" class="notif-item user-menu-item" style="text-decoration:none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Pengaturan</span>
          </router-link>
          <div class="notif-item user-menu-item" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </div>
        </div>
      </div>
      <div v-else class="login-wrapper">
        <button class="google-login-btn" @click="handleLoginSuccess">
          <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Login
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { searchAll } from '../services/api'
import { decodeCredential } from 'vue3-google-login'
import { userState, userProfile, currentProfile, notifications, markAllNotifsAsRead, loginUser, logoutUser } from '../stores/userStore'

defineEmits(['toggle-sidebar'])

const searchQuery = ref('')
const searchFocused = ref(false)
const searching = ref(false)
const notifOpen = ref(false)
const searchInputRef = ref(null)
const results = reactive({ movies: [], series: [], anime: [] })

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
      const data = await searchAll(q, searchAbortController.signal)
      results.movies = data.movies || []
      results.series = data.series || []
      results.anime = data.anime || []
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

function toggleNotif() {
  notifOpen.value = !notifOpen.value
  if (notifOpen.value) userMenuOpen.value = false
}

function handleMarkRead() {
  markAllNotifsAsRead()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  return date.toLocaleDateString()
}

const userMenuOpen = ref(false)

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
  if (userMenuOpen.value) notifOpen.value = false
}

function handleLoginSuccess() {
  loginUser()
}

function handleLogout() {
  logoutUser()
  userMenuOpen.value = false
}

// Close panels on outside click
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notif-btn')) {
      notifOpen.value = false
    }
    if (!e.target.closest('#user-btn')) {
      userMenuOpen.value = false
    }
  })
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
}
.google-login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border2);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.google-login-btn:hover {
  background: var(--surface);
  border-color: var(--accent);
}
.google-icon {
  flex-shrink: 0;
}

</style>
