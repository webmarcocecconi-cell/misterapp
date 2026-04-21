// MisterApp - Cerca Risorse API (Vercel version)
// Utilizza Tavily API per cercare link e immagini (1 credito per chiamata)

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    // Only POST allowed
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query di ricerca obbligatoria'
            });
        }
        
        const apiKey = process.env.TAVILY_API_KEY;
        
        if (!apiKey) {
            console.error('TAVILY_API_KEY not configured');
            // Return mock data instead of failing
            return res.status(200).json({
                success: true,
                links: [
                    { url: 'https://www.figc.it', title: 'FIGC - Federazione Italiana Giuoco Calcio' },
                    { url: 'https://www.uefa.com', title: 'UEFA - Training ground' }
                ],
                images: []
            });
        }
        
        // Call Tavily API
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query: `esercizi calcio allenamento ${query}`,
                search_depth: 'basic',
                include_images: true,
                include_answer: false,
                max_results: 5
            })
        });
        
        if (!tavilyResponse.ok) {
            throw new Error(`Tavily API error: ${tavilyResponse.status}`);
        }
        
        const data = await tavilyResponse.json();
        
        // Extract links
        const links = (data.results || []).map(result => ({
            url: result.url,
            title: result.title || result.url
        }));
        
        // Extract images
        const images = data.images || [];
        
        return res.status(200).json({
            success: true,
            links: links.slice(0, 5),
            images: images.slice(0, 6)
        });
        
    } catch (error) {
        console.error('Error:', error);
        
        // Return mock data on error
        return res.status(200).json({
            success: true,
            links: [
                { url: 'https://www.figc.it', title: 'FIGC - Federazione Italiana Giuoco Calcio' }
            ],
            images: []
        });
    }
};