/* ════════════════════════════════════════════════════════
   Spin Web - Service Worker
   Offline-first caching for PWA / iOS Home Screen
   ════════════════════════════════════════════════════════ */

var CACHE_NAME = 'spin-web-v2';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icon.svg',
  './manifest.json'
];

/* ─── Install: pre-cache shell assets ─────────────────── */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ─── Activate: clean old caches ──────────────────────── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ─── Fetch: cache-first for app shell, network-first for others ── */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Cache-first for known assets
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) {
        // Return cached version immediately, update cache in background
        fetch(event.request).then(function(response) {
          if (response && response.status === 200) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
        }).catch(function() { /* offline, skip background update */ });

        return cached;
      }

      // Not cached: fetch from network, cache if successful
      return fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
