const https = require('https');
const http = require('http');

exports.handler = async (event) => {
  const club = event.queryStringParameters?.club;
  if (!club) return respond(null, 'Geen clubnaam');

  try {
    const slug = toSlug(club);
    const clubUrl = `https://www.hollandsevelden.nl/clubs/${slug[0]}/${slug}/`;
    const html = await fetchUrl(clubUrl);

    if (!html) return respond(null, 'Pagina niet gevonden');

    // Pak de og:image meta tag
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
                 || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    let logoUrl = null;
    if (ogMatch && ogMatch[1] && !ogMatch[1].includes('transparent') && !ogMatch[1].includes('og-image')) {
      logoUrl = ogMatch[1].startsWith('http') ? ogMatch[1] : 'https://www.hollandsevelden.nl' + ogMatch[1];
    }

    // Fallback: probeer kort slug
    if (!logoUrl) {
      const shortSlug = slug.split('-')[0];
      if (shortSlug !== slug) {
        const html2 = await fetchUrl(`https://www.hollandsevelden.nl/clubs/${shortSlug[0]}/${shortSlug}/`);
        const og2 = html2 && (
          html2.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
          html2.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
        );
        if (og2 && og2[1] && !og2[1].includes('transparent')) {
          logoUrl = og2[1].startsWith('http') ? og2[1] : 'https://www.hollandsevelden.nl' + og2[1];
        }
      }
    }

    if (!logoUrl) return respond(null, 'Logo niet gevonden');

    // Download de afbeelding en stuur als base64 terug — zo omzeilen we CORS
    const { data: imgData, contentType } = await fetchImage(logoUrl);
    const base64 = `data:${contentType};base64,${imgData.toString('base64')}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ logoUrl: base64 }),
    };
  } catch (e) {
    return respond(null, e.message);
  }
};

function toSlug(name) {
  return name.toLowerCase()
    .replace(/^(vv|fc|sv|sc|csv|cvv|rkv|hvv)\s+/i, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '').trim()
    .replace(/\s+/g, '-');
}

function respond(logoUrl, error) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ logoUrl: logoUrl || null, error: error || null }),
  };
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Accept': 'text/html',
        'Accept-Language': 'nl-NL,nl;q=0.9',
      }
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : 'https://www.hollandsevelden.nl' + res.headers.location;
        fetchUrl(loc).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode === 404) { resolve(''); return; }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Referer': 'https://www.hollandsevelden.nl/',
      }
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        fetchImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const contentType = res.headers['content-type'] || 'image/png';
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ data: Buffer.concat(chunks), contentType }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Image timeout')); });
  });
}
