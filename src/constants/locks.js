// src/constants/locks.js
//
// Clean-sheet sloten. Nieuwe toevoegen: PNG in public/images/locks/ + regel hieronder.
export const LOCKS = [
  { id:'kluis',    naam:'Kluis',    bestand:'/images/locks/lock-kluis.png'    },
  { id:'schild',   naam:'Schild',   bestand:'/images/locks/lock-schild.png'   },
  { id:'hangslot', naam:'Hangslot', bestand:'/images/locks/lock-hangslot.png' },
];

export function getLock(id) {
  return LOCKS.find(l => l.id === id) || LOCKS[0];
}

// Willekeurig slot kiezen (bij een nieuwe clean sheet) — mag vrij variëren.
export function randomLockId() {
  return LOCKS[Math.floor(Math.random() * LOCKS.length)].id;
}
