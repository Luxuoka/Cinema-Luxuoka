<template>
  <div class="static-page">
    <div class="page-container">
      <header class="page-header">
        <h1>Hubungi Kami</h1>
        <p>Punya pertanyaan atau masukan? Kami siap mendengar Anda.</p>
      </header>

      <section class="page-content">
        <div class="contact-grid">
          <div class="contact-info">
            <div class="info-card">
              <i class="fas fa-envelope"></i>
              <h3>Email</h3>
              <p>cikalidcamp@gmail.com</p>
            </div>
            <div class="info-card">
              <i class="fab fa-whatsapp"></i>
              <h3>WhatsApp</h3>
              <p>+62 818-0608-0731</p>
            </div>
          </div>

          <form class="contact-form" @submit.prevent="submit">
            <div class="form-group">
              <label>Nama</label>
              <input type="text" placeholder="Nama lengkap Anda" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" placeholder="alamat@email.com" required />
            </div>
            <div class="form-group">
              <label>Pesan</label>
              <textarea placeholder="Tuliskan pesan Anda di sini..." rows="5" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary submit-btn">Kirim Pesan</button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
const showToast = inject('toast')

function submit() {
  if (showToast) showToast('Pesan Anda berhasil dikirim!', 'success')
}
</script>

<style scoped>
.static-page {
  padding: 80px 28px;
  min-height: 80vh;
}
.page-container {
  max-width: 900px;
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
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
}
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  padding: 24px;
  border-radius: var(--radius);
  text-align: center;
}
.info-card i {
  font-size: 24px;
  color: var(--accent);
  margin-bottom: 12px;
}
.info-card h3 {
  font-size: 14px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.info-card p {
  font-size: 16px;
  color: var(--text);
  font-weight: 600;
}
.contact-form {
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
@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr; }
}
</style>
