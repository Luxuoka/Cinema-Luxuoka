<template>
  <div class="static-page">
    <div class="page-container">
      <header class="page-header">
        <h1>Kebijakan Privasi</h1>
        <p>Terakhir diperbarui: 14 Mei 2026</p>
      </header>

      <section class="page-content">
        <div class="content-card">
          <h2>Informasi yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan informasi minimal untuk meningkatkan pengalaman Anda, termasuk data profil Google (saat login) dan riwayat tontonan lokal Anda.</p>
          
          <h2>Penggunaan Data</h2>
          <p>Data Anda digunakan secara eksklusif untuk fitur personalisasi seperti watchlist dan rekomendasi. Kami tidak menjual data Anda kepada pihak ketiga.</p>
          
          <h2>Cookies</h2>
          <p>Kami menggunakan cookies untuk menyimpan preferensi sesi dan tema Anda agar pengalaman browsing tetap konsisten.</p>

          <h2>Keamanan</h2>
          <p>Kami berkomitmen untuk menjaga keamanan data Anda melalui enkripsi dan praktik keamanan standar industri.</p>
        </div>
      </section>
    </div>
  </div>
</template>

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
  font-size: 14px;
}
.content-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  padding: 40px;
  border-radius: var(--radius);
}
.content-card h2 {
  color: var(--accent);
  font-size: 20px;
  margin: 30px 0 15px;
}
.content-card h2:first-child { margin-top: 0; }
.content-card p {
  color: var(--text2);
  line-height: 1.8;
  margin-bottom: 20px;
}
</style>
