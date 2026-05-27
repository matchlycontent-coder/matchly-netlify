// image-proxy.js
// Haalt afbeeldingen van hollandsevelden.nl op via de server (omzeilt CORS).
// Gebruik: /.netlify/functions/image-proxy?url=https://www.hollandsevelden.nl/images/...

const https = require('https');
const http  = require('http');

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const imageUrl = event.queryStringParameters?.url;

  if (!imageUrl) {
    return { statusCode: 400, headers: corsHeaders, body: 'url parameter ontbreekt' };
  }

  // Alleen hollandsevelden-afbeeldingen doorlaten (veiligheid)
  if (!imageUrl.includes('hollandsevelden.nl')) {
    return { statusCode: 403, headers: corsHeaders, body: 'Alleen hollandsevelden.nl URLs toegestaan' };
  }

  try {
    const imageData = await fetchImage(imageUrl);
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': imageData.contentType || 'image/png',
        'Cache-Control': 'public, max-age=604800', // 1 week in cache
      },
      body: imageData.base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    console.log('Image proxy fout:', err.message, 'URL:', imageUrl);
    return { statusCode: 500, headers: corsHeaders, body: 'Afbeelding ophalen mislukt: ' + err.message };
  }
};

function fetchImage(url, hops = 0) {
  return new Promise((resolve, reject) => {
    if (hops > 5) { reject(new Error('Te veel redirects')); return; }

    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.hollandsevelden.nl/',
        'Accept': 'image/png,image/jpeg,image/webp,image/*',
      }
    }, (res) => {
      // Volg redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://www.hollandsevelden.nl${res.headers.location}`;
        res.resume();
        fetchImage(next, hops + 1).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          base64: buffer.toString('base64'),
          contentType: res.headers['content-type'] || 'image/png',
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}
