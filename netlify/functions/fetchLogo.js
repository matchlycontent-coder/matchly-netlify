const https = require('https');

// Supabase config uit Netlify env vars
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

exports.handler = async (event) => {
  const club = event.queryStringParameters?.club;
  if (!club) return respond(null, 'Geen clubnaam');

  const slug = toSlug(club);

  try {
    // STAP 1: Check eerst in Supabase cache
    const cached = await findInSupabase(slug);
    if (cached) {
      return respond(cached, null, 'cache');
    }

    // STAP 2: Niet gevonden, ga scrapen
    const shortSlug = slug.split('-')[0];
    const urls = [
      `https://www.hollandsevelden.nl/clubs/${slug[0]}/${slug}/`,
      `https://www.hollandsevelden.nl/en/clubs/${slug[0]}/${slug}/`,
    ];
    if (shortSlug !== slug) {
      urls.push(`https://www.hollandsevelden.nl/clubs/${shortSlug[0]}/${shortSlug}/`);
      urls.push(`https://www.hollandsevelden.nl/en/clubs/${shortSlug[0]}/${shortSlug}/`);
    }

    for (const url of urls) {
      const html = await fetchUrl(url);
      if (html) {
        const logoUrl = extractOgImage(html);
        if (logoUrl) {
          const base64 = await fetchImageAsBase64(logoUrl);
          if (base64) {
            // STAP 3: Bewaar in Supabase voor volgende keer
            saveToSupabase(slug, club, base64, 'hollandsevelden').catch(()=>{});
            return respond(base64, null, 'scraped');
          }
          saveToSupabase(slug, club, logoUrl, 'hollandsevelden').catch(()=>{});
          return respond(logoUrl, null, 'scraped');
        }
      }
    }

    return respond(null, 'Pagina niet gevonden');
  } catch (e) {
    return respond(null, e.message);
  }
};

// === Supabase helpers ===
async function findInSupabase(clubSlug) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const url = `${SUPABASE_URL}/rest/v1/club_logos?club_name=eq.${encodeURIComponent(clubSlug)}&select=logo_data`;
  try {
    const data = await httpsRequest(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    });
    const arr = JSON.parse(data);
    return Array.isArray(arr) && arr[0] && arr[0].logo_data ? arr[0].logo_data : null;
  } catch (e) {
    return null;
  }
}

async function saveToSupabase(clubSlug, displayName, logoData, source) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const url = `${SUPABASE_URL}/rest/v1/club_logos`;
  try {
    await httpsRequest(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        club_name: clubSlug,
        display_name: displayName,
        logo_data: logoData,
        source: source,
        updated_at: new Date().toISOString(),
      })
    });
  } catch (e) {}
}

function httpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: options.method,
      headers: options.headers,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

// === Scraping helpers ===
function extractOgImage(html) {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
         || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (m && m[1] && !m[1].includes('transparent') && !m[1].includes('og-image')) {
    return m[1].startsWith('http') ? m[1] : 'https://www.hollandsevelden.nl' + m[1];
  }
  return null;
}

async function fetchImageAsBase64(logoUrl) {
  try {
    const { data, contentType } = await fetchImage(logoUrl);
    return `data:${contentType};base64,${data.toString('base64')}`;
  } catch (e) {
    return null;
  }
}

function toSlug(name) {
  return name.toLowerCase()
    .replace(/^(vv|fc|sv|sc|csv|cvv|rkv|hvv)\s+/i, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '').trim()
    .replace(/\s+/g, '-');
}

function respond(logoUrl, error, source) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ logoUrl: logoUrl || null, error: error || null, source: source || null }),
  };
}

function fetchUrl(url, redirectCount = 0) {
  if (redirectCount > 5) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
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
    req.setTimeout(8000, () => { req.destroy(); resolve(''); });
  });
}

function fetchImage(url, redirectCount = 0) {
  if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
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
