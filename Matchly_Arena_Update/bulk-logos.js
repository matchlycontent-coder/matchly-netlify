// bulk-logos.js
// Haalt logo's op voor alle Nederlandse amateurclubs van hollandsevelden.nl
// en slaat ze op in Supabase.
//
// Gebruik: node bulk-logos.js
// Duur: ~20-30 minuten voor alle ~3000 clubs

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// ── Supabase credentials ──────────────────────────────────
const SUPABASE_URL  = 'https://qoemlqlhnrzvyujyehnc.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_EFFZnAcVZd5huB6mWhCQ5Q_-9wn_xh5';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Instellingen ──────────────────────────────────────────
const DELAY_MS = 600;   // rust tussen requests (wees vriendelijk voor hollandsevelden)
const LETTERS  = 'abcdefghijklmnopqrstuvwxyz'.split('');

// ── Hulpfuncties ──────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchText(url, hops = 0) {
  return new Promise((resolve, reject) => {
    if (hops > 5) { reject(new Error('Te veel redirects')); return; }

    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MatchlyBot/1.0)' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://www.hollandsevelden.nl${res.headers.location}`;
        res.resume();
        fetchText(next, hops + 1).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode === 404) { resolve(null); return; }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Haal alle clubpagina-links op van een letter-overzichtspagina
async function getClubPathsForLetter(letter) {
  const html = await fetchText(`https://www.hollandsevelden.nl/clubs/${letter}/`);
  if (!html) return [];

  const regex = /href="(\/clubs\/[a-z]\/[a-z0-9-]+\/)"/g;
  const paths = new Set();
  let m;
  while ((m = regex.exec(html)) !== null) paths.add(m[1]);
  return [...paths];
}

// Haal logo URL op van een clubpagina
async function getClubInfo(clubPath) {
  const html = await fetchText(`https://www.hollandsevelden.nl${clubPath}`);
  if (!html) return null;

  // Logo via og:image (staat altijd op de pagina)
  const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (!ogMatch) return null;

  let logoUrl = ogMatch[1];
  if (logoUrl.startsWith('/')) logoUrl = `https://www.hollandsevelden.nl${logoUrl}`;

  // Slug uit URL (bv. /clubs/h/hermes-dvs/ → hermes-dvs)
  const slugMatch = clubPath.match(/\/clubs\/[a-z]\/([a-z0-9-]+)\//);
  const slug = slugMatch ? slugMatch[1] : clubPath;

  // Opzoeksleutel: slug met streepjes vervangen door spaties (past bij hoe gebruikers typen)
  const clubName = slug.replace(/-/g, ' ');

  // Propere weergavenaam uit de paginatitel
  let displayName = slug;
  const h1Match = html.match(/<h1[^>]*>([^<]+)/i);
  if (h1Match) displayName = h1Match[1].trim();

  return { clubName, displayName, logoUrl, slug };
}

// Sla op in Supabase (overschrijft bestaande rij als club al bestaat)
async function save(clubName, displayName, logoUrl) {
  const { error } = await supabase
    .from('club_logos')
    .upsert({
      club_name: clubName,
      display_name: displayName,
      logo_data: logoUrl,
      source: 'hollandsevelden',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'club_name' });

  if (error) throw error;
}

// ── Hoofdprogramma ────────────────────────────────────────
async function main() {
  console.log('════════════════════════════════════════════');
  console.log('  Matchly — bulk logo import hollandsevelden');
  console.log('════════════════════════════════════════════\n');

  let totaal = 0;
  let opgeslagen = 0;
  let mislukt = 0;

  for (const letter of LETTERS) {
    process.stdout.write(`Letter ${letter.toUpperCase()} — bezig...`);

    let paths;
    try {
      paths = await getClubPathsForLetter(letter);
    } catch (e) {
      console.log(` ⚠️  overgeslagen (${e.message})`);
      continue;
    }

    console.log(` ${paths.length} clubs`);
    totaal += paths.length;

    for (const path of paths) {
      await sleep(DELAY_MS);
      try {
        const info = await getClubInfo(path);
        if (!info) { mislukt++; continue; }

        await save(info.clubName, info.displayName, info.logoUrl);
        opgeslagen++;
        process.stdout.write(`  ✓ ${opgeslagen}/${totaal} — ${info.clubName.padEnd(25)}\r`);
      } catch (e) {
        process.stdout.write('\n');
        console.log(`  ✗ ${path}: ${e.message}`);
        mislukt++;
      }
    }
    process.stdout.write('\n');
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`  ✅ Klaar!`);
  console.log(`  Opgeslagen : ${opgeslagen}`);
  console.log(`  Mislukt    : ${mislukt}`);
  console.log(`  Totaal     : ${totaal}`);
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatale fout:', err);
  process.exit(1);
});
