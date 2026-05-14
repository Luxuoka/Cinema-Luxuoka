<template>
  <div class="static-page">
    <div class="page-container">
      <header class="page-header">
        <h1>Tentang CinemaLuxuoka</h1>
        <p>Kenali lebih jauh tentang platform streaming premium pilihan Anda.</p>
      </header>

      <section class="page-content">
        <div class="content-card">
          <h2>Visi & Misi</h2>
          <p>CinemaLuxuoka hadir untuk memberikan pengalaman menonton film, TV series, dan anime terbaik dengan kualitas HD secara gratis dan mudah diakses oleh semua orang.</p>
          
          <h2>Teknologi Kami</h2>
          <p>Kami menggunakan infrastruktur streaming modern untuk memastikan pemutaran video yang lancar dengan kompresi data yang efisien, sehingga Anda dapat menikmati konten favorit tanpa buffering yang mengganggu.</p>
          
          <h2>Komunitas</h2>
          <p>Kami percaya pada kekuatan komunitas. Itulah sebabnya kami menyediakan fitur riwayat tontonan, watchlist, dan sistem rekomendasi pintar yang menyesuaikan dengan selera unik Anda.</p>
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
  font-size: 18px;
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
@media (max-width: 768px) {
  .page-header h1 { font-size: 36px; }
  .content-card { padding: 24px; }
}
</style>
