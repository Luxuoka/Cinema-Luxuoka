// API Service for Cinema Luxuoka
// Jikan API for Anime, TMDB API for Movies & TV Shows

const TMDB_API_KEY = 'a26af8590cebe78675d422a44f16b0bd';
const WATCHMODE_API_KEY = 'GT0CZsQQBSGRU0RZ1Y5UVDDrcSxiQhSgi5jidHRo';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

// Streaming Service Constants (ID for Watchmode, tmdbId for TMDB Discover)
export const STREAMING_SERVICES = [
  { id: 203, tmdbId: 8, name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { id: 157, tmdbId: 15, name: 'Hulu', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg' },
  { id: 26, tmdbId: 119, name: 'Prime Video', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png' },
  { id: 372, tmdbId: 337, name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
  { id: 387, tmdbId: 384, name: 'HBO Max', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg' },
  { id: 371, tmdbId: 350, name: 'Apple TV+', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg' }
];

export function getStreamingServices() {
  return STREAMING_SERVICES;
}

// ============ CACHE UTILITY ============
const CACHE_TTL = 30 * 60 * 1000; // 30 mins for mapping data
const ANIME_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for anime details
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

// ============ ANIME (Jikan API) ============

export async function getTopAnime(page = 1, signal = null) {
  const cacheKey = `top_anime_${page}`;
  const cached = getCache(cacheKey, ANIME_CACHE_TTL);
  if (cached) return cached;

  const response = await fetch(`${JIKAN_BASE_URL}/top/anime?page=${page}&limit=20`);
  const data = await response.json();
  const results = data.data.map(anime => ({
    id: anime.mal_id,
    title: anime.title,
    titleEnglish: anime.title_english,
    poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    rating: anime.score,
    year: anime.year || anime.aired?.prop?.from?.year,
    genres: anime.genres?.map(g => g.name) || [],
    type: 'anime',
    animeType: anime.type,
    synopsis: anime.synopsis,
    episodes: anime.episodes,
    status: anime.status
  }));
  setCache(cacheKey, results);
  return results;
}

export async function searchAnime(query, signal = null) {
  // We don't cache search results as often, or use shorter TTL
  const response = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=20`, { signal });
  const data = await response.json();
  return data.data.map(anime => ({
    id: anime.mal_id,
    title: anime.title,
    titleEnglish: anime.title_english,
    poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    rating: anime.score,
    year: anime.year || anime.aired?.prop?.from?.year,
    genres: anime.genres?.map(g => g.name) || [],
    type: 'anime',
    animeType: anime.type,
    synopsis: anime.synopsis,
    episodes: anime.episodes,
    status: anime.status
  }));
}

export async function getAnimeById(id, signal = null) {
  const cacheKey = `anime_${id}`;
  const cached = getCache(cacheKey, ANIME_CACHE_TTL);
  if (cached) return cached;

  const response = await fetch(`${JIKAN_BASE_URL}/anime/${id}/full`, { signal });
  const data = await response.json();
  const anime = data.data;
  const result = {
    id: anime.mal_id,
    title: anime.title,
    titleEnglish: anime.title_english,
    titleJapanese: anime.title_japanese,
    poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    backdrop: anime.images?.jpg?.large_image_url,
    trailer: anime.trailer?.embed_url,
    trailerYoutube: anime.trailer?.youtube_id ? `https://www.youtube.com/embed/${anime.trailer.youtube_id}` : null,
    rating: anime.score,
    year: anime.year || anime.aired?.prop?.from?.year,
    genres: anime.genres?.map(g => g.name) || [],
    type: 'anime',
    animeType: anime.type, // Preserve original type
    synopsis: anime.synopsis,
    episodes: anime.episodes,
    status: anime.status,
    duration: anime.duration,
    studios: anime.studios?.map(s => s.name) || [],
    source: anime.source,
    rating_age: anime.rating,
    external: anime.external || [],
    imdbId: anime.external?.find(e => e.name === 'IMDb')?.url?.match(/tt\d+/)?.[0] || null
  };
  setCache(cacheKey, result);
  return result;
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

// Get anime by genre (Jikan API)
export async function getAnimeByGenre(genreId, page = 1) {
  const response = await fetch(`${JIKAN_BASE_URL}/anime?genres=${genreId}&page=${page}&limit=20&order_by=score&sort=desc`);
  const data = await response.json();
  return data.data.map(anime => ({
    id: anime.mal_id,
    title: anime.title,
    titleEnglish: anime.title_english,
    poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    rating: anime.score,
    year: anime.year || anime.aired?.prop?.from?.year,
    genres: anime.genres?.map(g => g.name) || [],
    type: 'anime',
    animeType: anime.type,
    synopsis: anime.synopsis,
    episodes: anime.episodes,
    status: anime.status
  }));
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
  const [movies, series, anime] = await Promise.all([
    searchMovies(query, signal).catch(() => []),
    searchSeries(query, signal).catch(() => []),
    searchAnime(query, signal).catch(() => [])
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

// Find TMDB ID for Anime
export async function findTmdbIdForAnime(title, titleEnglish, type, year, imdbId = null) {
  // 1. Try IMDB mapping first (highest accuracy)
  let mapping = null;
  if (imdbId) {
    mapping = await findTmdbIdByImdbId(imdbId);
  }

  const cacheKey = `anime_mapping_${title}_${titleEnglish}_${year}_${imdbId}`;
  const cached = getCache(cacheKey, MAPPING_CACHE_TTL);
  if (cached) return cached;

  try {
    const isMovie = type === 'Movie' || type === 'movie' || type === 'OVA' || type === 'Special';

    if (!mapping) {
      const endpoint = isMovie ? '/search/movie' : '/search/tv';
      let queries = [];
      if (titleEnglish) queries.push(titleEnglish);
      if (title) queries.push(title);

      const suffixQueries = queries.map(q => `${q} Anime`);
      const allQueries = [...queries, ...suffixQueries];

      for (const q of allQueries) {
        const params = { query: q };
        if (year) {
          if (isMovie) params.year = year;
          else params.first_air_date_year = year;
        }

        const data = await tmdbFetch(endpoint, params);
        if (data.results && data.results.length > 0) {
          const bestMatch = data.results.find(res => {
            const resDate = isMovie ? res.release_date : res.first_air_date;
            if (!resDate || !year) return false;
            const resYear = resDate.split('-')[0];
            return resYear === year.toString();
          }) || data.results[0];

          mapping = {
            id: bestMatch.id,
            type: isMovie ? 'movie' : 'series'
          };
          break;
        }
      }
    }

    if (mapping && mapping.type === 'series') {
      // Find the correct season if it's a TV series
      const seasons = await getTmdbSeriesSeasons(mapping.id);
      if (seasons.length > 0) {
        const bestSeason = seasons.find(s => {
          if (!s.air_date || !year) return false;
          return s.air_date.split('-')[0] === year.toString();
        });
        if (bestSeason) {
          mapping.season = bestSeason.season_number;
        } else {
          mapping.season = 1; // Default fallback
        }
      }
    }

    if (mapping) {
      setCache(cacheKey, mapping);
      return mapping;
    }
  } catch (error) {
    console.error('Error finding TMDB ID for anime:', error);
  }
  return null;
}

// ============ WATCHMODE API ============

async function watchmodeFetch(endpoint, params = {}) {
  const url = new URL(`${WATCHMODE_BASE_URL}${endpoint}`);
  url.searchParams.append('apiKey', WATCHMODE_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const cacheKey = `watchmode_${endpoint}_${JSON.stringify(params)}`;
  const cached = getCache(cacheKey, CACHE_TTL);
  if (cached) return cached;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Watchmode API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (e) {
    console.error('Watchmode Fetch Error:', e);
    return null;
  }
}


// Use Watchmode API for accurate service-specific catalogs
export async function getTitlesByService(serviceId, type = 'movie') {
  // Map 'series' to 'tv_series' for Watchmode
  const wmType = type === 'series' || type === 'tv' ? 'tv_series' : 'movie';

  const params = {
    source_ids: serviceId,
    types: wmType,
    sort_by: 'popularity_desc',
    limit: 20,
    region: 'ID' // Focus on content available in Indonesia if possible
  };

  try {
    const data = await watchmodeFetch('/list-titles/', params);
    if (!data || !data.titles) return [];

    // Watchmode returns basic info. We need to enrich with TMDB for posters/metadata.
    // We use the tmdb_id provided by Watchmode to fetch full details.
    const enrichedPromises = data.titles.map(async (t) => {
      if (!t.tmdb_id) return null; // Skip if no TMDB ID (cant display well)

      try {
        // Fetch details from TMDB to get the poster and correct localized metadata
        const tmdbType = t.tmdb_type === 'movie' ? 'movie' : 'tv';
        const details = await tmdbFetch(`/${tmdbType}/${t.tmdb_id}`);

        if (!details) return null;

        return {
          id: details.id,
          title: details.title || details.name,
          poster: details.poster_path ? `${TMDB_IMAGE_BASE}/w500${details.poster_path}` : 'https://via.placeholder.com/300x450',
          rating: details.vote_average ? details.vote_average.toFixed(1) : 'N/A',
          year: (details.release_date || details.first_air_date || '').split('-')[0],
          type: tmdbType,
          tmdbMapping: { id: details.id, type: tmdbType }
        };
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(enrichedPromises);
    return results.filter(r => r !== null);
  } catch (error) {
    console.error('Watchmode fetch failed:', error);
    return [];
  }
}

// Get specialized content (Asian/Local) using TMDB Discover with Provider filter
export async function getServiceSpecificContent(serviceId, type, country = null, genre = null) {
  const service = STREAMING_SERVICES.find(s => s.id == serviceId);
  if (!service || !service.tmdbId) return [];

  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  const params = {
    with_watch_providers: service.tmdbId,
    watch_region: 'ID',
    sort_by: 'popularity.desc',
    'vote_count.gte': 10
  };

  if (country) params.with_origin_country = country;
  if (genre) params.with_genres = genre;

  try {
    const data = await tmdbFetch(endpoint, params);
    if (!data.results) return [];

    return data.results.map(item => ({
      id: item.id,
      title: item.title || item.name,
      poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
      rating: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
      year: (item.release_date || item.first_air_date || '').split('-')[0],
      type: type === 'movie' ? 'movie' : 'series',
      tmdbMapping: { id: item.id, type: type === 'movie' ? 'movie' : 'series' } // Explicit mapping
    }));
  } catch (e) {
    return [];
  }
}

// Get streaming sources for a specific movie/show
export async function getStreamingSources(tmdbId, type) {
  // 1. Find Watchmode ID
  const searchType = type === 'series' ? 'tv' : 'movie';
  // Note: Watchmode search param for type is 'movie' or 'tv'

  const searchData = await watchmodeFetch(`/search/`, {
    search_field: 'tmdb_id',
    search_value: tmdbId,
    types: searchType
  });

  if (!searchData || !searchData.title_results || searchData.title_results.length === 0) {
    return [];
  }

  const watchmodeId = searchData.title_results[0].id;

  // 2. Get Sources
  const sourcesData = await watchmodeFetch(`/title/${watchmodeId}/sources/`);

  if (!sourcesData) return [];

  // Filter and map
  return sourcesData
    .filter(s => s.type === 'sub' || s.type === 'free') // Subscription or Free
    .map(s => ({
      source_id: s.source_id,
      name: s.name,
      type: s.type,
      region: s.region,
      web_url: s.web_url,
      format: s.format,
      price: s.price,
      seasons: s.seasons,
      episodes: s.episodes,
      logo: STREAMING_SERVICES.find(srv => srv.id == s.source_id)?.logo || null
    }));
}
