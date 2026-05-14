<template>
  <div class="static-page">
    <div class="page-container">
      <header class="page-header">
        <h1>Request Movie</h1>
        <p>Film favoritmu belum ada? Beritahu kami, kami akan segera mengupayakannya.</p>
      </header>

      <section class="page-content">
        <div class="request-card">
          <form class="request-form" @submit.prevent="submit">
            <div class="form-group">
              <label>Judul Film / Series</label>
              <input type="text" placeholder="Contoh: Spider-Man: No Way Home" required />
            </div>
            <div class="form-group">
              <label>Tahun Rilis (Opsional)</label>
              <input type="number" placeholder="Contoh: 2021" />
            </div>
            <div class="form-group">
              <label>Link TMDB / IMDb (Opsional)</label>
              <input type="url" placeholder="https://www.themoviedb.org/movie/..." />
            </div>
            <div class="form-group">
              <label>Pesan Tambahan</label>
              <textarea placeholder="Ada pesan khusus? Contoh: Minta kualitas 4K ya min." rows="4"></textarea>
            </div>
            <button type="submit" class="btn btn-primary submit-btn">Kirim Request</button>
          </form>
          
          <div class="request-info">
            <h3><i class="fas fa-info-circle"></i> Catatan</h3>
            <ul>
              <li>Kami memprioritaskan film/series yang paling banyak di-request.</li>
              <li>Proses upload biasanya memakan waktu 1-3 hari kerja.</li>
              <li>Pastikan judul film sudah benar agar kami lebih mudah mencarinya.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
const showToast = inject('toast')

function submit() {
  if (showToast) showToast('Request Anda telah kami terima!', 'success')
}
</script>

<style scoped>
.static-page {
  padding: 80px 28px;
  min-height: 80vh;
}
.page-container {
  max-width: 800px;
  margin: 0 auto;
}
.page-header {
  text-align: center;
  margin-bottom: 60px;
}
.page-header h1 {
  font-family: var(--font-display);
  font-size: 48px;
  color: var(--text);
  margin-bottom: 12px;
}
.page-header p {
  color: var(--text3);
  font-size: 18px;
}
.request-card {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.request-form {
  background: var(--bg2);
  border: 1px solid var(--border);
  padding: 32px;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
}
.form-group input, .form-group textarea {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius-sm);
  padding: 12px;
  color: var(--text);
  font-family: var(--font-body);
  outline: none;
}
.form-group input:focus, .form-group textarea:focus {
  border-color: var(--accent);
}
.submit-btn {
  padding: 14px;
  font-weight: 700;
}
.request-info {
  background: rgba(232, 54, 79, 0.05);
  border: 1px solid rgba(232, 54, 79, 0.1);
  padding: 24px;
  border-radius: var(--radius);
}
.request-info h3 {
  font-size: 16px;
  color: var(--accent);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.request-info ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.request-info li {
  font-size: 14px;
  color: var(--text2);
  position: relative;
  padding-left: 18px;
}
.request-info li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--accent);
}
</style>
