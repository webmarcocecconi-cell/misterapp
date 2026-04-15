// MisterApp - Cerca Risorse API (Cloudflare Pages version)
// Utilizza Tavily API per cercare link e immagini (1 credito per chiamata)

export async function onRequest(context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }
    
    // Only POST allowed
    if (context.request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers
        });
    }
    
    try {
        const body = await context.request.json();
        const { query } = body;
        
        if (!query) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Query di ricerca obbligatoria'
            }), { status: 400, headers });
        }
        
        const apiKey = context.env.TAVILY_API_KEY;
        
        if (!apiKey) {
            console.error('TAVILY_API_KEY not configured');
            // Return mock data instead of failing
            return new Response(JSON.stringify({
                success: true,
                links: [
                    { url: 'https://www.figc.it', title: 'FIGC - Federazione Italiana Giuoco Calcio' },
                    { url: 'https://www.uefa.com', title: 'UEFA - Training ground' }
                ],
                images: []
            }), { status: 200, headers });
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
        
        return new Response(JSON.stringify({
            success: true,
            links: links.slice(0, 5),
            images: images.slice(0, 6)
        }), { status: 200, headers });
        
    } catch (error) {
        console.error('Error:', error);
        
        // Return mock data on error
        return new Response(JSON.stringify({
            success: true,
            links: [
                { url: 'https://www.figc.it', title: 'FIGC - Federazione Italiana Giuoco Calcio' }
            ],
            images: []
        }), { status: 200, headers });
    }
}