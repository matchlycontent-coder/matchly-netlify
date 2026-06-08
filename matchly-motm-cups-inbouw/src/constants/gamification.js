// src/constants/gamification.js
//
// Spaarsysteem voor Matchly — cups (MOTM) en sloten (clean sheets).
// Pure functies: geen UI, makkelijk te testen en in te haken in App.jsx.

import { CUPS } from './cups';

// ── Aantal te sparen items ────────────────────────────────────────────
// 10 cups per speler is het doel. Zolang er minder cup-PNG's bestaan,
// gebruikt het systeem automatisch CUPS.length (nu 6, straks 10).
export const CUP_SET_SIZE = Math.min(10, CUPS.length);
export const LOCK_SET_SIZE = 6; // clean-sheet sloten per team

// ── Cup toekennen bij een nieuwe MOTM ─────────────────────────────────
// Regels:
//  • elke nieuwe MOTM → willekeurige cup die de speler in de LOPENDE set
//    nog niet heeft;
//  • set compleet (alle cups één keer) → set begint opnieuw, willekeurig;
//  • geen markering / geen ×2 badge.
// `history` = array van cupId's in winvolgorde. Geeft de nieuw gewonnen cupId terug.
export function pickNewCup(history = []) {
  const N = CUP_SET_SIZE;
  const posInRound = history.length % N;              // hoeveel in huidige set al
  const ownedThisRound = new Set(history.slice(history.length - posInRound));
  const pool = CUPS.filter(c => !ownedThisRound.has(c.id));
  const choice = pool[Math.floor(Math.random() * pool.length)] || CUPS[0];
  return choice.id;
}

// Voeg een MOTM toe aan de historie van één speler. Geeft de nieuwe historie terug.
export function awardMotm(history = []) {
  return [...history, pickNewCup(history)];
}

// ── Weergave-gegevens voor de MOTM-story ──────────────────────────────
// Geeft terug wat er getoond moet worden:
//  • newCupId : de zojuist gewonnen cup (groot in het midden)
//  • mini     : eerder gewonnen cups als [{ cupId, dubbel }] (klein rijtje)
//  • total    : totaal aantal MOTM van de speler
// `maxMini` capt het rijtje (default 5); bij meer toont 'ie de laatste paar.
export function getMotmDisplay(history = [], maxMini = 5) {
  const total = history.length;
  if (total === 0) return { newCupId: null, mini: [], total: 0 };

  const newCupId = history[history.length - 1];

  // tel hoe vaak elke cup is gewonnen (voor dubbel-indicator bij 11+ MOTM)
  const counts = {};
  history.forEach(id => { counts[id] = (counts[id] || 0) + 1; });

  // eerder gewonnen unieke cups (alles behalve de zojuist gewonnen),
  // in volgorde van eerste keer winnen
  const seen = new Set([newCupId]);
  const earlier = [];
  for (const id of history.slice(0, -1)) {
    if (!seen.has(id)) { seen.add(id); earlier.push(id); }
  }

  // cap: toon de laatste `maxMini`
  const shown = earlier.slice(-maxMini);
  const mini = shown.map(id => ({ cupId: id, dubbel: counts[id] >= 2 }));

  return { newCupId, mini, total, overflow: earlier.length > maxMini };
}

// ── Clean-sheet sloten (zelfde principe, per TEAM) ────────────────────
// Sloten-PNG's volgen later; logica staat hier al klaar.
export function awardLock(history = []) {
  const N = LOCK_SET_SIZE;
  const posInRound = history.length % N;
  const owned = new Set(history.slice(history.length - posInRound));
  // id's "lock-1"..."lock-6" tot de echte slot-assets er zijn
  const all = Array.from({ length: N }, (_, i) => `lock-${i + 1}`);
  const pool = all.filter(id => !owned.has(id));
  const choice = pool[Math.floor(Math.random() * pool.length)] || all[0];
  return [...history, choice];
}
