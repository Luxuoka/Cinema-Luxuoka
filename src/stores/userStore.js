// User Store - State Management with Firebase
// Cinema Luxuoka - User data, watchlist, history, and preferences

import { reactive, watch } from 'vue'
import { auth, db } from '../firebase'
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot, collection, updateDoc, arrayUnion, query, where, orderBy, limit } from 'firebase/firestore'

// ============ USER PROFILE ============

export const userState = reactive({
    isLoggedIn: false,
    uid: null,
    loading: true,
    historyLoading: false
})

export const userProfile = reactive({
    username: 'Guest User',
    email: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
    joinDate: new Date().toISOString(),
    theme: 'dark'
})

export const currentProfile = reactive({
    id: 'default',
    name: '',
    avatar: '',
    favoriteGenres: []
})

export const allProfiles = reactive([])

export const notifications = reactive([])
let notifUnsubscribe = null

// ============ LOCAL REHYDRATION ============

function loadLocalData(key) {
    try {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : []
    } catch (e) {
        return []
    }
}

function saveLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

// Rehydrate instantly before Firebase even starts (Guest rehydration removed as requested)

// Listen to Firebase Auth state
if (auth) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userState.uid = user.uid
            userProfile.username = user.displayName || 'User'
            userProfile.email = user.email || ''
            userProfile.avatar = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`
            
            // Load account-specific cache from localStorage first for instant UI
            const cachedWatchlist = loadLocalData(`cache_watchlist_${user.uid}`)
            const cachedHistory = loadLocalData(`cache_history_${user.uid}`)
            if (cachedWatchlist.length) watchlist.splice(0, watchlist.length, ...cachedWatchlist)
            if (cachedHistory.length) watchHistory.splice(0, watchHistory.length, ...cachedHistory)

            // Fetch user preferences from Firestore
            if (db) {
                const userRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(userRef)
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    if (data.theme) {
                        userProfile.theme = data.theme
                        setTheme(data.theme)
                    }
                    if (data.profiles) {
                        allProfiles.splice(0, allProfiles.length, ...data.profiles)
                    }
                } else {
                    // Create new user profile in DB
                    const defaultProfile = {
                        id: 'main',
                        name: user.displayName || 'User',
                        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`,
                        favoriteGenres: []
                    }
                    allProfiles.splice(0, allProfiles.length, defaultProfile)
                    await setDoc(userRef, {
                        username: userProfile.username,
                        email: userProfile.email,
                        theme: userProfile.theme,
                        joinDate: userProfile.joinDate,
                        profiles: [defaultProfile]
                    })
                }
                
                // Set initial profile
                const savedProfileId = localStorage.getItem(`profile_${user.uid}`) || 'main'
                const profile = allProfiles.find(p => p.id === savedProfileId) || allProfiles[0]
                
                // IMPORTANT: Login state ONLY set after profile selection to avoid race conditions
                userState.isLoggedIn = true 
                selectProfile(profile)
                initNotifListener(user.uid)
            }
            // User is signed out
            userState.isLoggedIn = false
            userState.uid = null
            userProfile.username = 'Guest User'
            userProfile.email = ''
            userProfile.avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
            
            // Note: Watchlist and History are NOT cleared on logout per user request
            
            allProfiles.splice(0, allProfiles.length)
            notifications.splice(0, notifications.length)
            clearProfile()
        }
        userState.loading = false
    })
} else {
    userState.loading = false
}

// Login user
export async function loginUser() {
    if (!auth) {
        alert("Firebase tidak terkonfigurasi. Silakan isi .env dengan kunci Firebase Anda.")
        return
    }
    const provider = new GoogleAuthProvider()
    try {
        await signInWithPopup(auth, provider)
    } catch (error) {
        console.error('Login error:', error)
    }
}

// Logout user
export async function logoutUser() {
    if (auth) {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }
}

// ============ WATCHLIST ============

export const watchlist = reactive([])
let watchlistUnsubscribe = null

export function selectProfile(profile) {
    currentProfile.id = profile.id
    currentProfile.name = profile.name
    currentProfile.avatar = profile.avatar
    currentProfile.favoriteGenres = profile.favoriteGenres || []
    
    localStorage.setItem(`profile_${userState.uid}`, profile.id)
    
    // Initialize real-time listeners for Watchlist and History for THIS profile
    initWatchlistListener(userState.uid, profile.id)
    initHistoryListener(userState.uid, profile.id)
}

function clearProfile() {
    currentProfile.id = 'default'
    currentProfile.name = ''
    currentProfile.avatar = ''
    currentProfile.favoriteGenres = []
}

function initNotifListener(uid) {
    if (notifUnsubscribe) notifUnsubscribe()
    if (!db) return
    
    const notifRef = collection(db, 'notifications')
    const q = query(notifRef, where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(10))
    
    notifUnsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        notifications.splice(0, notifications.length, ...data)
    })
}

export async function markAllNotifsAsRead() {
    if (!userState.isLoggedIn || !db) return
    for (const notif of notifications) {
        if (!notif.read) {
            const notifRef = doc(db, 'notifications', notif.id)
            await updateDoc(notifRef, { read: true })
        }
    }
}

export async function createProfile(name, avatar) {
    if (!userState.isLoggedIn || !db) return
    const newProfile = {
        id: Date.now().toString(),
        name,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        favoriteGenres: []
    }
    allProfiles.push(newProfile)
    const userRef = doc(db, 'users', userState.uid)
    await updateDoc(userRef, { profiles: allProfiles })
    return newProfile
}

export async function deleteProfile(profileId) {
    if (!userState.isLoggedIn || !db || allProfiles.length <= 1) return
    const index = allProfiles.findIndex(p => p.id === profileId)
    if (index > -1) {
        allProfiles.splice(index, 1)
        const userRef = doc(db, 'users', userState.uid)
        await updateDoc(userRef, { profiles: allProfiles })
        if (currentProfile.id === profileId) {
            selectProfile(allProfiles[0])
        }
    }
}

let lastWatchlistWrite = 0

function initWatchlistListener(uid, profileId) {
    if (watchlistUnsubscribe) watchlistUnsubscribe()
    const watchlistRef = doc(db, 'watchlists', `${uid}_${profileId}`)
    
    watchlistUnsubscribe = onSnapshot(watchlistRef, (docSnap) => {
        // Prevent snapshot from overwriting optimistic local updates for 2 seconds
        if (Date.now() - lastWatchlistWrite < 2000) return

        if (docSnap.exists()) {
            const data = docSnap.data().items || []
            watchlist.splice(0, watchlist.length, ...data)
            saveLocalData(`cache_watchlist_${uid}`, data)
        } else {
            setDoc(watchlistRef, { items: [] })
        }
    })
}

export async function addToWatchlist(item, status = 'planned') {
    if (!userState.isLoggedIn || !db) return
    
    const existingIndex = watchlist.findIndex(w => w.id === item.id && w.type === item.type)
    const newList = [...watchlist]
    
    const watchlistItem = {
        id: item.id,
        type: item.type || 'movie',
        title: item.title || item.name,
        poster: item.poster || item.poster_path,
        rating: item.rating,
        year: item.year,
        status: status,
        currentEpisode: 0,
        totalEpisodes: item.episodes || item.seasons || null,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    if (existingIndex > -1) {
        newList[existingIndex].status = status
        newList[existingIndex].updatedAt = watchlistItem.updatedAt
    } else {
        newList.push(watchlistItem)
    }
    
    // Optimistic Update
    lastWatchlistWrite = Date.now()
    watchlist.splice(0, watchlist.length, ...newList)

    const watchlistRef = doc(db, 'watchlists', `${userState.uid}_${currentProfile.id}`)
    await setDoc(watchlistRef, { items: newList })
    saveLocalData(`cache_watchlist_${userState.uid}`, newList)
}

export async function removeFromWatchlist(id, type) {
    if (!userState.isLoggedIn || !db) return
    const newList = watchlist.filter(w => !(w.id === id && w.type === type))
    const watchlistRef = doc(db, 'watchlists', `${userState.uid}_${currentProfile.id}`)
    await setDoc(watchlistRef, { items: newList })
}

export function isInWatchlist(id, type) {
    return watchlist.some(w => w.id === id && w.type === type)
}

export function getWatchlistItem(id, type) {
    return watchlist.find(w => w.id === id && w.type === type)
}

export async function updateWatchlistStatus(id, type, status) {
    if (!userState.isLoggedIn || !db) return
    const newList = [...watchlist]
    const item = newList.find(w => w.id === id && w.type === type)
    if (item) {
        item.status = status
        item.updatedAt = new Date().toISOString()
        const watchlistRef = doc(db, 'watchlists', `${userState.uid}_${currentProfile.id}`)
        await setDoc(watchlistRef, { items: newList })
    }
}

export async function updateEpisodeProgress(id, type, episode) {
    if (!userState.isLoggedIn || !db) return
    const newList = [...watchlist]
    const item = newList.find(w => w.id === id && w.type === type)
    if (item) {
        item.currentEpisode = episode
        if (!item.watchedEpisodes) item.watchedEpisodes = []
        if (!item.watchedEpisodes.includes(episode)) {
            item.watchedEpisodes.push(episode)
        }
        item.updatedAt = new Date().toISOString()
        if (item.totalEpisodes && episode >= item.totalEpisodes) {
            item.status = 'completed'
        } else if (episode > 0 && item.status === 'planned') {
            item.status = 'watching'
        }
        
        // Optimistic Update
        watchlist.splice(0, watchlist.length, ...newList)

        const watchlistRef = doc(db, 'watchlists', `${userState.uid}_${currentProfile.id}`)
        await setDoc(watchlistRef, { items: newList })
        saveLocalData(`cache_watchlist_${userState.uid}`, newList)
    }
}

export async function toggleEpisodeWatched(id, type, episode) {
    if (!userState.isLoggedIn || !db) return
    const newList = [...watchlist]
    const item = newList.find(w => w.id === id && w.type === type)
    if (item) {
        if (!item.watchedEpisodes) item.watchedEpisodes = []
        const index = item.watchedEpisodes.indexOf(episode)
        if (index > -1) {
            item.watchedEpisodes.splice(index, 1)
        } else {
            item.watchedEpisodes.push(episode)
        }
        item.updatedAt = new Date().toISOString()
        
        // Optimistic Update
        watchlist.splice(0, watchlist.length, ...newList)

        const watchlistRef = doc(db, 'watchlists', `${userState.uid}_${currentProfile.id}`)
        await setDoc(watchlistRef, { items: newList })
        saveLocalData(`cache_watchlist_${userState.uid}`, newList)
    }
}

export function getWatchlistByStatus(status) {
    if (!status || status === 'all') return watchlist
    return watchlist.filter(w => w.status === status)
}

// ============ HISTORY ============

export const watchHistory = reactive([])
let historyUnsubscribe = null

let lastHistoryWrite = 0

function initHistoryListener(uid, profileId) {
    if (historyUnsubscribe) historyUnsubscribe()
    if (!db) return
    
    userState.historyLoading = true
    const historyRef = doc(db, 'history', `${uid}_${profileId}`)
    
    historyUnsubscribe = onSnapshot(historyRef, (docSnap) => {
        if (Date.now() - lastHistoryWrite < 2000) return

        if (docSnap.exists()) {
            const data = docSnap.data().items || []
            data.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
            watchHistory.splice(0, watchHistory.length, ...data)
            saveLocalData(`cache_history_${uid}`, data)
        } else {
            setDoc(historyRef, { items: [] })
        }
        userState.historyLoading = false
    }, (error) => {
        console.error("History listener error:", error)
        userState.historyLoading = false
    })
}

export async function addToHistory(item, episode = null) {
    if (!userState.isLoggedIn || !db) return
    
    const existingIndex = watchHistory.findIndex(h => h.id === item.id && h.type === item.type)
    const newList = [...watchHistory]
    
    const historyItem = {
        id: item.id,
        type: item.type || (item.episodes ? 'series' : 'movie'),
        title: item.title || item.name,
        poster: item.poster || item.poster_path,
        watchedAt: new Date().toISOString(),
        episode: episode
    }
    
    if (existingIndex > -1) {
        newList.splice(existingIndex, 1)
    }
    
    newList.unshift(historyItem)
    if (newList.length > 50) newList.pop()
    
    // Optimistic local update
    lastHistoryWrite = Date.now()
    watchHistory.splice(0, watchHistory.length, ...newList)
    
    const historyRef = doc(db, 'history', `${userState.uid}_${currentProfile.id}`)
    await setDoc(historyRef, { items: newList })
    saveLocalData(`cache_history_${userState.uid}`, newList)
}

// ============ RATINGS & REVIEWS ============

export async function addRating(contentId, contentType, rating, review = '') {
    if (!userState.isLoggedIn || !db) return

    const ratingRef = doc(db, 'ratings', `${userState.uid}_${contentId}`)
    await setDoc(ratingRef, {
        uid: userState.uid,
        contentId,
        contentType,
        rating,
        review,
        username: userProfile.username,
        avatar: userProfile.avatar,
        createdAt: new Date().toISOString()
    })
}

export async function getRating(contentId) {
    if (!userState.isLoggedIn || !db) return null
    const ratingRef = doc(db, 'ratings', `${userState.uid}_${contentId}`)
    const docSnap = await getDoc(ratingRef)
    return docSnap.exists() ? docSnap.data() : null
}

// ============ GENRE PREFERENCES ============

export const genreStats = reactive({}) // Kept empty for now to simplify, can be synced later if needed

export function trackGenreInteraction(genres) {
    // simplified
}

export async function setFavoriteGenres(genres) {
    if (!userState.isLoggedIn || !db) return
    currentProfile.favoriteGenres = genres
    
    // Update in allProfiles array
    const pIndex = allProfiles.findIndex(p => p.id === currentProfile.id)
    if (pIndex > -1) {
        allProfiles[pIndex].favoriteGenres = genres
    }
    
    const userRef = doc(db, 'users', userState.uid)
    await updateDoc(userRef, { profiles: allProfiles })
}

export function getFavoriteGenres(limit = 5) {
    if (!userProfile.favoriteGenres) return []
    return userProfile.favoriteGenres.slice(0, limit)
}

// ============ THEME ============

export async function setTheme(theme) {
    userProfile.theme = theme
    document.documentElement.setAttribute('data-theme', theme)

    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0f' : '#ffffff')
    }
    
    // Save to Firestore if logged in
    if (userState.isLoggedIn && db) {
        const userRef = doc(db, 'users', userState.uid)
        try {
            await updateDoc(userRef, { theme })
        } catch (e) {
            // Document might not exist yet, handled by setDoc on login
        }
    }
}

export function toggleTheme() {
    const newTheme = userProfile.theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    return newTheme
}

export function initTheme() {
    document.documentElement.setAttribute('data-theme', userProfile.theme || 'dark')
}
