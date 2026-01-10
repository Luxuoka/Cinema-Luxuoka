<template>
  <div class="profile-view">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-avatar" @click="changeAvatar">
        <img :src="userProfile.avatar" alt="Avatar" />
        <div class="avatar-edit">
          <i class="fas fa-camera"></i>
        </div>
      </div>
      
      <div class="profile-info">
        <div class="username-section">
          <input 
            v-if="editingName" 
            v-model="tempUsername" 
            @blur="saveName"
            @keyup.enter="saveName"
            class="username-input"
            ref="usernameInput"
          />
          <h1 v-else @click="startEditName">
            {{ userProfile.username }}
            <i class="fas fa-pen edit-icon"></i>
          </h1>
        </div>
        <p class="member-since">Member since {{ formatDate(userProfile.joinDate) }}</p>
      </div>
      
      <div class="theme-toggle">
        <button @click="handleToggleTheme" class="theme-btn">
          <i :class="userProfile.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
          {{ userProfile.theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-list"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">In Watchlist</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon watching"><i class="fas fa-play"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.watching }}</span>
          <span class="stat-label">Watching</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon completed"><i class="fas fa-check"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.completed }}</span>
          <span class="stat-label">Completed</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon history"><i class="fas fa-history"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.historyCount }}</span>
          <span class="stat-label">Watched</span>
        </div>
      </div>
    </div>

    <!-- Content Breakdown -->
    <div class="section">
      <h2 class="section-title"><i class="fas fa-chart-pie"></i> Content Breakdown</h2>
      <div class="breakdown-grid">
        <div class="breakdown-card anime">
          <i class="fas fa-dragon"></i>
          <span class="breakdown-count">{{ stats.animeCount }}</span>
          <span class="breakdown-label">Anime</span>
        </div>
        <div class="breakdown-card movies">
          <i class="fas fa-film"></i>
          <span class="breakdown-count">{{ stats.movieCount }}</span>
          <span class="breakdown-label">Movies</span>
        </div>
        <div class="breakdown-card series">
          <i class="fas fa-tv"></i>
          <span class="breakdown-count">{{ stats.seriesCount }}</span>
          <span class="breakdown-label">TV Series</span>
        </div>
      </div>
    </div>

    <!-- Favorite Genres -->
    <div class="section">
      <h2 class="section-title"><i class="fas fa-tags"></i> Favorite Genres</h2>
      <div v-if="stats.favoriteGenres.length" class="genre-chips">
        <span v-for="genre in stats.favoriteGenres" :key="genre" class="genre-chip">
          {{ genre }}
        </span>
      </div>
      <p v-else class="empty-message">
        Start watching content to see your favorite genres!
      </p>
    </div>

    <!-- Achievements -->
    <div class="section">
      <h2 class="section-title"><i class="fas fa-trophy"></i> Achievements</h2>
      <div class="achievements-grid">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          :class="['achievement-card', { unlocked: achievement.unlocked }]"
        >
          <div class="achievement-icon">
            <i :class="achievement.icon"></i>
          </div>
          <div class="achievement-info">
            <h4>{{ achievement.title }}</h4>
            <p>{{ achievement.description }}</p>
          </div>
          <div v-if="achievement.unlocked" class="achievement-badge">
            <i class="fas fa-check"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="quick-links">
      <router-link to="/watchlist" class="quick-link">
        <i class="fas fa-bookmark"></i>
        <span>My Watchlist</span>
      </router-link>
      <router-link to="/" class="quick-link">
        <i class="fas fa-compass"></i>
        <span>Discover</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { userProfile, getUserStats, toggleTheme } from '../stores/userStore'

const editingName = ref(false)
const tempUsername = ref('')
const usernameInput = ref(null)

const stats = computed(() => getUserStats())

const achievements = computed(() => [
  {
    id: 'first_add',
    title: 'First Step',
    description: 'Add your first item to watchlist',
    icon: 'fas fa-bookmark',
    unlocked: stats.value.total >= 1
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Add 10 items to watchlist',
    icon: 'fas fa-layer-group',
    unlocked: stats.value.total >= 10
  },
  {
    id: 'first_complete',
    title: 'Finisher',
    description: 'Complete your first title',
    icon: 'fas fa-flag-checkered',
    unlocked: stats.value.completed >= 1
  },
  {
    id: 'binge_watcher',
    title: 'Binge Watcher',
    description: 'Complete 5 titles',
    icon: 'fas fa-couch',
    unlocked: stats.value.completed >= 5
  },
  {
    id: 'anime_lover',
    title: 'Anime Lover',
    description: 'Add 5 anime to watchlist',
    icon: 'fas fa-dragon',
    unlocked: stats.value.animeCount >= 5
  },
  {
    id: 'movie_buff',
    title: 'Movie Buff',
    description: 'Add 5 movies to watchlist',
    icon: 'fas fa-film',
    unlocked: stats.value.movieCount >= 5
  }
])

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

function startEditName() {
  tempUsername.value = userProfile.username
  editingName.value = true
  nextTick(() => {
    usernameInput.value?.focus()
  })
}

function saveName() {
  if (tempUsername.value.trim()) {
    userProfile.username = tempUsername.value.trim()
  }
  editingName.value = false
}

function changeAvatar() {
  const seeds = ['felix', 'aneka', 'zoe', 'jack', 'luna', 'max', 'mia', 'sam']
  const randomSeed = seeds[Math.floor(Math.random() * seeds.length)]
  userProfile.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`
}

function handleToggleTheme() {
  toggleTheme()
}
</script>

<style scoped>
.profile-view {
  animation: fadeIn 0.5s ease;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.profile-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.profile-avatar:hover .avatar-edit {
  opacity: 1;
}

.avatar-edit i {
  color: white;
  font-size: 1.5rem;
}

.profile-info {
  flex: 1;
}

.username-section h1 {
  font-size: var(--font-2xl);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.edit-icon {
  font-size: var(--font-sm);
  color: var(--text-muted);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.username-section h1:hover .edit-icon {
  opacity: 1;
}

.username-input {
  font-size: var(--font-2xl);
  font-weight: 700;
  background: var(--bg-tertiary);
  border: 2px solid var(--accent-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--text-primary);
  outline: none;
}

.member-since {
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
}

.theme-toggle {
  flex-shrink: 0;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.theme-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-size: 1.25rem;
}

.stat-icon.watching { background: linear-gradient(135deg, #3498db, #2ecc71); }
.stat-icon.completed { background: linear-gradient(135deg, #2ecc71, #27ae60); }
.stat-icon.history { background: linear-gradient(135deg, #9b59b6, #8e44ad); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-2xl);
  font-weight: 700;
}

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-muted);
}

/* Section */
.section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-title i {
  color: var(--accent-primary);
}

/* Breakdown */
.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.breakdown-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
}

.breakdown-card i {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
}

.breakdown-card.anime i { color: #e74c3c; }
.breakdown-card.movies i { color: #f39c12; }
.breakdown-card.series i { color: #3498db; }

.breakdown-count {
  font-size: var(--font-2xl);
  font-weight: 700;
}

.breakdown-label {
  font-size: var(--font-sm);
  color: var(--text-muted);
}

/* Genre Chips */
.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.genre-chip {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--accent-gradient);
  color: var(--bg-primary);
  border-radius: var(--radius-xl);
  font-size: var(--font-sm);
  font-weight: 500;
}

.empty-message {
  color: var(--text-muted);
  font-style: italic;
}

/* Achievements */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  opacity: 0.5;
  filter: grayscale(1);
  transition: all var(--transition-normal);
}

.achievement-card.unlocked {
  opacity: 1;
  filter: none;
  border-color: var(--accent-primary);
}

.achievement-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-muted);
}

.achievement-card.unlocked .achievement-icon {
  background: var(--accent-gradient);
  color: var(--bg-primary);
}

.achievement-info h4 {
  margin: 0 0 4px 0;
  font-size: var(--font-md);
}

.achievement-info p {
  margin: 0;
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.achievement-badge {
  margin-left: auto;
  width: 24px;
  height: 24px;
  background: #2ecc71;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* Quick Links */
.quick-links {
  display: flex;
  gap: var(--spacing-md);
}

.quick-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-normal);
}

.quick-link:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.quick-link i {
  font-size: 1.25rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .breakdown-grid {
    grid-template-columns: 1fr;
  }
}


</style>
