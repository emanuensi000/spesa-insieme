const VERSION = 'organaizer-v1-__BUILD_ID__';
const SHELL = ['./', './index.html', './shopping.html', './organizer.js', './organizer-core.js', './backup.js', './shopping-history.js', './shopping-groups.js', './pwa-update.js', './auth.js', './auth-client.js', './login.js', './organizer.css', './navigation.css', './docs/RELEASE_NOTES.md', './docs/DEPLOY_GITHUB.md', './docs/REQUISITI.md', './docs/IMPLEMENTAZIONE.md', './docs/LOGIN.md', './docs/001_organaizer.sql', './docs/002_shopping_history.sql', './styles.css', './app.js', './core.js', './config.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './data/offers.json', './data/archived-offers.json', ...__FLYER_ASSETS__];
const scope=new URL('./',self.location.href);
const staticPaths=new Set(SHELL.map(path=>new URL(path,scope).pathname));
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(VERSION);
  // Large flyers are cached on demand; app shell must be ready offline.
  await cache.addAll(SHELL.filter(p=>!p.startsWith('./flyers/')&&!p.startsWith('./docs/')).map(p=>new Request(new URL(p,scope),{cache:'reload'})));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>(k.startsWith('organaizer-v1-')||k.startsWith('spesa-v1-'))&&k!==VERSION).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||request.headers?.has('authorization'))return;
 // Never cache invitation links, OAuth callback URLs, non-allowlisted resources, or personalized responses.
 if(request.mode==='navigate'){
  event.respondWith(fetch(request,{cache:'no-store'}).catch(async()=>{
   const cache=await caches.open(VERSION);
   const page=url.pathname.endsWith('/shopping.html')?'./shopping.html':'./index.html';
   return await cache.match(new URL(page,scope))||Response.error();
  }));return;
 }
 if(!staticPaths.has(url.pathname)||url.search)return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  const cached=await cache.match(new URL(url.pathname,scope));
  // Ogni cache conserva una build coerente; l'aggiornamento passa dal nuovo worker.
  if(cached)return cached;
  try{const response=await fetch(request);if(response.ok&&response.type==='basic'&&!response.redirected&&!/(?:^|,)\s*(?:no-store|private)\b/i.test(response.headers.get('cache-control')||''))await cache.put(new URL(url.pathname,scope),response.clone());return response;}catch{return Response.error();}
 })());
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
