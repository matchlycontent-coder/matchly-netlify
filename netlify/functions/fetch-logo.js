const https = require('https');

// Haal het logo op van hollandsevelden.nl voor een gegeven clubnaam
exports.handler = async (event) => {
  const club = event.queryStringParameters?.club;
  if (!club) {
    return respond(null, 'Geen clubnaam opgegeven');
  }

  try {
    // Stap 1: Maak slug van clubnaam
    const slug = toSlug(club);
    const firstLetter = slug[0];

    // Stap 2: Probeer directe URL op hollandsevelden.nl
    const clubUrl = `https://www.hollandsevelden.nl/clubs/${firstLetter}/${slug}/`;
    const html = await fetchUrl(clubUrl);

    // Stap 3: Logo URL uit HTML halen
    const logoUrl = extractLogo(html);

    if (logoUrl) {
      return respond(logoUrl);
    }

    // Stap 4: Fallback — probeer zonder prefix (bijv. "svv" i.p.v. "svv-schiedam")
    const shortSlug = slug.split('-')[0];
    if (shortSlug !== slug) {
      const shortUrl = `https://www.hollandsevelden.nl/clubs/${shortSlug[0]}/${shortSlug}/`;
      const html2 = await fetchUrl(shortUrl);
      const logoUrl2 = extractLogo(html2);
      if (logoUrl2) return respond(logoUrl2);
    }

    return respond(null);
  } catch (e) {
    return respond(null, e.message);
  }
};

// Clubnaam → URL slug
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/^(vv|fc|sv|sc|csv|cvv|rkv|hvv|afc|bvv|ods|rkvv|vios)\s+/i, '') // strip prefixen
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // accenten weg
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Logo URL uit HTML extraheren
function extractLogo(html) {
  if (!html) return null;

  // Probeer verschillende lazy-loading attributen
  const patterns = [
    /data-src="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"]*)"/gi,
    /data-original="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"]*)"/gi,
    /data-lazy-src="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"]*)"/gi,
    /data-srcset="([^"]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp)[^"\s]*)"/gi,
  ];

  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    for (const m of matches) {
      const url = m[1].trim().split(' ')[0]; // pak eerste URL bij srcset
      if (url && !url.includes('transparent') && !url.includes('placeholder') && !url.includes('blank')) {
        return url.startsWith('http') ? url : 'https://www.hollandsevelden.nl' + url;
      }
    }
  }
  return null;
}

function respond(logoUrl, error) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ logoUrl: logoUrl || null, error: error || null }),
  };
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
    };

    const req = https.get(url, options, (res) => {
      // Volg redirects
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : 'https://www.hollandsevelden.nl' + res.headers.location;
        fetchUrl(loc).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode === 404) { resolve(''); return; }

      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}
