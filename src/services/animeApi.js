// Jikan API Service (MyAnimeList Unofficial API)
// Free, CORS-enabled, no authentication required.

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// ============ CACHE UTILITY ============
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours for anime data

const memoryCache = {};
const inflightAnime = new Map();

function getCache(key, allowExpired = false) {
  const fullKey = `lux_anime_${key}`;

  // 1. Memory cache check
  try {
    const cached = memoryCache[fullKey];
    if (cached) {
      if (allowExpired || Date.now() - cached.timestamp <= CACHE_TTL) {
        return cached.data;
      }
      if (!allowExpired) delete memoryCache[fullKey];
    }
  } catch (e) {}

  // 2. SessionStorage check
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(fullKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (allowExpired || Date.now() - parsed.timestamp <= CACHE_TTL) {
          memoryCache[fullKey] = parsed;
          return parsed.data;
        }
        if (!allowExpired) sessionStorage.removeItem(fullKey);
      }
    }
  } catch (e) {}

  return null;
}

function setCache(key, data) {
  const fullKey = `lux_anime_${key}`;
  const entry = {
    data,
    timestamp: Date.now()
  };

  try {
    memoryCache[fullKey] = entry;
  } catch (e) {}

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(fullKey, JSON.stringify(entry));
    }
  } catch (e) {}
}

// ============ API FETCHER ============

export async function jikanFetch(endpoint, params = {}, signal = null) {
  const url = new URL(`${JIKAN_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.append(key, value);
  });

  const isSearch = endpoint.includes('?q=') || params.q;
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;

  if (!isSearch) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  // Deduplicate in-flight requests
  const requestKey = url.toString();
  if (!isSearch && inflightAnime.has(requestKey)) {
    return inflightAnime.get(requestKey);
  }

  const fetchPromise = (async () => {
    // 3.5s timeout so Jikan doesn't freeze the page
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const effectiveSignal = signal || controller.signal;
      const response = await fetch(url.toString(), { signal: effectiveSignal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status}`);
      }

      const data = await response.json();

      if (!isSearch && data && data.data) {
        setCache(cacheKey, data);
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      // Fallback: If network fails or times out, try returning stale cache
      const stale = getCache(cacheKey, true);
      if (stale) return stale;
      throw err;
    } finally {
      inflightAnime.delete(requestKey);
    }
  })();

  if (!isSearch) {
    inflightAnime.set(requestKey, fetchPromise);
  }

  return fetchPromise;
}

// ============ DATA MAPPERS ============

export function mapJikanAnime(item) {
  return {
    id: item.mal_id,
    title: item.title,
    titleEnglish: item.title_english || item.title,
    titleJapanese: item.title_japanese || null,
    poster: item.images?.webp?.image_url || item.images?.jpg?.image_url || null,
    posterLarge: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || null,
    backdrop: item.trailer?.images?.maximum_image_url || null,
    rating: item.score ? item.score.toFixed(1) : null,
    year: item.year?.toString() || (item.aired?.prop?.from?.year?.toString()) || null,
    type: 'anime',
    genres: item.genres?.map(g => g.name) || [],
    episodes: item.episodes || null,
    status: item.status || null,
    synopsis: item.synopsis || null,
    mediaType: item.type || null,
    source: item.source || null,
    studios: item.studios?.map(s => s.name) || [],
    season: item.season ? `${item.season} ${item.year}` : null,
    averageDuration: item.duration ? parseInt(item.duration) : null,
    rated: item.rating || null,
    rank: item.rank || null,
    popularity: item.popularity || null,
    background: item.background || null,
    relatedAnime: item.relations?.flatMap(r => 
      r.entry.filter(e => e.type === 'anime').map(e => ({
        id: e.mal_id,
        title: e.name,
        relationType: r.relation
      }))
    ) || [],
    recommendations: [], // Jikan handles recs in a separate endpoint, keeping empty for now
    openingThemes: item.theme?.openings || [],
    endingThemes: item.theme?.endings || [],
    trailer: item.trailer?.embed_url || null,
    statistics: {
      status: {
        watching: item.members,
        completed: item.scored_by,
      }
    }
  };
}

// ============ ANIME ENDPOINTS ============

// Get trending/airing anime
export async function getTrendingAnime(limit = 20, page = 1) {
  const data = await jikanFetch('/seasons/now', { limit, page });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get top rated anime of all time
export async function getTopAnime(limit = 20, page = 1) {
  const data = await jikanFetch('/top/anime', { limit, page });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get popular anime
export async function getPopularAnime(limit = 20, page = 1) {
  const data = await jikanFetch('/top/anime', { filter: 'bypopularity', limit, page });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get upcoming anime
export async function getUpcomingAnime(limit = 20, page = 1) {
  const data = await jikanFetch('/seasons/upcoming', { limit, page });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get favorite anime
export async function getFavoriteAnime(limit = 20, page = 1) {
  const data = await jikanFetch('/top/anime', { filter: 'favorite', limit, page });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get seasonal anime
export async function getSeasonalAnime(year, season, limit = 25) {
  const data = await jikanFetch(`/seasons/${year}/${season}`, { limit });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Search anime
export async function searchAnime(query, limit = 20, signal = null) {
  const data = await jikanFetch('/anime', { q: query, limit, order_by: 'popularity', sort: 'asc' }, signal);
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get anime details by ID
export async function getAnimeById(id, signal = null) {
  const data = await jikanFetch(`/anime/${id}/full`, {}, signal);
  
  // Fetch recommendations separately for full details
  try {
    const recs = await jikanFetch(`/anime/${id}/recommendations`);
    const mapped = mapJikanAnime(data.data);
    mapped.recommendations = recs.data?.slice(0, 10).map(r => ({
      id: r.entry.mal_id,
      title: r.entry.title,
      poster: r.entry.images?.webp?.image_url || r.entry.images?.jpg?.image_url || null,
      type: 'anime'
    })) || [];
    return mapped;
  } catch(e) {
    return mapJikanAnime(data.data);
  }
}

// Get current season info
export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  let season;
  if (month >= 1 && month <= 3) season = 'winter';
  else if (month >= 4 && month <= 6) season = 'spring';
  else if (month >= 7 && month <= 9) season = 'summer';
  else season = 'fall';
  
  return { year, season };
}

// Get anime by ranking type
export async function getAnimeByRanking(rankingType = 'all', limit = 25) {
  switch (rankingType) {
    case 'airing': return getTrendingAnime(limit);
    case 'bypopularity': return getPopularAnime(limit);
    case 'upcoming': return getUpcomingAnime(limit);
    case 'favorite': return getFavoriteAnime(limit);
    case 'all':
    default:
      return getTopAnime(limit);
  }
}

// Get anime by ranking type with pagination details
export async function getAnimeByRankingPaged(rankingType = 'all', limit = 25, page = 1) {
  let data;
  switch (rankingType) {
    case 'airing':
      data = await jikanFetch('/top/anime', { filter: 'airing', limit, page });
      break;
    case 'bypopularity':
      data = await jikanFetch('/top/anime', { filter: 'bypopularity', limit, page });
      break;
    case 'upcoming':
      data = await jikanFetch('/top/anime', { filter: 'upcoming', limit, page });
      break;
    case 'favorite':
      data = await jikanFetch('/top/anime', { filter: 'favorite', limit, page });
      break;
    case 'seasonal': {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      let season;
      if (month >= 1 && month <= 3) season = 'winter';
      else if (month >= 4 && month <= 6) season = 'spring';
      else if (month >= 7 && month <= 9) season = 'summer';
      else season = 'fall';
      data = await jikanFetch(`/seasons/${year}/${season}`, { limit, page });
      break;
    }
    case 'all':
    default:
      data = await jikanFetch('/top/anime', { limit, page });
      break;
  }
  return {
    data: data.data ? data.data.map(mapJikanAnime) : [],
    totalPages: data.pagination?.last_visible_page || 1
  };
}
