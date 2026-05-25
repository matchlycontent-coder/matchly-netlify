const LS_PREFIX = "matchly:";
const safeGet = (k, fallback) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return fallback;
    const v = window.localStorage.getItem(LS_PREFIX + k);
    if (v === null || v === undefined) return fallback;
    return JSON.parse(v);
  } catch { return fallback; }
};
const safeSet = (k, v) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(LS_PREFIX + k, JSON.stringify(v));
  } catch (e) {
    console.warn("Matchly: kon niet opslaan", k, e);
  }
};
export { LS_PREFIX, safeGet, safeSet };
