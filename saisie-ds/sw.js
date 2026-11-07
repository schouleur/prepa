// Garde la page en cache pour pouvoir l'ouvrir sans connexion (train…).
// Les notes ne passent jamais par ici : elles restent dans le stockage du navigateur.
const CACHE = "saisie-ds-v1";
const FICHIERS = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// réponse immédiate depuis le cache, mise à jour en arrière-plan quand le réseau est là
self.addEventListener("fetch", ev => {
  if (ev.request.method !== "GET") return;
  ev.respondWith(caches.open(CACHE).then(async c => {
    const enCache = await c.match(ev.request, { ignoreSearch: true });
    const reseau = fetch(ev.request).then(r => { if (r.ok) c.put(ev.request, r.clone()); return r; }).catch(() => enCache);
    return enCache || reseau;
  }));
});
