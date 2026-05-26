const https = require('https');
const http = require('http');

exports.handler = async (event) => {
  const club = event.queryStringParameters?.club;
  if (!club) return respond(null, 'Geen clubnaam');

  try {
    const slug = toSlug(club);
    const clubUrl = `https://www.hollandsevelden.nl/clubs/${slug[0]}/${slug}/`;
    const html = await fetchUrl(clubUrl);

    if (!html) {
      // Fallback: korte slug
      const shortSlug = slug.split('-')[0];
      if (shortSlug !== slug) {
        const html2 = await fetchUrl(`https://www.hollandsevelden.nl/clubs/${shortSlug[0]}/${shortSlug}/`);
        const logo2 = html2 && extractOgImage(html2);
        if (logo2) return await respondWithImage(logo2);
      }
      return respond(null, 'Pagina niet gevonden');
    }

    const logoUrl = extractOgImage(html);
    if (logoUrl) return await respondWithImage(logoUrl);

    // Fallback korte slug
    const shortSlug = slug.split('-')[0];
    if (shortSlug !== slug) {
      const html2 = await fetchUrl(`https://www.hollandsevelden.nl/clubs/${shortSlug[0]}/${shortSlug}/`);
      const logo2 = html2 && extractOgImage(html2);
      if (logo2) return await respondWithImage(logo2);
    }

    return respond(null, 'Logo niet gevonden');
  } catch (e) {
    return respond(null, e.message);
  }
};

function extractOgImage(html) {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (m && m[1] && !m[1].includes('transparent') && !m[1].includes('og-image')) {
    return m[1].startsWith('http') ? m[1] : 'https://www.hollandsevelden.nl' + m[1];
  }
  return null;
}

async function respondWithImage(logoUrl) {
  try {
    const { data, contentType } = await fetchImage(logoUrl);
    const base64 = `data:${contentType};base64,${data.toString('base64')}`;
    return respond(base64);
  } catch(e) {
    return respond(logoUrl); // fallback: stuur URL terug zonder base64
  }
}

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

function fetchUrl(url, redirectCount = 0) {
  if (redirectCount > 5) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Accept': 'text/html',
        'Accept-Language': 'nl-NL,nl;q=0.9',
        'Cache-Control': 'no-cache',
      }
    }, (res) => {
      if ([301,302,307,308].includes(res.statusCode) && res.headers.location) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : 'https://www.hollandsevelden.nl' + res.headers.location;
        fetchUrl(loc, redirectCount + 1).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode === 404) { resolve(''); return; }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.setTimeout(8000, () => { req.destroy(); resolve(''); }); // 15s timeout, geen crash
  });
}

function fetchImage(url, redirectCount = 0) {
  if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.hollandsevelden.nl/',
      }
    }, (res) => {
      if ([301,302,307,308].includes(res.statusCode) && res.headers.location) {
        fetchImage(res.headers.location, redirectCount + 1).then(resolve).catch(reject);
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
