<template>
  <div class="static-page">
    <div class="page-container">
      <header class="page-header">
        <h1>Syarat & Ketentuan</h1>
        <p>Mohon baca ketentuan penggunaan kami dengan seksama.</p>
      </header>

      <section class="page-content">
        <div class="content-card">
          <h2>Penggunaan Layanan</h2>
          <p>Dengan mengakses CinemaLuxuoka, Anda setuju untuk menggunakan layanan ini hanya untuk tujuan pribadi dan non-komersial.</p>
          
          <h2>Konten</h2>
          <p>Semua konten yang tersedia di platform ini disediakan oleh penyedia pihak ketiga. CinemaLuxuoka tidak menyimpan file video di server kami sendiri.</p>
          
          <h2>Akun Pengguna</h2>
          <p>Anda bertanggung jawab untuk menjaga kerahasiaan akun Google Anda yang digunakan untuk login di platform ini.</p>

          <h2>Perubahan Layanan</h2>
          <p>Kami berhak untuk mengubah atau menghentikan bagian mana pun dari layanan kami kapan saja tanpa pemberitahuan sebelumnya.</p>
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
