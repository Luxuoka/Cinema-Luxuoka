<template>
  <div class="static-page">
    <div class="page-container">
      <header class="page-header">
        <h1>FAQ</h1>
        <p>Pertanyaan yang sering diajukan seputar CinemaLuxuoka.</p>
      </header>

      <section class="page-content">
        <div class="faq-list">
          <div v-for="(item, index) in faqs" :key="index" class="faq-item" :class="{ active: activeIndex === index }">
            <button class="faq-question" @click="toggle(index)">
              {{ item.q }}
              <i class="fas" :class="activeIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            <div class="faq-answer" v-if="activeIndex === index">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeIndex = ref(null)

const faqs = [
  { q: 'Apakah CinemaLuxuoka gratis?', a: 'Ya, semua konten di CinemaLuxuoka dapat dinikmati secara gratis tanpa biaya berlangganan.' },
  { q: 'Bagaimana cara menyimpan film favorit?', a: 'Anda perlu login menggunakan akun Google, lalu klik ikon "+" (Plus) pada halaman detail film untuk menambahkannya ke Watchlist.' },
  { q: 'Mengapa video tidak bisa diputar?', a: 'Pastikan koneksi internet Anda stabil. Jika masih tidak bisa, coba ganti server melalui menu "Server Selector" di bawah video player.' },
  { q: 'Bagaimana cara request film baru?', a: 'Anda bisa klik link "Request Movie" di footer dan mengisi formulir yang tersedia.' },
  { q: 'Apakah ada aplikasi mobile?', a: 'Saat ini CinemaLuxuoka tersedia dalam versi web yang responsif dan dapat diakses melalui browser di HP Anda.' }
]

function toggle(index) {
  activeIndex.value = activeIndex.value === index ? null : index
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
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.faq-item {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.3s ease;
}
.faq-item.active {
  border-color: var(--accent);
}
.faq-question {
  width: 100%;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}
.faq-answer {
  padding: 0 24px 24px;
  color: var(--text2);
  line-height: 1.6;
  font-size: 15px;
  animation: slideDown 0.3s ease-out;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
