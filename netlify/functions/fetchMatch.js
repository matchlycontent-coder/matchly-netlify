const https = require('https');
const http = require('http');

exports.handler = async (event) => {
  const teamId = event.queryStringParameters?.teamId;
  if (!teamId) {
    return respond({ error: 'Geen team-ID opgegeven' });
  }

  try {
    // Probeer beide URL-formaten van voetbal.nl
    const urls = [
      `https://www.voetbal.nl/team/${teamId}/wedstrijden`,
      `https://www.voetbal.nl/teams/nederland/team/${teamId}/show/`,
    ];

    let html = '';
    for (const url of urls) {
      html = await fetchUrl(url);
      if (html && html.length > 500) break;
    }

    if (!html) return respond({ error: 'Pagina niet bereikbaar' });

    // Zoek de eerstvolgende wedstrijd
    const match = parseNextMatch(html);
    return respond(match);

  } catch (e) {
    return respond({ error: e.message });
  }
};

function parseNextMatch(html) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Zoek JSON-LD of gestructureerde data
  const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      try {
        const json = JSON.parse(block.replace(/<\/?script[^>]*>/gi, ''));
        if (json['@type'] === 'SportsEvent' || json.startDate) {
          const date = new Date(json.startDate);
          if (date >= today) {
            return {
              tegenstander: json.awayTeam?.name || json.name || 'Onbekend',
              datum: json.startDate?.slice(0, 10),
              tijd: json.startDate?.slice(11, 16),
              thuis_uit: 'thuis',
              wedstrijdtype: 'Competitie',
            };
          }
        }
      } catch (e) { /* skip */ }
    }
  }

  // Zoek wedstrijden in de HTML tabel
  // voetbal.nl toont wedstrijden in rijen met datum, tijd, thuis/uit, tegenstander
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

  const months = {
    jan:0, feb:1, mrt:2, mar:2, apr:3, mei:4, jun:5,
    jul:6, aug:7, sep:8, okt:9, nov:10, dec:11
  };

  for (const row of rows) {
    // Datum patroon: "za 31 mei" of "zo 1 jun" of "2025-05-31"
    const dateMatch = row.match(/(\d{4}-\d{2}-\d{2})|([a-z]{2})\s+(\d{1,2})\s+([a-z]{3})/i);
    if (!dateMatch) continue;

    let date;
    if (dateMatch[1]) {
      date = new Date(dateMatch[1]);
    } else {
      const month = months[dateMatch[4].toLowerCase()];
      const day = parseInt(dateMatch[3]);
      const year = new Date().getFullYear();
      date = new Date(year, month, day);
      if (date < today) date.setFullYear(year + 1);
    }

    if (date < today) continue;

    // Tijd patroon
    const timeMatch = row.match(/(\d{2}:\d{2})/);
    const tijd = timeMatch ? timeMatch[1] : '00:00';

    // Strip HTML tags voor tekst
    const text = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Zoek tegenstander — na "vs" of "-" of als tweede clubnaam
    const vsMatch = text.match(/(?:vs\.?|–|-)\s*([A-Z][^\d\n]{3,40}?)(?:\s+\d|\s*$)/i);
    const tegenstander = vsMatch ? vsMatch[1].trim() : null;

    if (!tegenstander) continue;

    // Thuis/uit detectie
    const thuisUit = /\buit\b/i.test(text) ? 'uit' : 'thuis';
    const wedstrijdtype = /beker/i.test(text) ? 'Beker' : 'Competitie';

    return {
      tegenstander,
      datum: date.toISOString().slice(0, 10),
      tijd,
      thuis_uit: thuisUit,
      wedstrijdtype,
    };
  }

  return { error: 'Geen aankomende wedstrijd gevonden' };
}

function respond(data) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  };
}

function fetchUrl(url, redirectCount = 0) {
  if (redirectCount > 5) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'nl-NL,nl;q=0.9',
      }
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
        let loc = res.headers.location;
        if (!loc.startsWith('http')) loc = 'https://www.voetbal.nl' + loc;
        fetchUrl(loc, redirectCount + 1).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode === 404) { resolve(''); return; }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}
