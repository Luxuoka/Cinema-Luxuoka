// Serverless Function as a Proxy for TMDB API
// This runs on the server (e.g., Vercel, Netlify) and keeps the API key hidden.

export default async function handler(req, res) {
    // 1. Get query params from the request
    const { endpoint, ...params } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint is required' });
    }

    // 2. Get API key from environment variables
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        console.error('TMDB_API_KEY is not set in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // 3. Construct TMDB URL
    const baseUrl = 'https://api.themoviedb.org/3';
    const url = new URL(`${baseUrl}${endpoint}`);

    // 4. Attach API Key
    url.searchParams.append('api_key', apiKey);

    // 5. Append other params
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    try {
        // 6. Fetch from TMDB
        const response = await fetch(url.toString());
        const data = await response.json();

        // 7. Return data to frontend
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache for 1 hour
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching from TMDB:', error);
        return res.status(500).json({ error: 'Failed to fetch from TMDB' });
    }
}
