const CACHE_NAME = 'pwa-inspecciones-v1';
const OFFLINE_URL = '/offline.html'; // Opcional, o un fallback genérico

const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. Instalación: cachear recursos estáticos iniciales de forma segura
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Instalando y cacheando recursos estáticos');
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.warn('[Service Worker] Falló el caché de algunos recursos (no crítico):', error);
      });
    })
  );
  self.skipWaiting();
});


// 2. Activación: limpiar cachés antiguas si se actualiza la versión
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Intercepción de peticiones (Estrategia Cache First con fallback a red)
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean HTTP/HTTPS (como extensiones del navegador)
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Devolver desde la caché si existe
        return cachedResponse;
      }
      // Si no está en caché, buscar en la red
      return fetch(event.request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline genérico si es una navegación HTML
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // ¡Importante! Retornar una respuesta vacía o de error controlada 
          // para evitar que devuelva undefined y cause el error en consola.
          return new Response('Recurso no disponible offline', {
            status: 404,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
    })
  );
});

