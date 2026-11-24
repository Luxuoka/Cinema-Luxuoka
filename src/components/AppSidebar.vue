<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <!-- LOGO -->
    <div class="logo">
      <img src="../assets/logo.png" alt="Cinema Luxuoka Logo" class="logo-image-src" width="36" height="36" decoding="async" />
      <div class="logo-text">Cinema<span>Luxuoka</span></div>
    </div>

    <!-- MENU -->
    <div class="sidebar-section-label">Menu</div>
    <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
      <i class="fas fa-house nav-icon-fa"></i>
      Home
    </router-link>
    <router-link to="/trending" class="nav-item" :class="{ active: $route.path === '/trending' }">
      <i class="fas fa-rocket nav-icon-fa"></i>
      Trending
      <span class="nav-badge">Hot</span>
    </router-link>

    <!-- KATEGORI -->
    <div class="sidebar-section-label">Kategori</div>
    <router-link to="/movies" class="nav-item" :class="{ active: $route.path === '/movies' }">
      <i class="fas fa-clapperboard nav-icon-fa"></i>
      Movies
    </router-link>
    <router-link to="/series" class="nav-item" :class="{ active: $route.path === '/series' }">
      <i class="fas fa-tv nav-icon-fa"></i>
      TV Shows
    </router-link>
    <router-link to="/anime" class="nav-item" :class="{ active: $route.path === '/anime' }">
      <i class="fab fa-bilibili nav-icon-fa"></i>
      Anime
    </router-link>

    <!-- Collapsible Drama sub-menu -->
    <div class="drama-collapse-wrapper">
      <div 
        class="nav-item cursor-pointer" 
        :class="{ active: $route.path.startsWith('/drama') }"
        @click="toggleDramaMenu"
      >
        <i class="fas fa-globe nav-icon-fa"></i>
        <span>Drama Asia</span>
        <i class="fas fa-chevron-down fold-arrow" :class="{ rotated: isDramaExpanded }"></i>
      </div>
      <div v-show="isDramaExpanded" class="sub-nav-list">
        <router-link to="/drama" class="sub-nav-item" :class="{ active: $route.path === '/drama' }">
          <span class="sub-nav-bullet"></span> Hub Drama Asia
        </router-link>
        <router-link to="/drama/korea" class="sub-nav-item" :class="{ active: $route.path === '/drama/korea' }">
          <span>🇰🇷</span> Drama Korea
        </router-link>
        <router-link to="/drama/china" class="sub-nav-item" :class="{ active: $route.path === '/drama/china' }">
          <span>🇨🇳</span> Drama China
        </router-link>
        <router-link to="/drama/jepang" class="sub-nav-item" :class="{ active: $route.path === '/drama/jepang' }">
          <span>🇯🇵</span> Drama Jepang
        </router-link>
        <router-link to="/drama/thailand" class="sub-nav-item" :class="{ active: $route.path === '/drama/thailand' }">
          <span>🇹🇭</span> Drama Thailand
        </router-link>
      </div>
    </div>

    <a
      href="https://wa.me/6281806080731?text=Halo%20Admin,%20tolong%20tambahkan%20film%20[Judul]%20tahun%20[Tahun],%20terima%20kasih."
      target="_blank"
      class="nav-item"
    >
      <i class="fab fa-whatsapp nav-icon-fa" style="color:#25D366"></i>
      Request Movie
    </a>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const isDramaExpanded = ref(false)

function toggleDramaMenu() {
  isDramaExpanded.value = !isDramaExpanded.value
}

// Auto-expand if active route is a drama route
watch(() => route.path, (newPath) => {
  if (newPath && newPath.startsWith('/drama')) {
    isDramaExpanded.value = true
  }
}, { immediate: true })
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

.logo-image-src {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 8px;
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

.nav-icon-fa {
  width: 18px;
  font-size: 16px;
  text-align: center;
  flex-shrink: 0;
  opacity: 0.7;
  transition: all 0.2s;
}

.nav-item.active .nav-icon,
.nav-item:hover .nav-icon,
.nav-item.active .nav-icon-fa,
.nav-item:hover .nav-icon-fa {
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

@media (max-width: 480px) {
  .sidebar {
    width: 280px;
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

/* DRAMA SUBMENU */
.cursor-pointer {
  cursor: pointer;
}

.drama-collapse-wrapper {
  display: flex;
  flex-direction: column;
}

.fold-arrow {
  margin-left: auto;
  font-size: 11px;
  transition: transform 0.3s;
  opacity: 0.7;
}

.fold-arrow.rotated {
  transform: rotate(180deg);
}

.sub-nav-list {
  display: flex;
  flex-direction: column;
  padding-left: 28px;
  margin-bottom: 6px;
  animation: slideDown 0.25s ease;
}

.sub-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  margin: 1px 8px 1px 0;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text3);
  font-size: 13px;
  text-decoration: none;
}

.sub-nav-item:hover {
  background: var(--surface);
  color: var(--text);
}

.sub-nav-item.active {
  background: rgba(232, 54, 79, 0.08);
  color: var(--accent);
  font-weight: 500;
}

.sub-nav-bullet {
  width: 4px;
  height: 4px;
  background: var(--text3);
  border-radius: 50%;
  display: inline-block;
}

.sub-nav-item.active .sub-nav-bullet {
  background: var(--accent);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
