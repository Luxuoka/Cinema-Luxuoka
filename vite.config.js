import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    sitemap({
      hostname: 'https://cinema-luxuoka.vercel.app'
    })
  ],
  server: {
    proxy: {
      '/api/mal': {
        target: 'https://api.myanimelist.net/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mal/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-MAL-CLIENT-ID', '40987');
          });
        }
      }
    }
  }
})