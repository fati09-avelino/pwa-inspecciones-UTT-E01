const CACHE_NAME = 'pwa-inspecciones-v2';
const ASSETS_TO_CACHE = ['/', '/inspecciones', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS_TO_CACHE);
    // Precargar los chunks y estilos referidos por el HTML real de Next.
    const document = await cache.match('/inspecciones');
    if (document && document.text) {
      const html = await document.text();
      const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map(match => match[1]).filter(path => path.startsWith('/_next/static/'));
      if (assets.length) await cache.addAll([...new Set(assets)]);
    }
  })());
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => (name.startsWith('pwa-inspecciones-') || name.startsWith('utt-inspections-')) && name !== CACHE_NAME)
      .map(name => caches.delete(name)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (self.location) {
    const url = new URL(request.url);
    if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') ||
        request.headers.get('RSC') === '1') return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached && request.mode !== 'navigate') return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok && response.clone) {
        const cache = await caches.open(CACHE_NAME);
        if (cache.put) await cache.put(request, response.clone()).catch(error => console.warn('No se pudo cachear', error));
      }
      return response;
    } catch {
      return cached || (request.mode === 'navigate' ? caches.match('/') : undefined);
    }
  })());
});
