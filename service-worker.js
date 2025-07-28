 // Define a name for your cache
    const CACHE_NAME = 'financial-tracker-cache-v1';

    // List the files you want to cache (your app's core assets)
    // Make sure these paths are correct relative to the root of your server
    const urlsToCache = [
      '/', // Caches the root path, which will typically serve your index.html or dailytansactions.html
      '/dailytansactions.html',
      '/manifest.json',
      'https://cdn.tailwindcss.com', // Tailwind CSS CDN
      'https://unpkg.com/@babel/standalone/babel.min.js', // Babel CDN
      'https://unpkg.com/react@18/umd/react.production.min.js', // React CDN
      'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', // ReactDOM CDN
      'https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js', // Firebase App CDN
      'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore-compat.js', // Firebase Firestore CDN
      // Add your custom icon URLs here if you replace placehold.co
      'https://placehold.co/48x48/6B46C1/ffffff?text=FT',
      'https://placehold.co/72x72/6B46C1/ffffff?text=FT',
      'https://placehold.co/96x96/6B46C1/ffffff?text=FT',
      'https://placehold.co/144x144/6B46C1/ffffff?text=FT',
      'https://placehold.co/192x192/6B46C1/ffffff?text=FT',
      'https://placehold.co/512x512/6B46C1/ffffff?text=FT'
    ];

    // --- Install Event ---
    // This event is fired when the service worker is first installed.
    // It's a good place to pre-cache essential assets.
    self.addEventListener('install', (event) => {
      console.log('[Service Worker] Install event fired.');
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(urlsToCache);
          })
          .catch((error) => {
            console.error('[Service Worker] Caching failed:', error);
          })
      );
    });

    // --- Activate Event ---
    // This event is fired when the service worker is activated.
    // It's commonly used to clean up old caches.
    self.addEventListener('activate', (event) => {
      console.log('[Service Worker] Activate event fired.');
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME) {
                console.log('[Service Worker] Deleting old cache:', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        })
      );
    });

    // --- Fetch Event ---
    // This event is fired for every network request made by the page.
    // It allows the service worker to intercept requests and serve cached content.
    self.addEventListener('fetch', (event) => {
      // We only cache GET requests
      if (event.request.method !== 'GET') {
        return;
      }

      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            // If the request is in the cache, return the cached response
            if (response) {
              console.log('[Service Worker] Serving from cache:', event.request.url);
              return response;
            }

            // If not in cache, fetch from the network
            console.log('[Service Worker] Fetching from network:', event.request.url);
            return fetch(event.request)
              .then((networkResponse) => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                  return networkResponse;
                }

                // Clone the response because it's a stream and can only be consumed once
                const responseToCache = networkResponse.clone();

                // Cache the new response for future use
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });

                return networkResponse;
              })
              .catch((error) => {
                console.error('[Service Worker] Fetch failed:', event.request.url, error);
                // You can return a custom offline page here if desired
                // return caches.match('/offline.html'); // Example: return an offline page
              });
          })
      );
    });
    