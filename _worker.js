export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/_next/static/')) {
      // Serve static files from Cloudflare's CDN
      const response = await fetch(request);
      const headers = new Headers(response.headers);
      headers.set('cache-control', 'public, max-age=31536000, immutable');
      return new Response(response.body, {
        ...response,
        headers,
      });
    }
    
    // Let Next.js handle the request
    return env.ASSETS.fetch(request);
  },
}; 