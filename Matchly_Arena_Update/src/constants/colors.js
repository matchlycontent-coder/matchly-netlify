const WEATHER   = [
  { v:"zon",     icon:"☀️", label:"Zon"        },
  { v:"normaal", icon:"⛅", label:"Normaal"    },
  { v:"regen",   icon:"🌧️", label:"Regen"      },
  { v:"sneeuw",  icon:"❄️", label:"Sneeuw"     },
  { v:"wind",    icon:"💨", label:"Harde wind" },
];

/* ══════════════════════════════════════════════
   MATCHLY MERK-PALETTE (v34 — match met website)
   Donker paars-zwart + indigo→paars→magenta gradient.
   Voor app-shell (knoppen, tabs, banners).
   Content (match-post, story, MOTM) blijft op clubkleuren.
══════════════════════════════════════════════ */
const M = {
  bg0:    "#050208",   // diepste zwart-paars
  bg1:    "#0a0612",   // app-achtergrond
  bg2:    "#100a1e",   // sectie-achtergrond
  bg3:    "#1a1230",   // card-achtergrond
  bg4:    "#241845",   // verhoogd

  indigo:  "#4f46e5",  // gradient start (links)
  purple:  "#a855f7",  // gradient midden
  magenta: "#ec4899",  // gradient eind (rechts)

  // 3-stop gradient zoals op de site (Start gratis-knop, "clubcontent" tekst)
  grad: "linear-gradient(90deg,#4f46e5 0%,#a855f7 50%,#ec4899 100%)",
  gradD:"linear-gradient(135deg,#4f46e5 0%,#a855f7 50%,#ec4899 100%)",
  // Subtiele glow-tint voor randen/highlights
  glow:    "#a855f7",
};

// U = UI-accent (Matchly-paars) — gebruikt in app-UI (chips, labels, status, nav)
// LOS van clubkleur (C). Content (match-post, story, MOTM) blijft op C.
const U = M.purple;

const T = {
  bg0: M.bg0, bg1: M.bg1, bg2: M.bg2, bg3: M.bg3,
  bg4: M.bg4, surface: M.bg2,
  border:"#ffffff08", border2:"#ffffff12", border3:"#ffffff1e",
  text:"#f0f0ff", text2:"#ffffffcc", text3:"#ffffff66", text4:"#ffffff28",
  green:"#00e676", red:"#ff1744", yellow:"#ffd600", blue:"#448aff",
};

function hex(c,a){ return c+Math.round(a*255).toString(16).padStart(2,"0"); }
export { WEATHER, M, U, T, hex };
