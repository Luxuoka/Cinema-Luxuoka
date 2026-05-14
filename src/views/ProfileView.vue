<template>
  <div class="profile-view">
    <div v-if="userState.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat profil...</p>
    </div>
    
    <div v-else-if="!userState.isLoggedIn" class="unauth-state">
      <i class="fas fa-user-circle"></i>
      <h2>Silakan Login</h2>
      <p>Anda harus login untuk mengakses pengaturan profil dan data Anda.</p>
    </div>

    <div v-else class="profile-container">
      <div class="profile-header">
        <img :src="userProfile.avatar" alt="Avatar" class="profile-avatar-large" />
        <div class="profile-info">
          <h1>{{ userProfile.username }}</h1>
          <p>{{ userProfile.email }}</p>
          <span class="join-date">Bergabung: {{ new Date(userProfile.joinDate).toLocaleDateString() }}</span>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Akun & Tampilan -->
        <div class="settings-card">
          <h3><i class="fas fa-paint-brush"></i> Tampilan</h3>
          <div class="setting-item">
            <div class="setting-label">Tema Aplikasi</div>
            <select v-model="currentTheme" @change="handleThemeChange">
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
            </select>
          </div>
        </div>

        <!-- Preferensi Tontonan -->
        <div class="settings-card">
          <h3><i class="fas fa-language"></i> Preferensi Subtitle</h3>
          <div class="setting-item">
            <div class="setting-label">Subtitle Default</div>
            <select>
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
              <option value="off">Mati</option>
            </select>
          </div>
          <p class="setting-note">*Preferensi ini akan diterapkan secara otomatis saat memutar video jika tersedia.</p>
        </div>

        <!-- Genre Favorit -->
        <div class="settings-card">
          <h3><i class="fas fa-heart"></i> Genre Favorit</h3>
          <div class="genre-selection">
            <button 
              v-for="genre in availableGenres" 
              :key="genre"
              :class="['genre-btn', { active: selectedGenres.includes(genre) }]"
              @click="toggleGenre(genre)"
            >
              {{ genre }}
            </button>
          </div>
          <button @click="saveGenres" class="btn btn-primary mt-4">Simpan Preferensi</button>
        </div>

        <!-- Data Management -->
        <div class="settings-card danger-zone">
          <h3><i class="fas fa-database"></i> Manajemen Data</h3>
          <div class="setting-item">
            <div class="setting-label">Hapus Riwayat Tontonan</div>
            <button class="btn btn-outline-danger">Hapus Riwayat</button>
          </div>
          <div class="setting-item">
            <div class="setting-label">Hapus Semua Watchlist</div>
            <button class="btn btn-outline-danger">Hapus Watchlist</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, inject } from 'vue'
import { userState, userProfile, setTheme, setFavoriteGenres } from '../stores/userStore'

const currentTheme = ref('dark')
const showToast = inject('toast')

const availableGenres = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 
  'Anime', 'Romance', 'Thriller', 'Mystery', 'Adventure'
]

const selectedGenres = ref([])

watchEffect(() => {
  if (userProfile.theme) {
    currentTheme.value = userProfile.theme
  }
  if (userProfile.favoriteGenres) {
    selectedGenres.value = [...userProfile.favoriteGenres]
  }
})

function handleThemeChange() {
  setTheme(currentTheme.value)
}

function toggleGenre(genre) {
  const index = selectedGenres.value.indexOf(genre)
  if (index > -1) {
    selectedGenres.value.splice(index, 1)
  } else {
    if (selectedGenres.value.length < 5) {
      selectedGenres.value.push(genre)
    } else {
      if (showToast) showToast('Maksimal 5 genre favorit', 'warning')
    }
  }
}

async function saveGenres() {
  await setFavoriteGenres(selectedGenres.value)
  if (showToast) showToast('Preferensi genre disimpan!', 'success')
}
</script>

<style scoped>
.profile-view {
  animation: fadeIn 0.4s ease;
  padding-bottom: 40px;
}
.loading-state, .unauth-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--text2);
}
.unauth-state i {
  font-size: 64px;
  color: var(--border2);
  margin-bottom: 16px;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--surface);
  padding: 32px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin-bottom: 32px;
}

.profile-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid var(--accent);
  object-fit: cover;
}

.profile-info h1 {
  font-size: 24px;
  margin-bottom: 4px;
}
.profile-info p {
  color: var(--text2);
  margin-bottom: 8px;
}
.join-date {
  font-size: 12px;
  background: var(--surface2);
  padding: 4px 10px;
  border-radius: 12px;
  color: var(--text3);
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.settings-card h3 {
  font-size: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--accent);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border2);
}
.setting-item:last-of-type {
  border-bottom: none;
}

.setting-label {
  font-weight: 500;
}

select {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border2);
  padding: 8px 12px;
  border-radius: 6px;
  outline: none;
  font-family: inherit;
}

.setting-note {
  font-size: 12px;
  color: var(--text3);
  margin-top: 12px;
  font-style: italic;
}

.danger-zone {
  border-color: rgba(232, 54, 79, 0.3);
}

.btn-outline-danger {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline-danger:hover {
  background: var(--accent);
  color: #fff;
}
.genre-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.genre-btn {
  background: var(--surface2);
  border: 1px solid var(--border2);
  color: var(--text2);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}
.genre-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}
.genre-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.mt-4 {
  margin-top: 20px;
}
</style>
