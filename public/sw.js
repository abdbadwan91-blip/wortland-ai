const CACHE_NAME = 'wortland-shell-v8';
const scope = self.registration.scope;
const SHELL_ASSETS = [
  scope,
  scope + 'index.html',
  scope + 'manifest.webmanifest',
  scope + 'favicon.png',
  scope + 'icon-192.png',
  scope + 'icon-512.png',
  scope + 'icon-512-maskable.png',
  scope + 'apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(scope + 'index.html', copy));
          return response;
        })
        .catch(() =>
          caches.match(scope + 'index.html').then((response) => response || caches.match(scope)),
        ),
    );
    return;
  }

  const url = new URL(event.request.url);
  const isContentImage = url.pathname.includes('/content/');
  const isStaticAsset = ['script', 'style', 'image', 'font', 'manifest'].includes(event.request.destination);
  if (!isContentImage && !isStaticAsset) return;

  // Network-first for JS/CSS so deploys are not stuck on stale shell assets
  const isCode = event.request.destination === 'script' || event.request.destination === 'style';
  if (isCode) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || Response.error())),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    }),
  );
});
