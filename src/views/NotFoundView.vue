<template>
  <div class="not-found">
    <div class="content">
      <div class="glitch-wrapper">
        <h1 class="glitch" data-text="404">404</h1>
      </div>
      <h2>Oops! Filmnya Hilang di Dimensi Lain</h2>
      <p>Halaman yang Anda cari tidak ditemukan atau telah dipindahkan ke server rahasia.</p>
      
      <div class="actions">
        <router-link to="/" class="btn btn-primary">
          <i class="fas fa-home"></i> Kembali ke Beranda
        </router-link>
        <button @click="$router.back()" class="btn btn-outline">
          <i class="fas fa-arrow-left"></i> Kembali
        </button>
      </div>

      <div class="decorative">
        <i class="fas fa-film fa-spin-slow"></i>
        <i class="fas fa-rocket fa-bounce"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
}

.content {
  max-width: 600px;
}

h1 {
  font-size: 120px;
  font-weight: 900;
  margin: 0;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

h2 {
  font-size: 32px;
  margin: 20px 0 10px;
  color: var(--text-primary);
}

p {
  color: var(--text-muted);
  font-size: 18px;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-outline:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.decorative {
  margin-top: 60px;
  font-size: 40px;
  color: var(--border-color);
  display: flex;
  justify-content: center;
  gap: 40px;
}

.fa-spin-slow {
  animation: spin 5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  h1 { font-size: 80px; }
  h2 { font-size: 24px; }
  .actions { flex-direction: column; }
}
</style>
