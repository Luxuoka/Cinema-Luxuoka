<template>
  <footer class="footer">
    <div class="footer-grid">
      <!-- BRAND -->
      <div class="footer-brand">
        <div class="footer-logo">Cinema<span>Luxuoka</span></div>
        <p>Platform streaming kualitas premium dengan ribuan konten terbaik dari seluruh dunia. Nikmati tanpa batas.</p>
        <div class="social-row">
          <a class="social-icon" href="https://instagram.com/luxuoka" target="_blank" title="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
          <a class="social-icon" href="https://wa.me/6281806080731" target="_blank" title="WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>

      <!-- NAVIGATION -->
      <div>
        <div class="footer-heading">Navigasi</div>
        <ul class="footer-links">
          <li><router-link to="/"><i class="fas fa-house footer-icon-fa"></i> Home</router-link></li>
          <li><router-link to="/trending"><i class="fas fa-rocket footer-icon-fa"></i> Trending</router-link></li>
          <li><router-link to="/movies"><i class="fas fa-clapperboard footer-icon-fa"></i> Movies</router-link></li>
          <li><router-link to="/series"><i class="fas fa-tv footer-icon-fa"></i> TV Shows</router-link></li>
          <li><router-link to="/anime"><i class="fab fa-bilibili footer-icon-fa"></i> Anime</router-link></li>
          <li><router-link to="/watchlist"><i class="fas fa-bookmark footer-icon-fa"></i> Watchlist</router-link></li>
        </ul>
      </div>

      <!-- INFO -->
      <div>
        <div class="footer-heading">Info</div>
        <ul class="footer-links">
          <li><router-link to="/about">Tentang Kami</router-link></li>
          <li><router-link to="/privacy">Kebijakan Privasi</router-link></li>
          <li><router-link to="/terms">Syarat & Ketentuan</router-link></li>
          <li><router-link to="/faq">FAQ</router-link></li>
          <li><router-link to="/contact">Hubungi Kami</router-link></li>
          <li>
            <router-link to="/request">
              <i class="fab fa-whatsapp footer-icon-fa" style="color:#25D366"></i> 
              Request Movie
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- FOOTER BOTTOM -->
    <div class="footer-bottom">
      <div class="footer-copy">© 2026 CinemaLuxuoka. All rights reserved.</div>
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

.footer-icon-fa {
  width: 18px;
  margin-right: 6px;
  font-size: 14px;
  text-align: center;
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
