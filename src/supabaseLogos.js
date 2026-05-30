// supabaseLogos.js — beheert het ophalen en opslaan van clublogo's in Supabase
// Hergebruikt de bestaande Supabase-verbinding (voorkomt "Multiple GoTrueClient instances").
import { supabase } from "./supabaseClient.js";

// Normaliseer clubnaam: lowercase, spaties trimmen
function normalize(name) {
  return (name || "").trim().toLowerCase();
}

// Hollandsevelden-URLs lopen via onze eigen proxy (omzeilt CORS-blokkade)
function proxyUrl(url) {
  if (!url) return null;
  if (url.includes("hollandsevelden.nl")) {
    return `/.netlify/functions/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Zoek een logo in Supabase op basis van clubnaam.
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

  const url = data?.logo_data || null;
  return proxyUrl(url);
}

/**
 * Bewaar een logo in Supabase.
 */
export async function saveLogoToSupabase(clubName, displayName, logoUrl) {
  if (!supabase || !clubName?.trim() || !logoUrl) return;

  const normalized = normalize(clubName);
  const display = (displayName || clubName).trim();

  const originalUrl = logoUrl.includes("image-proxy?url=")
    ? decodeURIComponent(logoUrl.split("image-proxy?url=")[1])
    : logoUrl;

  const { data: existing, error: selectErr } = await supabase
    .from("club_logos")
    .select("id")
    .eq("club_name", normalized)
    .limit(1)
    .maybeSingle();

  if (selectErr) {
    console.log("Supabase select error:", selectErr.message);
    return;
  }

  if (existing) {
    const { error } = await supabase
      .from("club_logos")
      .update({ logo_data: originalUrl, display_name: display, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) console.log("Supabase update error:", error.message);
  } else {
    const { error } = await supabase
      .from("club_logos")
      .insert({ club_name: normalized, display_name: display, logo_data: originalUrl, source: "hollandsevelden" });
    if (error) console.log("Supabase insert error:", error.message);
  }
}
