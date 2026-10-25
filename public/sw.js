/**
 * Service worker minimal (F9, Should) : met en cache la coquille de l'app
 * (assets statiques) et le mois en cours, pour une consultation hors ligne.
 * Pas de Workbox : le besoin tient en quelques stratégies simples.
 *
 * Augmenter CACHE_VERSION force le remplacement du cache au prochain
 * déploiement (les anciens caches sont nettoyés à l'activation).
 */
const CACHE_VERSION = "v1";
const CACHE_NAME = `gmd-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // les mutations (POST/PATCH/DELETE) ne passent jamais par le cache
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // jamais les appels API, même en lecture

  if (request.mode === "navigate") {
    // Pages (ex. /mois) : réseau d'abord pour rester à jour, cache en secours
    // hors ligne — c'est ainsi que "le mois en cours" devient consultable
    // sans connexion, en se mettant à jour à chaque visite en ligne.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/mois")))
    );
    return;
  }

  if (isStaticAsset(url)) {
    // Assets statiques : cache d'abord, ils ne changent jamais une fois publiés.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});
