// supabaseLogos.js — beheert het opslaan en ophalen van clublogo's in Supabase
// Deze module zorgt dat we logo's één keer ophalen via web search en daarna altijd uit Supabase serveren.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// Accepteer zowel VITE_SUPABASE_ANON_KEY (oude naam) als VITE_SUPABASE_KEY (nieuwe naam)
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY;

// Als de env vars ontbreken: niet crashen, alleen waarschuwen. App valt dan terug op web search zonder cache.
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn("⚠️ VITE_SUPABASE_URL of VITE_SUPABASE_ANON_KEY ontbreekt — logo cache uitgeschakeld");
}

// Normaliseer clubnamen zodat "Sparta Rotterdam", "sparta rotterdam" en "SPARTA Rotterdam"
// allemaal als dezelfde club worden gezien.
function normalize(name) {
  return (name || "").trim().toLowerCase();
}

/**
 * Zoek een logo in Supabase op basis van clubnaam.
 * @param {string} clubName
 * @returns {Promise<string|null>} logo-URL of null als niet gevonden
 */
export async function getLogoFromSupabase(clubName) {
  if (!supabase || !clubName?.trim()) return null;

  const normalized = normalize(clubName);

  const { data, error } = await supabase
    .from("club_logos")
    .select("logo_data")
    .eq("club_name", normalized)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("Supabase lookup error:", error.message);
    return null;
  }
  return data?.logo_data || null;
}

/**
 * Bewaar een logo in Supabase. Als de club al bestaat: update. Anders: insert.
 * @param {string} clubName        — naam zoals door de gebruiker ingevoerd
 * @param {string} displayName     — propere naam om weer te geven
 * @param {string} logoUrl         — de gevonden image URL
 */
export async function saveLogoToSupabase(clubName, displayName, logoUrl) {
  if (!supabase || !clubName?.trim() || !logoUrl) return;

  const normalized = normalize(clubName);
  const display = (displayName || clubName).trim();

  // Eerst checken of de club al bestaat
  const { data: existing, error: selectErr } = await supabase
    .from("club_logos")
    .select("id")
    .eq("club_name", normalized)
    .limit(1)
    .maybeSingle();

  if (selectErr) {
    console.log("Supabase select-before-save error:", selectErr.message);
    return;
  }

  if (existing) {
    // Bestaat al → bijwerken
    const { error: updateErr } = await supabase
      .from("club_logos")
      .update({
        logo_data: logoUrl,
        display_name: display,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateErr) console.log("Supabase update error:", updateErr.message);
  } else {
    // Nieuw → toevoegen
    const { error: insertErr } = await supabase
      .from("club_logos")
      .insert({
        club_name: normalized,
        display_name: display,
        logo_data: logoUrl,
        source: "hollandsevelden",
      });

    if (insertErr) console.log("Supabase insert error:", insertErr.message);
  }
}
