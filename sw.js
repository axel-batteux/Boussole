var CACHE_NAME = 'boussole-v3';
var STATIC = ['/', '/style.css', '/app.js', '/manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) { return c.addAll(STATIC); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);
  // Don't cache API/function calls
  if (url.pathname.startsWith('/.netlify/') || url.hostname !== location.hostname) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(r) {
      // Return cache, fetch in background to update
      var fetchPromise = fetch(e.request).then(function(resp) {
        if (resp.ok) {
          var clone = resp.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function() { return r; });
      return r || fetchPromise;
    })
  );
});
