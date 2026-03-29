const CACHE_NAME = 'toligado-v2';
const urlsToCache = [ '/' ];

// Instalando o Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativando e limpando caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptando requisições (Trabalho militar de ponte)
self.addEventListener('fetch', event => {
  // Ignora requisições de API externas (Supabase) pra não quebrar banco de dados
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se tiver, se não faz a requisição normal
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
