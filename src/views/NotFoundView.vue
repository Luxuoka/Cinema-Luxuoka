<template>
  <div class="not-found">
    <div class="glow-orb"></div>
    <div class="content">
      <div class="glitch-wrapper">
        <h1 class="glitch" data-text="404">404</h1>
      </div>
      <h2>Oops! Filmnya Hilang di Dimensi Lain</h2>
      <p>Halaman yang Anda cari tidak ditemukan atau telah dipindahkan ke server Cinema Luxuoka.</p>
      
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
        <i class="fas fa-video"></i>
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
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  top: 40%; left: 50%;
  transform: translate(-50%, -50%);
  width: 350px; height: 350px;
  background: var(--accent);
  filter: blur(140px);
  opacity: 0.12;
  border-radius: 50%;
  pointer-events: none;
}

.content {
  max-width: 600px;
  z-index: 2;
}

.glitch-wrapper {
  margin-bottom: 20px;
}

.glitch {
  font-size: 130px;
  font-weight: 900;
  margin: 0;
  line-height: 1;
  position: relative;
  color: #fff;
  text-shadow: 0.05em 0 0 rgba(232, 54, 79, 0.75),
    -0.025em -0.05em 0 rgba(0, 230, 246, 0.75),
    0.025em 0.05em 0 rgba(255, 0, 193, 0.75);
  animation: glitch 500ms infinite;
}

.glitch span {
  position: absolute;
  top: 0; left: 0;
}

@keyframes glitch {
  0% {
    text-shadow: 0.05em 0 0 rgba(232, 54, 79, 0.75),
      -0.025em -0.05em 0 rgba(0, 230, 246, 0.75),
      0.025em 0.05em 0 rgba(255, 0, 193, 0.75);
  }
  14% {
    text-shadow: 0.05em 0 0 rgba(232, 54, 79, 0.75),
      -0.025em -0.05em 0 rgba(0, 230, 246, 0.75),
      0.025em 0.05em 0 rgba(255, 0, 193, 0.75);
  }
  15% {
    text-shadow: -0.05em -0.025em 0 rgba(232, 54, 79, 0.75),
      0.025em 0.025em 0 rgba(0, 230, 246, 0.75),
      -0.05em -0.05em 0 rgba(255, 0, 193, 0.75);
  }
  49% {
    text-shadow: -0.05em -0.025em 0 rgba(232, 54, 79, 0.75),
      0.025em 0.025em 0 rgba(0, 230, 246, 0.75),
      -0.05em -0.05em 0 rgba(255, 0, 193, 0.75);
  }
  50% {
    text-shadow: 0.025em 0.05em 0 rgba(232, 54, 79, 0.75),
      0.05em 0.025em 0 rgba(0, 230, 246, 0.75),
      0.025em -0.05em 0 rgba(255, 0, 193, 0.75);
  }
  99% {
    text-shadow: 0.025em 0.05em 0 rgba(232, 54, 79, 0.75),
      0.05em 0.025em 0 rgba(0, 230, 246, 0.75),
      0.025em -0.05em 0 rgba(255, 0, 193, 0.75);
  }
  100% {
    text-shadow: -0.025em 0 0 rgba(232, 54, 79, 0.75),
      -0.025em -0.025em 0 rgba(0, 230, 246, 0.75),
      -0.025em -0.05em 0 rgba(255, 0, 193, 0.75);
  }
}

h2 {
  font-size: 28px;
  font-weight: 800;
  margin: 20px 0 10px;
  color: #fff;
}

p {
  color: var(--text2);
  font-size: 15px;
  margin-bottom: 32px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-primary {
  background: var(--accent-gradient);
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba(232, 54, 79, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(232, 54, 79, 0.45);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(232, 54, 79, 0.05);
}

.decorative {
  margin-top: 50px;
  font-size: 32px;
  color: var(--border2);
  display: flex;
  justify-content: center;
  gap: 30px;
}

.fa-spin-slow {
  animation: spin 8s linear infinite;
}

.fa-bounce {
  animation: bounce 2s infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@media (max-width: 768px) {
  .glitch { font-size: 90px; }
  h2 { font-size: 22px; }
  .actions { flex-direction: column; align-items: stretch; }
  .btn { justify-content: center; }
}
</style>
