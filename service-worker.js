/** v7.87.20 — public static-cache hygiene for mobile.
 * - Never cache HTML navigation, Netlify Functions, login/account/payment routes.
 * - Cache-first for explicit build-versioned assets and images.
 * - Public unversioned JS/CSS/level JSON get background revalidation.
 * - No forced page reload, particularly during an active exam.
 */
const VERSION = 'yk-official-v7-87-20';
const PUBLIC_CACHE = `yk-public-static-${VERSION}`;
const MAX_CACHE_BYTES = 1_250_000;
const textRefreshes = new Set(); // per worker lifetime; avoid repeated 4G downloads
self.addEventListener('install', (event) => { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('yk-public-static-') && key !== PUBLIC_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
const staticPath = (path) => /^\/assets\/.+\.(?:js|css|png|jpe?g|webp|svg|woff2?)$/i.test(path)
  || /^\/assets\/yk-v7879-grammar-n[1-5]\.json$/.test(path)
  || path === '/assets/jlpt-learning-v782-content.json'
  || path === '/assets/jlpt-reading-v7822-upgrade.json'
  || /^\/yk-(?:192|512)\.png$/.test(path);
function cacheableResponse(response, url) {
  if (!response?.ok || response.type !== 'basic') return false;
  if (/\b(private|no-store|no-cache)\b/i.test(response.headers.get('cache-control') || '')) return false;
  if (response.headers.has('set-cookie')) return false;
  const mime = String(response.headers.get('content-type') || '').toLowerCase();
  const p = url.pathname.toLowerCase();
  // Avoid caching an HTML 200 fallback under a JavaScript/JSON URL.
  if (mime.includes('text/html')) return false;
  if (p.endsWith('.json') && mime && !mime.includes('json')) return false;
  if (p.endsWith('.css') && mime && !mime.includes('css')) return false;
  if (p.endsWith('.js') && mime && !/(javascript|ecmascript)/.test(mime)) return false;
  if (/\.(?:png|jpe?g|webp|svg)$/.test(p) && mime && !mime.startsWith('image/')) return false;
  const sizeHeader = response.headers.get('content-length');
  const bytes = sizeHeader === null ? null : Number(sizeHeader);
  if (bytes !== null && (!Number.isFinite(bytes) || bytes < 0 || bytes > MAX_CACHE_BYTES)) return false;
  // Unknown-size images could fill mobile persistent cache; never store them.
  if (bytes === null && /\.(?:png|jpe?g|webp|svg)$/.test(p)) return false;
  return true;
}
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode === 'navigate' || request.cache === 'no-store') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/.netlify/') || url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;
  if (!staticPath(url.pathname) || request.headers.has('authorization') || request.headers.has('cookie')) return;
  event.respondWith((async () => {
    const cache = await caches.open(PUBLIC_CACHE);
    const saved = await cache.match(request);
    const update = async () => {
      const response = await fetch(request);
      if (cacheableResponse(response, url)) {
        // Do not delay rendering for CacheStorage writes.
        event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
      }
      return response;
    };
    if (saved) {
      // A query version (ykv / v / build) pins content to a release. No extra requests.
      // Unversioned text is revalidated once per worker life while cached data renders fast.
      const textAsset = /\.(?:js|css|json)$/i.test(url.pathname);
      const versioned = url.searchParams.has('ykv') || url.searchParams.has('v') || url.searchParams.has('build');
      if (textAsset && !versioned && !textRefreshes.has(request.url)) {
        textRefreshes.add(request.url);
        event.waitUntil(update().catch(() => {}));
      }
      return saved;
    }
    return update();
  })());
});
