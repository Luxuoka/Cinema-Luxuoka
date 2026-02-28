// Analytics & Event Tracking Service for Cinema Luxuoka
// Tracks user interactions for insights and recommendations

const ANALYTICS_KEY = 'cinema_analytics'
const SESSION_KEY = 'cinema_session'

// Load analytics data
function loadAnalytics() {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY)
    return data ? JSON.parse(data) : getDefaultAnalytics()
  } catch {
    return getDefaultAnalytics()
  }
}

function getDefaultAnalytics() {
  return {
    totalViews: 0,
    totalWatchTime: 0,        // minutes
    contentViews: {},          // { contentId: { count, lastViewed, type, title } }
    genreInteractions: {},     // { genre: count }
    searchHistory: [],         // [{ query, timestamp, resultsCount }]
    dailyActivity: {},         // { 'YYYY-MM-DD': { views, watchTime } }
    deviceInfo: {
      userAgent: navigator.userAgent,
      screenWidth: screen.width,
      screenHeight: screen.height,
      platform: navigator.platform
    },
    milestones: [],            // ['first_watch', 'watched_10', ...]
    createdAt: Date.now(),
    lastUpdated: Date.now()
  }
}

function saveAnalytics(data) {
  try {
    data.lastUpdated = Date.now()
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data))
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Trim old data
      data.searchHistory = data.searchHistory.slice(-20)
      const dates = Object.keys(data.dailyActivity).sort()
      if (dates.length > 30) {
        dates.slice(0, dates.length - 30).forEach(d => delete data.dailyActivity[d])
      }
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data))
    }
  }
}

// Session tracking
function getSession() {
  try {
    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      const parsed = JSON.parse(session)
      // Session expires after 30 mins of inactivity
      if (Date.now() - parsed.lastActive < 30 * 60 * 1000) {
        parsed.lastActive = Date.now()
        localStorage.setItem(SESSION_KEY, JSON.stringify(parsed))
        return parsed
      }
    }
  } catch {}
  
  const newSession = {
    id: generateId(),
    startedAt: Date.now(),
    lastActive: Date.now(),
    pageViews: 0,
    contentViewed: []
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
  return newSession
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

// ============ PUBLIC API ============

// Track content view
export function trackContentView(contentId, metadata = {}) {
  const analytics = loadAnalytics()
  const session = getSession()
  const today = getToday()

  analytics.totalViews++
  
  // Content-level tracking
  if (!analytics.contentViews[contentId]) {
    analytics.contentViews[contentId] = {
      count: 0,
      firstViewed: Date.now(),
      type: metadata.type,
      title: metadata.title
    }
  }
  analytics.contentViews[contentId].count++
  analytics.contentViews[contentId].lastViewed = Date.now()

  // Daily activity
  if (!analytics.dailyActivity[today]) {
    analytics.dailyActivity[today] = { views: 0, watchTime: 0 }
  }
  analytics.dailyActivity[today].views++

  // Session tracking
  session.pageViews++
  if (!session.contentViewed.includes(contentId)) {
    session.contentViewed.push(contentId)
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))

  // Genre tracking
  if (metadata.genres) {
    metadata.genres.forEach(genre => {
      analytics.genreInteractions[genre] = (analytics.genreInteractions[genre] || 0) + 1
    })
  }

  // Milestones
  checkMilestones(analytics)

  saveAnalytics(analytics)

  // Also send to Google Analytics if available
  if (window.gtag) {
    window.gtag('event', 'content_view', {
      content_id: contentId,
      content_type: metadata.type,
      content_title: metadata.title
    })
  }
}

// Track play start
export function trackPlayStart(contentId, metadata = {}) {
  if (window.gtag) {
    window.gtag('event', 'play_start', {
      content_id: contentId,
      content_type: metadata.type,
      server: metadata.server,
      quality: metadata.quality
    })
  }
}

// Track watch progress milestone
export function trackWatchProgress(contentId, progressPercent, durationMinutes = 0) {
  const analytics = loadAnalytics()
  const today = getToday()

  if (durationMinutes > 0) {
    analytics.totalWatchTime += durationMinutes
    if (analytics.dailyActivity[today]) {
      analytics.dailyActivity[today].watchTime += durationMinutes
    }
  }

  // Track milestone events
  const milestonePoints = [25, 50, 75, 90, 100]
  const milestone = milestonePoints.find(m => progressPercent >= m)
  
  if (milestone && window.gtag) {
    window.gtag('event', 'watch_milestone', {
      content_id: contentId,
      milestone: `${milestone}%`,
      watch_time: durationMinutes
    })
  }

  saveAnalytics(analytics)
}

// Track search
export function trackSearch(query, resultsCount, clickedResult = null) {
  const analytics = loadAnalytics()
  
  analytics.searchHistory.push({
    query,
    resultsCount,
    clickedResult,
    timestamp: Date.now()
  })

  // Keep only last 50 searches
  if (analytics.searchHistory.length > 50) {
    analytics.searchHistory = analytics.searchHistory.slice(-50)
  }

  saveAnalytics(analytics)

  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: query,
      results_count: resultsCount,
      has_results: resultsCount > 0
    })
  }
}

// Track feature usage
export function trackFeatureUsage(feature, metadata = {}) {
  if (window.gtag) {
    window.gtag('event', 'feature_usage', {
      feature_name: feature,
      ...metadata
    })
  }
}

// Check and award milestones
function checkMilestones(analytics) {
  const milestones = analytics.milestones || []
  
  if (analytics.totalViews === 1 && !milestones.includes('first_view')) {
    milestones.push('first_view')
  }
  if (analytics.totalViews >= 10 && !milestones.includes('viewed_10')) {
    milestones.push('viewed_10')
  }
  if (analytics.totalViews >= 50 && !milestones.includes('viewed_50')) {
    milestones.push('viewed_50')
  }
  if (analytics.totalViews >= 100 && !milestones.includes('viewed_100')) {
    milestones.push('viewed_100')
  }
  
  const uniqueContent = Object.keys(analytics.contentViews).length
  if (uniqueContent >= 5 && !milestones.includes('explorer_5')) {
    milestones.push('explorer_5')
  }
  if (uniqueContent >= 20 && !milestones.includes('explorer_20')) {
    milestones.push('explorer_20')
  }

  analytics.milestones = milestones
}

// ============ ANALYTICS DASHBOARD DATA ============

// Get analytics summary for profile/dashboard
export function getAnalyticsSummary() {
  const analytics = loadAnalytics()
  const today = getToday()
  
  // Last 7 days activity
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    last7Days.push({
      date: dateStr,
      label: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      views: analytics.dailyActivity[dateStr]?.views || 0,
      watchTime: analytics.dailyActivity[dateStr]?.watchTime || 0
    })
  }

  // Top genres
  const topGenres = Object.entries(analytics.genreInteractions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre, count]) => ({ genre, count }))

  // Most watched content
  const topContent = Object.entries(analytics.contentViews)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([id, data]) => ({ id, ...data }))

  // Recent searches
  const recentSearches = [...new Set(
    analytics.searchHistory
      .slice(-10)
      .reverse()
      .map(s => s.query)
  )].slice(0, 5)

  return {
    totalViews: analytics.totalViews,
    totalWatchTime: analytics.totalWatchTime,
    uniqueContent: Object.keys(analytics.contentViews).length,
    todayViews: analytics.dailyActivity[today]?.views || 0,
    todayWatchTime: analytics.dailyActivity[today]?.watchTime || 0,
    last7Days,
    topGenres,
    topContent,
    recentSearches,
    milestones: analytics.milestones || [],
    memberSince: analytics.createdAt
  }
}

// Get trending searches
export function getTrendingSearches() {
  const analytics = loadAnalytics()
  const recentSearches = analytics.searchHistory.slice(-30)
  
  const frequency = {}
  recentSearches.forEach(s => {
    frequency[s.query] = (frequency[s.query] || 0) + 1
  })

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([query, count]) => ({ query, count }))
}
