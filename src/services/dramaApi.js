import { tmdbFetch } from './api.js';

export const DRAMA_COUNTRIES = {
  korea: { code: 'ko', countryCode: 'KR', flag: '🇰🇷', label: 'Drama Korea', slug: 'korea' },
  china: { code: 'zh', countryCode: 'CN', flag: '🇨🇳', label: 'Drama China', slug: 'china' },
  jepang: { code: 'ja', countryCode: 'JP', flag: '🇯🇵', label: 'Drama Jepang', slug: 'jepang' },
  thailand: { code: 'th', countryCode: 'TH', flag: '🇹🇭', label: 'Drama Thailand', slug: 'thailand' }
};

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Standard Mapper for Drama/Series that adds specific fields for Drama details
export function mapTmdbDrama(item) {
  // Determine flag emoji based on original_language or origin_country
  let flag = '';
  const lang = item.original_language;
  const country = item.origin_country?.[0];
  
  if (lang === 'ko' || country === 'KR') flag = '🇰🇷';
  else if (lang === 'zh' || country === 'CN') flag = '🇨🇳';
  else if (lang === 'ja' || country === 'JP') flag = '🇯🇵';
  else if (lang === 'th' || country === 'TH') flag = '🇹🇭';
  else if (lang === 'tl' || country === 'PH') flag = '🇵🇭'; // Filipino fallback
  
  // Find which country key fits
  let countryKey = 'other';
  if (lang === 'ko') countryKey = 'korea';
  else if (lang === 'zh') countryKey = 'china';
  else if (lang === 'ja') countryKey = 'jepang';
  else if (lang === 'th') countryKey = 'thailand';

  return {
    id: item.id,
    title: item.name || item.title,
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w342${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w780${item.backdrop_path}` : null,
    backdropLarge: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : null,
    rating: item.vote_average ? item.vote_average.toFixed(1) : null,
    year: item.first_air_date ? item.first_air_date.split('-')[0] : (item.release_date ? item.release_date.split('-')[0] : null),
    type: 'series',
    originalLanguage: lang,
    originCountry: item.origin_country || [],
    flag,
    countryKey,
    firstAirDate: item.first_air_date || null,
    overview: item.overview || '',
    // Additional status/ongoing check
    isOngoing: item.status === 'Returning Series' || item.status === 'In Production',
    isNew: item.first_air_date ? (Date.now() - new Date(item.first_air_date).getTime() < 30 * 24 * 60 * 60 * 1000) : false
  };
}

// Discover Drama by Language with pagination & filter parameters
export async function discoverDramaByLanguage(langCode, page = 1, params = {}) {
  const sortMap = {
    'popularity': 'popularity.desc',
    'vote_average': 'vote_average.desc',
    'first_air_date': 'first_air_date.desc',
    'first_air_date_asc': 'first_air_date.asc'
  };

  const queryParams = {
    with_original_language: langCode,
    page: page.toString(),
    sort_by: sortMap[params.sortBy] || 'popularity.desc',
    'vote_count.gte': params.sortBy === 'vote_average' ? '15' : '2' // Lower vote count threshold for Asian dramas
  };

  if (params.genre) {
    queryParams.with_genres = params.genre.toString();
  }

  if (params.year) {
    queryParams.first_air_date_year = params.year.toString();
  }

  if (params.status) {
    if (params.status === 'ongoing') {
      queryParams.with_status = '0,1,2,5'; // 1 = Rumored, 2 = Planned, 3 = In Production, 4 = Post Production, 5 = Released, but wait, returning series is usually returning series status, discover has limited status support. Let's filter on the frontend if status is supplied, or use with_status. In TMDB discover, with_status is a list of comma separated values: 0=Returning Series, 1=Planned, 2=In Production, 3=Ended, 4=Cancelled, 5=Pilot
      // Let's use with_status: '0,2' for ongoing/returning/in-production, or handle it via API.
      queryParams.with_status = '0,2,5';
    } else if (params.status === 'completed') {
      queryParams.with_status = '3,4'; // Ended or Cancelled
    }
  }

  const data = await tmdbFetch('/discover/tv', queryParams);
  return {
    results: data.results ? data.results.map(mapTmdbDrama) : [],
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0
  };
}

// Get trending drama across all of Asia (ko, zh, ja, th)
export async function getTrendingDramaAsia(page = 1) {
  const data = await tmdbFetch('/trending/tv/week', { page: page.toString() });
  if (data.results) {
    const asianLangs = ['ko', 'zh', 'ja', 'th'];
    return data.results
      .filter(item => asianLangs.includes(item.original_language))
      .map(mapTmdbDrama);
  }
  return [];
}

// Get drama by country slug (korea, china, jepang, thailand)
export async function getDramaByCountry(countrySlug, page = 1, filters = {}) {
  const countryConfig = DRAMA_COUNTRIES[countrySlug];
  if (!countryConfig) return { results: [], totalPages: 1, totalResults: 0 };
  
  return discoverDramaByLanguage(countryConfig.code, page, filters);
}

// Get detail of drama series with season list & extra info
export async function getDramaDetail(id, signal = null) {
  const [details, videos] = await Promise.all([
    tmdbFetch(`/tv/${id}`, {}, signal),
    tmdbFetch(`/tv/${id}/videos`, {}, signal)
  ]);

  let trailer = null;
  if (videos.results) {
    const trailerVideo = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
      || videos.results.find(v => v.site === 'YouTube');
    if (trailerVideo) {
      trailer = `https://www.youtube.com/embed/${trailerVideo.key}`;
    }
  }

  const mapped = mapTmdbDrama(details);
  return {
    ...mapped,
    genres: details.genres ? details.genres.map(g => g.name) : [],
    synopsis: details.overview,
    trailer: trailer,
    tagline: details.tagline,
    episodes: details.number_of_episodes,
    seasons: details.number_of_seasons,
    status: details.status,
    networks: details.networks?.map(n => n.name) || [],
    creators: details.created_by?.map(c => c.name) || [],
    seasonDetails: details.seasons || []
  };
}

// Get drama by specific season
export async function getDramaSeason(id, seasonNumber, signal = null) {
  return tmdbFetch(`/tv/${id}/season/${seasonNumber}`, {}, signal);
}

// Search Drama specifically
export async function searchDrama(query, langFilter = null, signal = null) {
  const data = await tmdbFetch('/search/tv', { query }, signal);
  if (data.results) {
    const asianLangs = langFilter ? [langFilter] : ['ko', 'zh', 'ja', 'th'];
    return data.results
      .filter(item => asianLangs.includes(item.original_language))
      .map(mapTmdbDrama);
  }
  return [];
}

// Discover Drama released this month
export async function getNewDramaThisMonth(langFilter = null) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  
  const queryParams = {
    'first_air_date.gte': firstDayOfMonth,
    sort_by: 'popularity.desc'
  };
  
  if (langFilter) {
    queryParams.with_original_language = langFilter;
  }
  
  const data = await tmdbFetch('/discover/tv', queryParams);
  if (data.results) {
    const asianLangs = langFilter ? [langFilter] : ['ko', 'zh', 'ja', 'th'];
    return data.results
      .filter(item => asianLangs.includes(item.original_language))
      .map(mapTmdbDrama);
  }
  return [];
}
