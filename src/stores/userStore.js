// User Store - State Management with localStorage
// Cinema Luxuoka - User data, watchlist, and preferences

import { reactive, watch } from 'vue'

// Load from localStorage or use defaults
function loadFromStorage(key, defaultValue) {
    try {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : defaultValue
    } catch {
        return defaultValue
    }
}

// Save to localStorage
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.error('Failed to save to localStorage:', e)
    }
}

// ============ USER PROFILE ============

export const userProfile = reactive(loadFromStorage('cinema_user_profile', {
    username: 'Guest User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
    joinDate: new Date().toISOString(),
    theme: 'dark'
}))

// Watch and save profile changes
watch(userProfile, (newVal) => {
    saveToStorage('cinema_user_profile', newVal)
}, { deep: true })

// ============ WATCHLIST ============

// Status options: 'planned', 'watching', 'completed'
export const watchlist = reactive(loadFromStorage('cinema_watchlist', []))

// Add to watchlist
export function addToWatchlist(item, status = 'planned') {
    const existing = watchlist.find(w => w.id === item.id && w.type === item.type)
    if (existing) {
        existing.status = status
        existing.updatedAt = new Date().toISOString()
    } else {
        watchlist.push({
            id: item.id,
            type: item.type, // 'movie', 'series', 'anime'
            title: item.title,
            poster: item.poster,
            rating: item.rating,
            year: item.year,
            status: status,
            currentEpisode: 0,
            totalEpisodes: item.episodes || item.seasons || null,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })
    }
    saveToStorage('cinema_watchlist', watchlist)
}

// Remove from watchlist
export function removeFromWatchlist(id, type) {
    const index = watchlist.findIndex(w => w.id === id && w.type === type)
    if (index > -1) {
        watchlist.splice(index, 1)
        saveToStorage('cinema_watchlist', watchlist)
    }
}

// Check if in watchlist
export function isInWatchlist(id, type) {
    return watchlist.some(w => w.id === id && w.type === type)
}

// Get watchlist item
export function getWatchlistItem(id, type) {
    return watchlist.find(w => w.id === id && w.type === type)
}

// Update watchlist item status
export function updateWatchlistStatus(id, type, status) {
    const item = watchlist.find(w => w.id === id && w.type === type)
    if (item) {
        item.status = status
        item.updatedAt = new Date().toISOString()
        saveToStorage('cinema_watchlist', watchlist)
    }
}

// Update episode progress
export function updateEpisodeProgress(id, type, episode) {
    const item = watchlist.find(w => w.id === id && w.type === type)
    if (item) {
        item.currentEpisode = episode
        item.updatedAt = new Date().toISOString()
        if (item.totalEpisodes && episode >= item.totalEpisodes) {
            item.status = 'completed'
        } else if (episode > 0 && item.status === 'planned') {
            item.status = 'watching'
        }
        saveToStorage('cinema_watchlist', watchlist)
    }
}

// Get watchlist by status
export function getWatchlistByStatus(status) {
    if (!status || status === 'all') return watchlist
    return watchlist.filter(w => w.status === status)
}

// ============ WATCH HISTORY ============

export const watchHistory = reactive(loadFromStorage('cinema_watch_history', []))

// Add to watch history
export function addToHistory(item) {
    // Remove if already exists (to move to top)
    const existingIndex = watchHistory.findIndex(h => h.id === item.id && h.type === item.type)
    if (existingIndex > -1) {
        watchHistory.splice(existingIndex, 1)
    }

    // Add to beginning
    watchHistory.unshift({
        id: item.id,
        type: item.type,
        title: item.title,
        poster: item.poster,
        watchedAt: new Date().toISOString()
    })

    // Keep only last 20 items
    if (watchHistory.length > 20) {
        watchHistory.pop()
    }

    saveToStorage('cinema_watch_history', watchHistory)
}

// Get continue watching (recent items)
export function getContinueWatching(limit = 5) {
    return watchHistory.slice(0, limit)
}

// ============ USER RATINGS ============

export const userRatings = reactive(loadFromStorage('cinema_user_ratings', {}))

// Rate content
export function rateContent(id, type, rating, review = '') {
    const key = `${type}_${id}`
    userRatings[key] = {
        rating,
        review,
        ratedAt: new Date().toISOString()
    }
    saveToStorage('cinema_user_ratings', userRatings)
}

// Get user rating
export function getUserRating(id, type) {
    const key = `${type}_${id}`
    return userRatings[key] || null
}

// ============ GENRE PREFERENCES ============

export const genreStats = reactive(loadFromStorage('cinema_genre_stats', {}))

// Track genre interaction
export function trackGenreInteraction(genres) {
    if (!genres || !Array.isArray(genres)) return

    genres.forEach(genre => {
        if (!genreStats[genre]) {
            genreStats[genre] = 0
        }
        genreStats[genre]++
    })

    saveToStorage('cinema_genre_stats', genreStats)
}

// Get favorite genres
export function getFavoriteGenres(limit = 5) {
    const sorted = Object.entries(genreStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([genre]) => genre)
    return sorted
}

// ============ STATISTICS ============

export function getUserStats() {
    const completed = watchlist.filter(w => w.status === 'completed').length
    const watching = watchlist.filter(w => w.status === 'watching').length
    const planned = watchlist.filter(w => w.status === 'planned').length

    const animeCount = watchlist.filter(w => w.type === 'anime').length
    const movieCount = watchlist.filter(w => w.type === 'movie').length
    const seriesCount = watchlist.filter(w => w.type === 'series').length

    return {
        total: watchlist.length,
        completed,
        watching,
        planned,
        animeCount,
        movieCount,
        seriesCount,
        favoriteGenres: getFavoriteGenres(3),
        historyCount: watchHistory.length
    }
}

// ============ THEME ============

export function setTheme(theme) {
    userProfile.theme = theme
    document.documentElement.setAttribute('data-theme', theme)
}

export function toggleTheme() {
    const newTheme = userProfile.theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    return newTheme
}

// Initialize theme on load
export function initTheme() {
    document.documentElement.setAttribute('data-theme', userProfile.theme || 'dark')
}
