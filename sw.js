// Service worker mínimo para Valle Grande Tour.
// Objetivo: hacer que la app sea instalable (PWA) y que la última pantalla
// vista cargue de inmediato aunque la conexión tarde un instante.
// No cachea datos de Firestore: el ranking, torneos, etc. siempre se piden
// en vivo, esto solo acelera la carga del "cascarón" de la app.

const CACHE_NAME = 'vg-tour-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo nos interesa cachear la navegación principal (index.html).
  // Todo lo demás (Firebase, Google Fonts, etc.) pasa directo a la red.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
  }
});
