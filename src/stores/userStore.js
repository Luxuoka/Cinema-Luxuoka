// User Store - State Management (In-Memory only, no localStorage, no database)
// Cinema Luxuoka - Theme and in-memory preferences only

import { reactive } from 'vue'

// ============ STATE ============

export const userState = reactive({
    isLoggedIn: false,
    loading: false,
    historyLoading: false
})

export const userProfile = reactive({
    username: 'Penonton',
    email: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cinema',
    joinDate: new Date().toISOString(),
    theme: 'dark',
    role: 'user'
})

export const currentProfile = reactive({
    id: 'default',
    name: 'Penonton',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cinema',
    favoriteGenres: []
})

export const allProfiles = reactive([])
export const notifications = reactive([])
export const userActivities = reactive([])

// ============ STUBS TO PREVENT COMPILATION ERRORS ============
export const watchlist = reactive([])
export const watchHistory = reactive([])

export async function addToWatchlist(item, status = 'planned') {}
export async function removeFromWatchlist(id, type) {}
export function isInWatchlist(id, type) { return false }
export function getWatchlistItem(id, type) { return null }
export async function updateWatchlistStatus(id, type, status) {}
export async function updateEpisodeProgress(id, type, episode) {}
export async function toggleEpisodeWatched(id, type, episode) {}
export function getWatchlistByStatus(status) { return [] }
export async function clearWatchlist() {}
export async function addToHistory(item, episode = null) {}
export async function clearWatchHistory() {}

// ============ GENRE PREFERENCES ============

export const genreStats = reactive({})

export function trackGenreInteraction(genres) {}
export async function setFavoriteGenres(genres) {
    currentProfile.favoriteGenres = genres
}
export function getFavoriteGenres(limit = 5) {
    return currentProfile.favoriteGenres?.slice(0, limit) || []
}

// ============ THEME ============

export async function setTheme(theme) {
    userProfile.theme = theme
    document.documentElement.setAttribute('data-theme', theme)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0f' : '#ffffff')
    }
}

export function toggleTheme() {
    const newTheme = userProfile.theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    return newTheme
}

export function initTheme() {
    // Default theme is dark, no localStorage
    userProfile.theme = 'dark'
    document.documentElement.setAttribute('data-theme', 'dark')
}

// ============ NOTIFICATIONS (local-only stubs) ============

export async function markAllNotifsAsRead() {
    notifications.forEach(n => { n.read = true })
}

// ============ ACTIVITY STUBS ============

export async function logUserActivity(actionText, contentId = null, contentTitle = null) {}

// ============ PROFILE STUBS ============

export function selectProfile(profile) {
    if (!profile) return
    currentProfile.id = profile.id || 'default'
    currentProfile.name = profile.name || 'Penonton'
    currentProfile.avatar = profile.avatar || userProfile.avatar
    currentProfile.favoriteGenres = profile.favoriteGenres || []
}

export async function createProfile(name, avatar) { return null }
export async function deleteProfile(profileId) {}
export async function uploadProfilePicture(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    })
}
export async function updateProfileDetails(newUsername, newAvatarUrl) {
    userProfile.username = newUsername
    if (newAvatarUrl) userProfile.avatar = newAvatarUrl
    currentProfile.name = newUsername
    if (newAvatarUrl) currentProfile.avatar = newAvatarUrl
}

// ============ AUTH MODAL STUBS ============

export function openAuthModal(isRegister = false) {}
export function closeAuthModal() {}
export async function loginWithEmail(email, password) {}
export async function registerWithEmail(email, username, password) {}
export async function loginUser() {}
export async function logoutUser() {}

// ============ RATINGS & REVIEWS ============

export async function addRating(contentId, contentType, rating, review = '') {}
export async function getRating(contentId) { return null }
export function subscribeToComments(contentId, callback) {
    callback([])
    return () => {}
}
export async function addComment(contentId, contentType, contentTitle, text, isSpoiler = false) { return null }
export async function deleteComment(commentId) {}
export async function reportComment(commentId) {}

// ============ ADMIN STUBS ============

export async function getAdminStats() {
    return { users: 0, comments: 0, movies: 0, reportedCommentsCount: 0 }
}
export async function getAdminUsers() { return [] }
export async function getAdminRecentReviews() { return [] }
export async function getAdminCatalog() { return [] }
export async function getAdminReportedComments() { return [] }
export async function updateUserRoleByAdmin(uid, role) {}
export async function updateUserSuspendByAdmin(uid, suspended) {}
export async function clearReportedCommentByAdmin(commentId) {}
export async function deleteCommentByAdmin(commentId) {}
export async function addMovieCatalogByAdmin(movie) { return null }
export async function deleteMovieCatalogByAdmin(movieId) {}
export async function clearMovieCatalogByAdmin(catalogList) {}
