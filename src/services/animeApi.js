// Jikan API Service (MyAnimeList Unofficial API)
// Free, CORS-enabled, no authentication required.

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// ============ CACHE UTILITY ============
const CACHE_TTL = 30 * 60 * 1000; // 30 mins

function getCache(key) {
  try {
    const cached = localStorage.getItem(`jikan_cache_${key}`);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(`jikan_cache_${key}`);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(`jikan_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('jikan_cache_'));
      keys.slice(0, Math.floor(keys.length / 2)).forEach(k => localStorage.removeItem(k));
    }
  }
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

  // Add artificial delay to avoid hitting rate limits (3 requests per second)
  await new Promise(r => setTimeout(r, 350));

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    throw new Error(`Jikan API error: ${response.status}`);
  }

  const data = await response.json();

  if (!isSearch && data && data.data) {
    setCache(cacheKey, data);
  }

  return data;
}

// ============ DATA MAPPERS ============

export function mapJikanAnime(item) {
  return {
    id: item.mal_id,
    title: item.title,
    titleEnglish: item.title_english || item.title,
    titleJapanese: item.title_japanese || null,
    poster: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || null,
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
export async function getTrendingAnime(limit = 20) {
  const data = await jikanFetch('/seasons/now', { limit });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get top rated anime of all time
export async function getTopAnime(limit = 20) {
  const data = await jikanFetch('/top/anime', { limit });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get popular anime
export async function getPopularAnime(limit = 20) {
  const data = await jikanFetch('/top/anime', { filter: 'bypopularity', limit });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get upcoming anime
export async function getUpcomingAnime(limit = 20) {
  const data = await jikanFetch('/seasons/upcoming', { limit });
  return data.data ? data.data.map(mapJikanAnime) : [];
}

// Get favorite anime
export async function getFavoriteAnime(limit = 20) {
  const data = await jikanFetch('/top/anime', { filter: 'favorite', limit });
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
      poster: r.entry.images?.webp?.large_image_url || r.entry.images?.jpg?.large_image_url || null,
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
