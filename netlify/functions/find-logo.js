const https = require('https');

// Haalt de inhoud van een URL op. Volgt automatisch redirects (max 5).
function fetchText(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Te veel redirects'));
      return;
    }

    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MatchlyBot/1.0)' } }, (res) => {
      // Volg redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://www.hollandsevelden.nl${res.headers.location}`;
        res.resume();
        fetchText(next, redirectCount + 1).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} op ${url}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout bij ophalen ' + url));
    });
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function jsonResponse(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let clubName;
  try {
    const parsed = JSON.parse(event.body || '{}');
    clubName = (parsed.clubName || '').trim();
  } catch {
    return jsonResponse(400, { error: 'Ongeldige JSON' });
  }

  if (!clubName) {
    return jsonResponse(400, { error: 'clubName ontbreekt' });
  }

  console.log(`Zoeken logo voor: ${clubName}`);

  try {
    // STAP 1: zoek op hollandsevelden.nl
    const searchUrl = `https://www.hollandsevelden.nl/zoeken/?q=${encodeURIComponent(clubName)}`;
    console.log(`Search URL: ${searchUrl}`);

    const searchHtml = await fetchText(searchUrl);

    // Vind eerste clubpagina-link in de zoekresultaten
    // Patroon: /clubs/x/club-slug/  (x = eerste letter)
    const clubLinkMatch = searchHtml.match(/href="(\/clubs\/[a-z]\/[a-z0-9-]+\/)"/);

    if (!clubLinkMatch) {
      console.log('Geen clubpagina gevonden in zoekresultaten');
      return jsonResponse(200, { logoUrl: null, reason: 'Geen clubpagina gevonden' });
    }

    const clubPagePath = clubLinkMatch[1];
    const clubPageUrl = `https://www.hollandsevelden.nl${clubPagePath}`;
    console.log(`Clubpagina: ${clubPageUrl}`);

    // STAP 2: haal de clubpagina op
    const clubPageHtml = await fetchText(clubPageUrl);

    // STAP 3: pak het echte logo uit de og:image meta tag
    const ogImageMatch = clubPageHtml.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    if (!ogImageMatch) {
      console.log('Geen og:image gevonden op clubpagina');
      return jsonResponse(200, { logoUrl: null, reason: 'Geen og:image op clubpagina' });
    }

    let logoUrl = ogImageMatch[1];
    if (logoUrl.startsWith('/')) {
      logoUrl = `https://www.hollandsevelden.nl${logoUrl}`;
    }

    // Optioneel: pak ook de propere clubnaam uit de pagina titel
    let displayName = clubName;
    const titleMatch = clubPageHtml.match(/<title>[^|]*?(?:club\s+)?([A-Za-z0-9'\-\s\.]+?)\s+(?:from|uit)\s+/i);
    if (titleMatch) {
      displayName = titleMatch[1].trim();
    }

    console.log(`Logo URL: ${logoUrl}`);
    console.log(`Display name: ${displayName}`);

    return jsonResponse(200, {
      logoUrl,
      displayName,
      clubPageUrl,
      source: 'hollandsevelden',
    });

  } catch (err) {
    console.log('Fout:', err.message);
    return jsonResponse(500, { error: err.message, logoUrl: null });
  }
};
