import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import { initTheme } from './stores/userStore'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Initialize theme from localStorage
initTheme()
