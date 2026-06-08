// src/constants/cups.js
//
// ─── NIEUWE BEKER TOEVOEGEN ──────────────────────────────────────────
//  1. Zet het PNG-bestand (transparant) in public/images/cups/
//  2. Voeg hieronder een regel toe aan CUPS
//  3. Klaar — de app pikt 'm op
// ──────────────────────────────────────────────────────────────────────

export const CUPS = [
  { id:'zilver',     naam:'Zilver',        bestand:'/images/cups/cup-zilver.png'     },
  { id:'goud-kroon', naam:'Goud (kroon)',  bestand:'/images/cups/cup-goud-kroon.png' },
  { id:'goud',       naam:'Goud',          bestand:'/images/cups/cup-goud.png'       },
  { id:'brons',      naam:'Brons',         bestand:'/images/cups/cup-brons.png'      },
  { id:'voetbal',    naam:'Voetbal',       bestand:'/images/cups/cup-voetbal.png'    },
  { id:'zwart-goud', naam:'Zwart/Goud',    bestand:'/images/cups/cup-zwart-goud.png' },
  // volgende beker hier toevoegen…
];

export const DEFAULT_CUP_ID = 'goud';

export function getCup(id) {
  return CUPS.find(c => c.id === id) || CUPS.find(c => c.id === DEFAULT_CUP_ID);
}
