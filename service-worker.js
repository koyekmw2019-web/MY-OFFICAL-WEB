/* v7.80: cache versioned PUBLIC static assets only. Never cache HTML, credentials or APIs. */
const VERSION = 'yk-official-v7-80-stability-speed-v7841-slim-v7861-stability-v7862-ui-session-v7864-jlpt-menu-target-fix';
const PUBLIC_CACHE = `yk-public-static-${VERSION}`;
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('yk-public-static-') && key !== PUBLIC_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode === 'navigate') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/.netlify/') || url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;
  // Public assets only; never store private responses or cache page HTML.
  const isStatic = /^\/assets\/.+\.(?:js|css|png|jpe?g|webp|svg|woff2?)$/.test(url.pathname)
    || url.pathname === '/assets/jlpt-learning-v782-content.json'
    || url.pathname === '/assets/jlpt-reading-v7822-upgrade.json'
    || /^\/yk-(?:192|512)\.png$/.test(url.pathname);
  if (!isStatic || request.headers.has('authorization')) return;
  event.respondWith((async () => {
    const cache = await caches.open(PUBLIC_CACHE);
    const saved = await cache.match(request);
    if (saved) return saved;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      // Do not block first response while writing to cache.
      event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
    }
    return response;
  })());
});
