// API Service for Cinema Luxuoka
// Jikan API for Anime, TMDB API for Movies & TV Shows

const TMDB_API_KEY = 'a26af8590cebe78675d422a44f16b0bd';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// ============ ANIME (Jikan API) ============

export async function getTopAnime(page = 1) {
  const response = await fetch(`${JIKAN_BASE_URL}/top/anime?page=${page}&limit=20`);
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

export async function searchAnime(query) {
  const response = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=20`);
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

export async function getAnimeById(id) {
  const response = await fetch(`${JIKAN_BASE_URL}/anime/${id}/full`);
  const data = await response.json();
  const anime = data.data;
  return {
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
    rating_age: anime.rating
  };
}

// ============ MOVIES & TV SHOWS (TMDB API) ============

export async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  const response = await fetch(url);
  return response.json();
}

export function mapTmdbMovie(item) {
  return {
    id: item.id,
    imdbId: item.imdb_id,
    title: item.title,
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
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
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
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
export async function searchMovies(query) {
  const data = await tmdbFetch('/search/movie', { query });
  if (data.results) {
    return data.results.map(mapTmdbMovie);
  }
  return [];
}

// Search series
export async function searchSeries(query) {
  const data = await tmdbFetch('/search/tv', { query });
  if (data.results) {
    return data.results.map(mapTmdbSeries);
  }
  return [];
}

// Discover movies by genre
export async function discoverMoviesByGenre(genreId, sortBy = 'popularity') {
  const sortMap = {
    'popularity': 'popularity.desc',
    'vote_average': 'vote_average.desc',
    'release_date': 'release_date.desc'
  };

  const data = await tmdbFetch('/discover/movie', {
    with_genres: genreId,
    sort_by: sortMap[sortBy] || 'popularity.desc',
    'vote_count.gte': sortBy === 'vote_average' ? '100' : '0'
  });

  if (data.results) {
    return data.results.map(mapTmdbMovie);
  }
  return [];
}

// Discover series by genre
export async function discoverSeriesByGenre(genreId, sortBy = 'popularity') {
  const sortMap = {
    'popularity': 'popularity.desc',
    'vote_average': 'vote_average.desc',
    'first_air_date': 'first_air_date.desc'
  };

  const data = await tmdbFetch('/discover/tv', {
    with_genres: genreId,
    sort_by: sortMap[sortBy] || 'popularity.desc',
    'vote_count.gte': sortBy === 'vote_average' ? '50' : '0'
  });

  if (data.results) {
    return data.results.map(mapTmdbSeries);
  }
  return [];
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
export async function getMovieById(id) {
  const [details, videos] = await Promise.all([
    tmdbFetch(`/movie/${id}`),
    tmdbFetch(`/movie/${id}/videos`)
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
    backdrop: details.backdrop_path ? `${TMDB_IMAGE_BASE}/original${details.backdrop_path}` : null,
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
export async function getSeriesById(id) {
  const [details, videos] = await Promise.all([
    tmdbFetch(`/tv/${id}`),
    tmdbFetch(`/tv/${id}/videos`)
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
    backdrop: details.backdrop_path ? `${TMDB_IMAGE_BASE}/original${details.backdrop_path}` : null,
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
export async function searchAll(query) {
  const [movies, series, anime] = await Promise.all([
    searchMovies(query).catch(() => []),
    searchSeries(query).catch(() => []),
    searchAnime(query).catch(() => [])
  ]);
  return { movies, series, anime };
}

// Find TMDB ID for Anime
export async function findTmdbIdForAnime(title, titleEnglish, type) {
  try {
    const isMovie = type === 'Movie' || type === 'movie';
    const endpoint = isMovie ? '/search/movie' : '/search/tv';

    // Try searching with English title first if available, as TMDB prefers it
    let queries = [];
    if (titleEnglish) queries.push(titleEnglish);
    if (title && title !== titleEnglish) queries.push(title);

    for (const q of queries) {
      const data = await tmdbFetch(endpoint, { query: q });
      if (data.results && data.results.length > 0) {
        // Return the first result's ID
        return {
          id: data.results[0].id,
          type: isMovie ? 'movie' : 'series' // normalize to our app's types
        };
      }
    }
  } catch (error) {
    console.error('Error finding TMDB ID for anime:', error);
  }
  return null;
}
