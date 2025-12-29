
const TMDB_API_KEY = 'a26af8590cebe78675d422a44f16b0bd';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

async function tmdbFetch(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    url.searchParams.append('language', 'en-US');
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });
    const response = await fetch(url);
    return response.json();
}

async function findTmdbIdForAnime(title, titleEnglish, type) {
    try {
        const isMovie = type === 'Movie';
        const endpoint = isMovie ? '/search/movie' : '/search/tv';

        let queries = [];
        if (titleEnglish) queries.push(titleEnglish);
        if (title && title !== titleEnglish) queries.push(title);

        console.log(`Searching TMDB for: ${queries.join(', ')} (Type: ${type})`);

        for (const q of queries) {
            const data = await tmdbFetch(endpoint, { query: q });
            if (data.results && data.results.length > 0) {
                console.log(`Found match for query "${q}":`, data.results[0].title || data.results[0].name, `(ID: ${data.results[0].id})`);
                return {
                    id: data.results[0].id,
                    type: isMovie ? 'movie' : 'series'
                };
            }
        }
    } catch (error) {
        console.error('Error finding TMDB ID for anime:', error);
    }
    return null;
}

async function getAnimeById(id) {
    const response = await fetch(`${JIKAN_BASE_URL}/anime/${id}/full`);
    const data = await response.json();
    return data.data;
}

async function run() {
    console.log("Fetching Anime ID 52991 (Frieren) from Jikan...");
    try {
        const anime = await getAnimeById(52991);
        if (!anime) {
            console.log("Anime not found on Jikan.");
            return;
        }

        console.log(`\nChecking Anime: ${anime.title} (English: ${anime.title_english}) (Type: ${anime.type})`);
        const mapping = await findTmdbIdForAnime(anime.title, anime.title_english, anime.type);

        if (mapping) {
            console.log(`Mapped to TMDB ID: ${mapping.id} (${mapping.type})`);
            console.log(`VidLink URL: https://vidlink.pro/${mapping.type === 'movie' ? 'movie' : 'tv'}/${mapping.id}`);
        } else {
            console.log("Failed to map to TMDB.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
