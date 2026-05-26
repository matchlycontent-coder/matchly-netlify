const https = require('https');

exports.handler = async (event) => {
  const club = event.queryStringParameters?.club;
  if (!club) return respond(null, 'Geen clubnaam');

  try {
    const slug = toSlug(club);
    const firstLetter = slug[0];
    const clubUrl = `https://www.hollandsevelden.nl/clubs/${firstLetter}/${slug}/`;
    const html = await fetchUrl(clubUrl);

    if (!html) return respond(null, 'Pagina niet gevonden');

    // Debug: stuur een stukje HTML terug
    const snippet = html.substring(0, 3000);

    const logoUrl = extractLogo(html);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ logoUrl, slug, clubUrl, htmlSnippet: snippet })
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

function extractLogo(html) {
  const patterns = [
    /data-src="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"]*)"/gi,
    /data-original="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"]*)"/gi,
    /data-lazy="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"]*)"/gi,
    /data-lazy-src="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"]*)"/gi,
    /data-srcset="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"\s]*)"/gi,
    /"logo[^"]*":\s*"([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"]*)"/gi,
    /background-image:\s*url\(['"]?([^'")]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^'")]*)/gi,
  ];
  for (const p of patterns) {
    const matches = [...html.matchAll(p)];
    for (const m of matches) {
      const url = m[1].trim().split(' ')[0];
      if (url && !url.includes('transparent') && !url.includes('placeholder')) {
        return url.startsWith('http') ? url : 'https://www.hollandsevelden.nl' + url;
      }
    }
  }
  return null;
}

function respond(logoUrl, error) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ logoUrl: logoUrl||null, error: error||null })
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
