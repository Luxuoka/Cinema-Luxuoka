<template>
  <div class="drama-filter-container">
    <div class="filter-controls">
      <!-- Search Input -->
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          v-model="filters.query" 
          placeholder="Cari drama..." 
          @input="emitChange"
        />
      </div>
      
      <div class="dropdowns">
        <!-- Status Filter -->
        <div class="select-wrapper">
          <select v-model="filters.status" @change="emitChange">
            <option value="">Semua Status</option>
            <option value="ongoing">Sedang Tayang (Ongoing)</option>
            <option value="completed">Selesai (Completed)</option>
          </select>
        </div>

        <!-- Year Filter -->
        <div class="select-wrapper">
          <select v-model="filters.year" @change="emitChange">
            <option value="">Semua Tahun</option>
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <!-- Sort Filter -->
        <div class="select-wrapper">
          <select v-model="filters.sortBy" @change="emitChange">
            <option value="popularity">Populer</option>
            <option value="vote_average">Rating Tertinggi</option>
            <option value="first_air_date">Terbaru</option>
            <option value="first_air_date_asc">Terlama</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Genre List Chips -->
    <div class="genre-list" ref="genreList">
      <button 
        :class="['genre-btn', { active: filters.genre === '' }]"
        @click="selectGenre('')"
      >
        Semua Genre
      </button>
      <button 
        v-for="genre in genres" 
        :key="genre.id"
        :class="['genre-btn', { active: filters.genre === genre.id }]"
        @click="selectGenre(genre.id)"
      >
        {{ genre.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['filter-change'])

const filters = reactive({
  query: '',
  status: '',
  year: '',
  sortBy: 'popularity',
  genre: ''
})

const genres = [
  { id: 18, name: 'Drama / Romance' },
  { id: 10759, name: 'Action & Adventure' },
  { id: 35, name: 'Komedi' },
  { id: 9648, name: 'Misteri' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 80, name: 'Crime / Thriller' },
  { id: 10751, name: 'Keluarga' }
]

const years = Array.from({ length: 2027 - 2010 }, (_, i) => 2026 - i)

function selectGenre(genreId) {
  filters.genre = genreId
  emitChange()
}

let timeoutId = null
function emitChange() {
  if (timeoutId) clearTimeout(timeoutId)
  // Debounce search query a bit
  timeoutId = setTimeout(() => {
    emit('filter-change', { ...filters })
  }, 150)
}
</script>

<style scoped>
.drama-filter-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
  width: 100%;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text3);
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  background: var(--surface2);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: var(--accent);
  background: var(--surface3);
  box-shadow: 0 0 10px rgba(232, 54, 79, 0.15);
}

.dropdowns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.select-wrapper {
  position: relative;
  background: var(--surface2);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: var(--radius-md);
  padding: 0 12px;
  height: 46px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.select-wrapper:hover {
  background: var(--surface3);
  border-color: rgba(255,255,255,0.1);
}

.select-wrapper select {
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  padding-right: 15px;
  height: 100%;
}

/* GENRE CHIPS */
.genre-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
  scrollbar-width: none;
}

.genre-list::-webkit-scrollbar {
  display: none;
}

.genre-btn {
  padding: 8px 16px;
  background: var(--surface2);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px;
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s;
}

.genre-btn:hover {
  background: var(--surface3);
  color: var(--text);
  transform: translateY(-1px);
}

.genre-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(232, 54, 79, 0.3);
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: 100%;
  }
  .dropdowns {
    width: 100%;
  }
  .select-wrapper {
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }
  .select-wrapper select {
    width: 100%;
    text-align: center;
  }
}
</style>
