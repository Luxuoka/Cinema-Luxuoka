<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <!-- LOGO -->
    <div class="logo">
      <div class="logo-icon">C</div>
      <div class="logo-text">Cinema<span>Luxuoka</span></div>
    </div>

    <!-- MENU -->
    <div class="sidebar-section-label">Menu</div>
    <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      Home
    </router-link>
    <router-link to="/trending" class="nav-item" :class="{ active: $route.path === '/trending' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
      </svg>
      Trending
      <span class="nav-badge">Hot</span>
    </router-link>
    <router-link to="/watchlist" class="nav-item" :class="{ active: $route.path === '/watchlist' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
      Watchlist
      <i v-if="!userState?.isLoggedIn" class="fas fa-lock lock-sm"></i>
      <span v-else-if="watchlistCount > 0" class="nav-badge nav-badge--count">{{ watchlistCount }}</span>
    </router-link>
    <router-link v-if="userState?.isLoggedIn" to="/history" class="nav-item" :class="{ active: $route.path === '/history' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      History
    </router-link>
    <div v-else class="sidebar-login-tip">
      <i class="fas fa-info-circle"></i>
      Login untuk sinkronisasi
    </div>

    <!-- KATEGORI -->
    <div class="sidebar-section-label">Kategori</div>
    <router-link to="/movies" class="nav-item" :class="{ active: $route.path === '/movies' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/>
        <line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="2" y1="7" x2="7" y2="7"/>
        <line x1="2" y1="17" x2="7" y2="17"/>
        <line x1="17" y1="17" x2="22" y2="17"/>
        <line x1="17" y1="7" x2="22" y2="7"/>
      </svg>
      Movies
    </router-link>
    <router-link to="/series" class="nav-item" :class="{ active: $route.path === '/series' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      TV Shows
      <i v-if="!userState?.isLoggedIn" class="fas fa-lock lock-sm"></i>
    </router-link>
    <router-link to="/anime" class="nav-item" :class="{ active: $route.path === '/anime' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      Anime
      <i v-if="!userState?.isLoggedIn" class="fas fa-lock lock-sm"></i>
    </router-link>

    <!-- SUPPORT -->
    <div class="sidebar-section-label">Support</div>
    <a
      href="https://wa.me/6281806080731?text=Halo%20Admin,%20tolong%20upload%20film%20[Judul]%20tahun%20[Tahun],%20terima%20kasih."
      target="_blank"
      class="nav-item"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Request Movie
    </a>
    <router-link v-if="userState?.isLoggedIn" to="/admin" class="nav-item" :class="{ active: $route.path === '/admin' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 11V7a4 4 0 10-8 0v4M5 11h10a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"/>
      </svg>
      Admin Panel
    </router-link>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { watchlist, userState } from '../stores/userStore'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const watchlistCount = computed(() => watchlist.length)
</script>

<style scoped>
.sidebar {
  width: var(--sidebar);
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--surface2) transparent;
}

.sidebar::-webkit-scrollbar { width: 3px; }
.sidebar::-webkit-scrollbar-track { background: transparent; }
.sidebar::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 3px; }

/* LOGO */
.logo {
  padding: 24px 20px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--accent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: var(--text);
}

.logo-text span {
  color: var(--accent);
}

/* SECTION LABELS */
.sidebar-section-label {
  padding: 18px 12px 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--text3);
  text-transform: uppercase;
  flex-shrink: 0;
}

/* NAV ITEMS */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  margin: 2px 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text2);
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;
  flex-shrink: 0;
}

.nav-item:hover {
  background: var(--surface);
  color: var(--text);
}

.nav-item.active {
  background: rgba(232, 54, 79, 0.12);
  color: #fff;
  border-left: 3px solid var(--accent);
  padding-left: 13px;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.7;
}

.nav-item.active .nav-icon,
.nav-item:hover .nav-icon {
  opacity: 1;
}

/* BADGES */
.nav-badge {
  margin-left: auto;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
}

.nav-badge--count {
  background: var(--accent);
}

/* MOBILE */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: 0 0 40px rgba(0,0,0,0.8);
  }
  .sidebar.open {
    transform: translateX(0);
  }
}
.sidebar-login-tip {
  margin: 10px 15px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  font-size: 11px;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 8px;
}
.lock-sm {
  margin-left: auto;
  font-size: 10px;
  color: var(--text3);
  opacity: 0.6;
}
</style>
