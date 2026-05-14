<template>
  <div class="login-required-view">
    <div class="locked-card">
      <div class="locked-icon">
        <i class="fas fa-lock"></i>
      </div>
      <h1>Fitur Eksklusif Pengguna</h1>
      <p>
        Halaman <b>{{ pageName }}</b> hanya tersedia untuk pengguna terdaftar. 
        Daftar sekarang gratis untuk menikmati seluruh konten Cinema Luxuoka tanpa batas!
      </p>
      
      <div class="benefits-list">
        <div class="benefit">
          <i class="fas fa-check-circle"></i>
          <span>Simpan Watchlist & History</span>
        </div>
        <div class="benefit">
          <i class="fas fa-check-circle"></i>
          <span>Akses Koleksi Anime & TV Show</span>
        </div>
        <div class="benefit">
          <i class="fas fa-check-circle"></i>
          <span>Lanjutkan Nonton di Mana Saja</span>
        </div>
      </div>

      <button @click="handleLogin" class="btn btn-primary login-btn">
        <i class="fab fa-google"></i> Login dengan Google
      </button>
      
      <router-link to="/" class="back-link">Kembali ke Beranda</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { loginUser } from '../stores/userStore'

const route = useRoute()

const pageName = computed(() => {
  const path = route.query.redirect || ''
  if (path.includes('watchlist')) return 'Watchlist'
  if (path.includes('anime')) return 'Anime'
  if (path.includes('series')) return 'TV Show'
  if (path.includes('history')) return 'History'
  return 'Premium'
})

async function handleLogin() {
  await loginUser()
  // The userStore handles the redirect or the user can manually navigate
}
</script>

<style scoped>
.login-required-view {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.5s ease;
}

.locked-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  padding: 50px 40px;
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.locked-icon {
  width: 80px;
  height: 80px;
  background: rgba(232, 54, 79, 0.1);
  color: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 30px;
}

h1 { font-size: 28px; font-weight: 800; margin-bottom: 15px; color: #fff; }
p { color: var(--text2); line-height: 1.6; margin-bottom: 30px; }

.benefits-list {
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 35px;
  text-align: left;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--text);
}
.benefit:last-child { margin-bottom: 0; }
.benefit i { color: var(--accent); font-size: 16px; }

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back-link {
  display: block;
  color: var(--text3);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}
.back-link:hover { color: #fff; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
