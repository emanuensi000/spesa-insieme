const VERSION = 'organaizer-v1-__BUILD_ID__';
const SHELL = ['./', './index.html', './shopping.html', './organizer.js', './organizer-core.js', './auth.js', './auth-client.js', './login.js', './organizer.css', './navigation.css', './docs/REQUISITI.md', './docs/IMPLEMENTAZIONE.md', './docs/LOGIN.md', './docs/001_organaizer.sql', './styles.css', './app.js', './core.js', './config.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './data/offers.json', ...__FLYER_ASSETS__];
self.addEventListener('install', event => { event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('organaizer-v1-') || key.startsWith('spesa-v1-')) && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  // Nessuna lista, token o risposta del database viene memorizzata dal service worker.
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL('./', self.location).pathname)) return;
  if(url.searchParams.has('code')||url.searchParams.has('error')){
    event.respondWith(fetch(request).catch(()=>caches.open(VERSION).then(cache=>cache.match('./index.html'))));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});

self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
