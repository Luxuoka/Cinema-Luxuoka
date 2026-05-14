<template>
  <footer class="footer">
    <div class="footer-grid">
      <!-- BRAND -->
      <div class="footer-brand">
        <div class="footer-logo">Cinema<span>Luxuoka</span></div>
        <p>Platform streaming premium dengan ribuan konten terbaik dari seluruh dunia. Nikmati tanpa batas.</p>
        <div class="social-row">
          <a class="social-icon" href="#" title="Twitter / X" @click.prevent="toast('🐦 Twitter / X')">𝕏</a>
          <a class="social-icon" href="#" title="Facebook" @click.prevent="toast('📘 Facebook')">f</a>
          <a class="social-icon" href="https://www.instagram.com/" target="_blank" title="Instagram">📸</a>
          <a class="social-icon" href="https://wa.me/6281806080731" target="_blank" title="WhatsApp">💬</a>
          <a class="social-icon" href="#" title="YouTube" @click.prevent="toast('▶️ YouTube')">▶</a>
        </div>
      </div>

      <!-- NAVIGATION -->
      <div>
        <div class="footer-heading">Navigasi</div>
        <ul class="footer-links">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/trending">Trending</router-link></li>
          <li><router-link to="/movies">Movies</router-link></li>
          <li><router-link to="/series">TV Shows</router-link></li>
          <li><router-link to="/anime">Anime</router-link></li>
          <li><router-link to="/watchlist">Watchlist</router-link></li>
        </ul>
      </div>



      <!-- INFO -->
      <div>
        <div class="footer-heading">Info</div>
        <ul class="footer-links">
          <li><a @click.prevent="toast('ℹ️ Tentang CinemaLuxuoka')">Tentang Kami</a></li>
          <li><a @click.prevent="toast('🔒 Kebijakan Privasi')">Kebijakan Privasi</a></li>
          <li><a @click.prevent="toast('📋 Syarat & Ketentuan')">Syarat & Ketentuan</a></li>
          <li><a @click.prevent="toast('❓ FAQ')">FAQ</a></li>
          <li><a @click.prevent="toast('✉️ Hubungi kami')">Hubungi Kami</a></li>
          <li>
            <a href="https://wa.me/6281806080731?text=Halo%20Admin,%20tolong%20upload%20film%20[Judul]%20tahun%20[Tahun],%20terima%20kasih." target="_blank">
              Request Movie
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- FOOTER BOTTOM -->
    <div class="footer-bottom">
      <div class="footer-copy">© 2026 CinemaLuxuoka. All rights reserved.</div>
      <div class="footer-langs">
        <button class="lang-btn active">🇮🇩 ID</button>
        <button class="lang-btn" @click="toast('🌐 English version coming soon!')">🇬🇧 EN</button>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { inject } from 'vue'

const showToast = inject('toast', null)

function toast(msg) {
  if (showToast) showToast(msg, 'info')
}
</script>

<style scoped>
.footer {
  background: var(--bg2);
  border-top: 1px solid var(--border);
  padding: 40px 28px 28px;
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

/* BRAND */
.footer-brand p {
  font-size: 13px;
  color: var(--text3);
  line-height: 1.7;
  max-width: 220px;
  margin-top: 10px;
}

.footer-logo {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
}

.footer-logo span {
  color: var(--accent);
}

/* SOCIAL */
.social-row {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.social-icon {
  width: 34px;
  height: 34px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-decoration: none;
  color: var(--text2);
}

.social-icon:hover {
  background: var(--accent);
  border-color: transparent;
  color: #fff;
}

/* LINKS */
.footer-heading {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--text3);
  text-transform: uppercase;
  margin-bottom: 14px;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.footer-links a,
.footer-links li a {
  font-size: 13px;
  color: var(--text2);
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}

.footer-links a:hover,
.footer-links li a:hover {
  color: var(--text);
}

/* BOTTOM */
.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-copy {
  font-size: 12px;
  color: var(--text3);
}

.footer-langs {
  display: flex;
  gap: 8px;
}

.lang-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text2);
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-body);
}

.lang-btn.active,
.lang-btn:hover {
  background: var(--accent);
  color: #fff;
  border-color: transparent;
}

/* RESPONSIVE */
@media (max-width: 1100px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
