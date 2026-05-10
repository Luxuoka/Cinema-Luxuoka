// Serverless Function as a Proxy for MyAnimeList API v2
// This runs on the server (e.g., Vercel) and keeps the Client ID hidden.

export default async function handler(req, res) {
    // 1. Get query params from the request
    const { endpoint, ...params } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint is required' });
    }

    // 2. Get MAL Client ID from environment variables
    const clientId = process.env.MAL_CLIENT_ID;

    if (!clientId) {
        console.error('MAL_CLIENT_ID is not set in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // 3. Construct MAL API URL
    const baseUrl = 'https://api.myanimelist.net/v2';
    const url = new URL(`${baseUrl}${endpoint}`);

    // 4. Append query params
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    try {
        // 5. Fetch from MAL API with Client ID header
        const response = await fetch(url.toString(), {
            headers: {
                'X-MAL-CLIENT-ID': clientId
            }
        });
        const data = await response.json();

        // 6. Return data to frontend
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Error fetching from MAL:', error);
        return res.status(500).json({ error: 'Failed to fetch from MAL API' });
    }
}
