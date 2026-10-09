// AUTO CDO service worker: keeps the app shell, built assets and photos available offline.
// API calls always go to the network so data is never stale.
const VERSION = 'autocdo-v1';
const SHELL = ['/login', '/manifest.webmanifest', '/logo.jpg', '/icons/pwa/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Pages: try the network, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put('/login', copy));
          return response;
        })
        .catch(() => caches.match('/login'))
    );
    return;
  }

  // Hashed build files, icons and vehicle photos never change at the same URL: cache first.
  if (url.pathname.startsWith('/build/') || url.pathname.startsWith('/storage/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
      )
    );
  }
});
