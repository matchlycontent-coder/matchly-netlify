// sw.js — Matchly service worker
// Zorgt dat de app altijd de nieuwste versie laadt en zichzelf ververst.

const CACHE = "matchly-v1";

// Neem direct de controle over zodra een nieuwe versie klaarstaat.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Oude caches opruimen
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Alleen GET-verzoeken afhandelen; POST (API-calls) altijd direct door.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // API-functies en externe verzoeken nooit cachen — altijd vers ophalen.
  if (url.pathname.startsWith("/.netlify/functions/")) return;

  // Navigatie (de app zelf): network-first, zodat je altijd de nieuwste versie krijgt.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Overige bestanden (JS/CSS/afbeeldingen): network-first met cache als terugval.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
