const CACHE_NAME = 'capital-tracker-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Note: index.tsx is a module script, imported by index.html. Caching it directly might be redundant if '/' or '/index.html' is cached effectively.
  // Add other critical, local assets here if any (e.g., local CSS files not via CDN, specific local images for app shell)
  // For CDN assets like Tailwind, esm.sh, Google Fonts, it's often better to rely on browser caching and network-first strategies,
  // or stale-while-revalidate if you must cache them due to their own robust caching headers.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add all URLs to cache. If any request fails, the installation fails.
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              return response;
            }
            
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            // Only cache same-origin GET requests or CORS-safe responses.
            // Avoid caching things like Supabase API calls unless specific strategies are in place.
            if (event.request.method === 'GET' && 
                (event.request.url.startsWith(self.location.origin) || response.type === 'cors')) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
      })
      .catch(error => {
        // Fallback for no network and no cache (e.g., a generic offline page)
        // For a simple setup, just let the browser handle the offline error.
        console.error('Fetch error:', error);
        // You could return a custom offline page here:
        // return caches.match('/offline.html');
        throw error;
      })
  );
});
