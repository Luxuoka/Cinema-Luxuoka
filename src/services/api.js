// TMDB API for Movies & TV Shows

const TMDB_API_KEY = 'a26af8590cebe78675d422a44f16b0bd';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// ============ CACHE UTILITY ============
const CACHE_TTL = 30 * 60 * 1000; // 30 mins for mapping data
const MAPPING_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for ID mappings

function getCache(key, customTTL = null) {
  try {
    const cached = localStorage.getItem(`api_cache_${key}`);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    const ttl = customTTL || CACHE_TTL;
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(`api_cache_${key}`);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Cache read error:', e);
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(`api_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Clear half of the cache if full
      const keys = Object.keys(localStorage).filter(k => k.startsWith('api_cache_'));
      keys.slice(0, Math.floor(keys.length / 2)).forEach(k => localStorage.removeItem(k));
    }
  }
}

// ============ MOVIES & TV SHOWS (TMDB API) ============

export async function tmdbFetch(endpoint, params = {}, signal = null) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US'); // en-US is faster and has more metadata
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  // Caching TMDB requests (except search)
  const isSearch = endpoint.includes('/search');
  const cacheKey = `tmdb_${endpoint}_${JSON.stringify(params)}`;

  if (!isSearch) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  const response = await fetch(url, { signal });
  const data = await response.json();

  // TMDB errors use status_code, not .error
  if (!isSearch && data && !data.status_code) {
    setCache(cacheKey, data);
  }

  return data;
}

export function mapTmdbMovie(item) {
  return {
    id: item.id,
    imdbId: item.imdb_id,
    title: item.title,
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : null,
    rating: item.vote_average ? item.vote_average.toFixed(1) : null,
    year: item.release_date ? item.release_date.split('-')[0] : null,
    type: 'movie'
  };
}

export function mapTmdbSeries(item) {
  return {
    id: item.id,
    title: item.name,
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : null,
    rating: item.vote_average ? item.vote_average.toFixed(1) : null,
    year: item.first_air_date ? item.first_air_date.split('-')[0] : null,
    type: 'series'
  };
}

// Get trending movies (Fresh & Popular)
export async function getTrendingMovies() {
  const data = await tmdbFetch('/trending/movie/week');
  if (data.results) {
    return data.results.map(mapTmdbMovie);
  }
  return [];
}

// Get trending series (Fresh & Popular)
export async function getTrendingSeries() {
  const data = await tmdbFetch('/trending/tv/week');
  if (data.results) {
    return data.results.map(mapTmdbSeries);
  }
  return [];
}

// Get trending today (All types)
export async function getTrendingToday() {
  const data = await tmdbFetch('/trending/all/day');
  if (data.results) {
    return data.results.map(item => {
      if (item.media_type === 'tv') return mapTmdbSeries(item);
      return mapTmdbMovie(item);
    });
  }
  return [];
}

// Get now playing movies (New Releases)
export async function getNowPlayingMovies() {
  const data = await tmdbFetch('/movie/now_playing');
  if (data.results) {
    return data.results.map(mapTmdbMovie);
  }
  return [];
}

// Get airing today series (New Releases)
export async function getAiringTodaySeries() {
  const data = await tmdbFetch('/tv/on_the_air');
  if (data.results) {
    return data.results.map(mapTmdbSeries);
  }
  return [];
}

// Get popular movies (as "Best Movies" 8+)
export async function getPopularMovies() {
  return getTopRatedMovies();
}

// Get popular series (as "Best Series" 8+)
export async function getPopularSeries() {
  return getTopRatedSeries();
}

// Helper for top rated movies >= 8.0
async function getTopRatedMovies() {
  const data = await tmdbFetch('/discover/movie', {
    sort_by: 'vote_average.desc',
    'vote_count.gte': '300',
    'vote_average.gte': '8.0'
  });
  if (data.results) {
    return data.results.map(mapTmdbMovie);
  }
  return [];
}

// Helper for top rated series >= 8.0
async function getTopRatedSeries() {
  const data = await tmdbFetch('/discover/tv', {
    sort_by: 'vote_average.desc',
    'vote_count.gte': '150',
    'vote_average.gte': '8.0'
  });
  if (data.results) {
    return data.results.map(mapTmdbSeries);
  }
  return [];
}

// Search movies
export async function searchMovies(query, signal = null) {
  const data = await tmdbFetch('/search/movie', { query }, signal);
  if (data.results) {
    return data.results.map(mapTmdbMovie);
  }
  return [];
}

// Search series
export async function searchSeries(query, signal = null) {
  const data = await tmdbFetch('/search/tv', { query }, signal);
  if (data.results) {
    return data.results.map(mapTmdbSeries);
  }
  return [];
}

// Discover movies with flexible params
export async function discoverMovies(params = {}) {
  const sortMap = {
    'popularity': 'popularity.desc',
    'vote_average': 'vote_average.desc',
    'release_date': 'release_date.desc'
  };

  const queryParams = {
    with_genres: params.genre,
    primary_release_year: params.year,
    with_origin_country: params.country,
    'vote_average.gte': params.ratingGte || (params.sortBy === 'vote_average' ? '8.0' : '0'),
    sort_by: sortMap[params.sortBy] || 'popularity.desc',
    'vote_count.gte': params.sortBy === 'vote_average' ? '100' : '20'
  };

  const data = await tmdbFetch('/discover/movie', queryParams);
  return data.results ? data.results.map(mapTmdbMovie) : [];
}

// Discover series with flexible params
export async function discoverSeries(params = {}) {
  const sortMap = {
    'popularity': 'popularity.desc',
    'vote_average': 'vote_average.desc',
    'first_air_date': 'first_air_date.desc'
  };

  const queryParams = {
    with_genres: params.genre,
    first_air_date_year: params.year,
    with_origin_country: params.country,
    'vote_average.gte': params.ratingGte || (params.sortBy === 'vote_average' ? '8.0' : '0'),
    sort_by: sortMap[params.sortBy] || 'popularity.desc',
    'vote_count.gte': params.sortBy === 'vote_average' ? '50' : '10'
  };

  const data = await tmdbFetch('/discover/tv', queryParams);
  return data.results ? data.results.map(mapTmdbSeries) : [];
}

// Discover movies by genre (legacy support)
export async function discoverMoviesByGenre(genreId, sortBy = 'popularity') {
  return discoverMovies({ genre: genreId, sortBy });
}

// Discover series by genre (legacy support)
export async function discoverSeriesByGenre(genreId, sortBy = 'popularity') {
  return discoverSeries({ genre: genreId, sortBy });
}

// Get movie details with trailer
export async function getMovieById(id, signal = null) {
  const [details, videos] = await Promise.all([
    tmdbFetch(`/movie/${id}`, {}, signal),
    tmdbFetch(`/movie/${id}/videos`, {}, signal)
  ]);

  // Find YouTube trailer
  let trailer = null;
  if (videos.results) {
    const trailerVideo = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
      || videos.results.find(v => v.site === 'YouTube');
    if (trailerVideo) {
      trailer = `https://www.youtube.com/embed/${trailerVideo.key}`;
    }
  }

  return {
    id: details.id,
    imdbId: details.imdb_id,
    title: details.title,
    poster: details.poster_path ? `${TMDB_IMAGE_BASE}/w500${details.poster_path}` : null,
    backdrop: details.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${details.backdrop_path}` : null,
    rating: details.vote_average ? details.vote_average.toFixed(1) : null,
    year: details.release_date ? details.release_date.split('-')[0] : null,
    genres: details.genres ? details.genres.map(g => g.name) : [],
    synopsis: details.overview,
    runtime: details.runtime ? `${details.runtime} min` : null,
    type: 'movie',
    trailer: trailer,
    tagline: details.tagline,
    budget: details.budget,
    revenue: details.revenue,
    status: details.status,
    productionCompanies: details.production_companies?.map(c => c.name) || []
  };
}

// Get series details with trailer
export async function getSeriesById(id, signal = null) {
  const [details, videos] = await Promise.all([
    tmdbFetch(`/tv/${id}`, {}, signal),
    tmdbFetch(`/tv/${id}/videos`, {}, signal)
  ]);

  // Find YouTube trailer
  let trailer = null;
  if (videos.results) {
    const trailerVideo = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
      || videos.results.find(v => v.site === 'YouTube');
    if (trailerVideo) {
      trailer = `https://www.youtube.com/embed/${trailerVideo.key}`;
    }
  }

  return {
    id: details.id,
    title: details.name,
    poster: details.poster_path ? `${TMDB_IMAGE_BASE}/w500${details.poster_path}` : null,
    backdrop: details.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${details.backdrop_path}` : null,
    rating: details.vote_average ? details.vote_average.toFixed(1) : null,
    year: details.first_air_date ? details.first_air_date.split('-')[0] : null,
    genres: details.genres ? details.genres.map(g => g.name) : [],
    synopsis: details.overview,
    type: 'series',
    trailer: trailer,
    tagline: details.tagline,
    episodes: details.number_of_episodes,
    seasons: details.number_of_seasons,
    status: details.status,
    networks: details.networks?.map(n => n.name) || [],
    creators: details.created_by?.map(c => c.name) || []
  };
}

// Search all types
export async function searchAll(query, signal = null) {
  // We'll dynamically import the anime service to avoid circular dependencies if any,
  // or just import it at the top. For simplicity, we can fetch it directly here
  // but it's cleaner to use the animeApi if we want consistent formatting.
  const { searchAnime } = await import('./animeApi.js');
  
  const [movies, series, anime] = await Promise.all([
    searchMovies(query, signal).catch(() => []),
    searchSeries(query, signal).catch(() => []),
    searchAnime(query, 20, signal).catch(() => [])
  ]);
  return { movies, series, anime };
}

// Get TMDB series seasons
export async function getTmdbSeriesSeasons(tmdbId) {
  try {
    const data = await tmdbFetch(`/tv/${tmdbId}`);
    return data.seasons || [];
  } catch (error) {
    console.warn('Failed to fetch seasons for mapping:', error);
    return [];
  }
}

// Find TMDB ID using IMDB ID (Most accurate)
export async function findTmdbIdByImdbId(imdbId) {
  if (!imdbId) return null;
  const cacheKey = `imdb_mapping_${imdbId}`;
  const cached = getCache(cacheKey, MAPPING_CACHE_TTL);
  if (cached) return cached;

  try {
    const data = await tmdbFetch(`/find/${imdbId}`, { external_source: 'imdb_id' });
    let result = null;

    if (data.movie_results && data.movie_results.length > 0) {
      result = { id: data.movie_results[0].id, type: 'movie' };
    } else if (data.tv_results && data.tv_results.length > 0) {
      result = { id: data.tv_results[0].id, type: 'series' };
    }

    if (result) {
      setCache(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error('Error finding TMDB by IMDB:', error);
  }
  return null;
}

