// Recommendation Engine for Cinema Luxuoka
// Hybrid approach: Content-based + Collaborative (user behavior) + Trending
// All client-side using localStorage data

import { watchlist, genreStats, getFavoriteGenres } from '../stores/userStore'
import {
    getTrendingMovies,
    getTrendingSeries,
    discoverMovies,
    discoverSeries
} from './api'

const RECOMMENDATION_CACHE_KEY = 'cinema_recommendations'
const RECOMMENDATION_TTL = 30 * 60 * 1000 // 30 minutes

// ============ CONTENT-BASED FILTERING ============

/**
 * Get recommendations based on user's genre preferences
 */
export function getGenreBasedRecommendations() {
    const favoriteGenres = getFavoriteGenres(5)

    if (favoriteGenres.length === 0) return null

    // Map genre names to TMDB genre IDs
    const genreNameToId = {
        'Action': 28,
        'Adventure': 12,
        'Animation': 16,
        'Comedy': 35,
        'Crime': 80,
        'Documentary': 99,
        'Drama': 18,
        'Family': 10751,
        'Fantasy': 14,
        'History': 36,
        'Horror': 27,
        'Music': 10402,
        'Mystery': 9648,
        'Romance': 10749,
        'Science Fiction': 878,
        'Sci-Fi': 878,
        'Thriller': 53,
        'War': 10752,
        'Western': 37,
    }

    return {
        genres: favoriteGenres,
        genreIds: favoriteGenres
            .map(g => genreNameToId[g])
            .filter(id => id !== null && id !== undefined)
    }
}

/**
 * Get "Because You Watched" recommendations
 * Based on the user's most recently watched content
 */
export function getBecauseYouWatched() {
    return [] // Feature removed
}

/**
 * Calculate content similarity score between two items
 */
function calculateSimilarity(item1Genres, item2Genres) {
    if (!item1Genres || !item2Genres) return 0

    const set1 = new Set(item1Genres)
    const set2 = new Set(item2Genres)

    let intersection = 0
    set1.forEach(g => {
        if (set2.has(g)) intersection++
    })

    const union = new Set([...set1, ...set2]).size
    return union > 0 ? intersection / union : 0
}

// ============ COLLABORATIVE FILTERING (Local) ============

/**
 * Generate personalized content score based on user preferences
 */
export function scoreContent(item) {
    let score = 0

    // 1. Genre match score (0-40 points)
    const favoriteGenres = getFavoriteGenres(10)
    if (item.genres && favoriteGenres.length > 0) {
        const matchCount = item.genres.filter(g => favoriteGenres.includes(g)).length
        score += (matchCount / Math.max(item.genres.length, 1)) * 40
    } else if (item.genre_ids && favoriteGenres.length > 0) {
        // Handle TMDB genre IDs if needed
    }

    // 2. Rating score (0-20 points)
    if (item.rating) {
        const rating = parseFloat(item.rating)
        if (!isNaN(rating)) {
            score += (rating / 10) * 20
        }
    }

    // 3. Recency score (0-15 points)
    if (item.year) {
        const currentYear = new Date().getFullYear()
        const age = currentYear - parseInt(item.year)
        if (age <= 1) score += 15
        else if (age <= 3) score += 10
        else if (age <= 5) score += 5
    }

    // 4. Type preference score (0-15 points)
    const typePreference = getTypePreference()
    if (typePreference[item.type]) {
        score += (typePreference[item.type] / Math.max(...Object.values(typePreference), 1)) * 15
    }

    // 5. Not in watchlist/history bonus (0-15 points) - recommend NEW content
    const inWatchlist = watchlist.some(w => w.id === item.id && w.type === item.type)
    const inHistory = import.meta.env.PROD ? false : false // watchHistory not easily available here without import
    
    if (!inWatchlist) score += 10
    
    // 6. Penalty for already watched (very low score for history)
    // Note: ideally we'd import watchHistory but it might cause circular deps
    // For now we use a simpler approach or skip history penalty if not available
    
    return Math.round(score * 10) / 10
}

/**
 * Get user's content type preference from watchlist
 */
function getTypePreference() {
    const counts = { movie: 0, series: 0 }

    watchlist.forEach(item => {
        if (counts[item.type] !== undefined) {
            counts[item.type]++
        }
    })

    return counts
}

// ============ HYBRID RECOMMENDATIONS ============

/**
 * Get personalized recommendations combining multiple strategies
 */
export async function getPersonalizedRecommendations(limit = 20) {
    // Check cache first
    const cached = getCachedRecommendations()
    if (cached) return cached

    try {
        const recommendations = []
        const genrePrefs = getGenreBasedRecommendations()

        // 1. Genre-based recommendations (if user has preferences)
        if (genrePrefs && genrePrefs.genreIds.length > 0) {
            const topGenreId = genrePrefs.genreIds[0]

            const [genreMovies, genreSeries] = await Promise.all([
                discoverMovies({ genre: topGenreId, sortBy: 'popularity' }).catch(() => []),
                discoverSeries({ genre: topGenreId, sortBy: 'popularity' }).catch(() => [])
            ])

            genreMovies.forEach(m => {
                recommendations.push({ ...m, source: 'genre', score: scoreContent(m) })
            })
            genreSeries.forEach(s => {
                recommendations.push({ ...s, source: 'genre', score: scoreContent(s) })
            })
        }

        // 2. Trending content (always include some trending)
        const [trendingMovies, trendingSeries] = await Promise.all([
            getTrendingMovies().catch(() => []),
            getTrendingSeries().catch(() => [])
        ])

        trendingMovies.slice(0, 5).forEach(m => {
            if (!recommendations.find(r => r.id === m.id)) {
                recommendations.push({ ...m, source: 'trending', score: scoreContent(m) + 5 })
            }
        })

        trendingSeries.slice(0, 5).forEach(s => {
            if (!recommendations.find(r => r.id === s.id)) {
                recommendations.push({ ...s, source: 'trending', score: scoreContent(s) + 5 })
            }
        })

        // 3. Sort by score and deduplicate
        const sorted = recommendations
            .sort((a, b) => b.score - a.score)
            .filter((item, index, self) =>
                index === self.findIndex(t => t.id === item.id && t.type === item.type)
            )
            .slice(0, limit)

        // Cache results
        cacheRecommendations(sorted)

        return sorted
    } catch (error) {
        console.error('Recommendation engine error:', error)
        return []
    }
}

/**
 * Get "For You" section items with personalized match percentage
 */
export function calculateMatchPercentage(item) {
    const score = scoreContent(item)
    // Convert score (0-100) to match percentage (60-98%)
    return Math.min(98, Math.max(60, Math.round(score + 60)))
}

/**
 * Get time-based recommendations
 * Morning: lighthearted content
 * Evening: drama, thriller
 * Night: horror, action
 */
export function getTimeBasedGenres() {
    const hour = new Date().getHours()

    if (hour >= 6 && hour < 12) {
        return {
            mood: 'morning',
            label: 'Cerah untuk Pagi Ini',
            genres: ['Comedy', 'Animation', 'Family', 'Adventure']
        }
    } else if (hour >= 12 && hour < 18) {
        return {
            mood: 'afternoon',
            label: 'Seru untuk Siang Ini',
            genres: ['Action', 'Adventure', 'Sci-Fi', 'Fantasy']
        }
    } else if (hour >= 18 && hour < 22) {
        return {
            mood: 'evening',
            label: 'Pilihan Malam Ini',
            genres: ['Drama', 'Thriller', 'Crime', 'Mystery']
        }
    } else {
        return {
            mood: 'night',
            label: 'Late Night Picks',
            genres: ['Horror', 'Thriller', 'Action', 'Sci-Fi']
        }
    }
}

// ============ CACHE UTILITIES ============

function getCachedRecommendations() {
    try {
        const cached = localStorage.getItem(RECOMMENDATION_CACHE_KEY)
        if (!cached) return null
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp > RECOMMENDATION_TTL) {
            localStorage.removeItem(RECOMMENDATION_CACHE_KEY)
            return null
        }
        return data
    } catch {
        return null
    }
}

function cacheRecommendations(data) {
    try {
        localStorage.setItem(RECOMMENDATION_CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }))
    } catch { }
}
