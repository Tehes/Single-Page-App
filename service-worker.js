const CACHE_NAME = "--your-app-cache-v1";

// A Map that tracks network requests during the session
const sessionCacheMap = new Map();

// Install event: Skip waiting to activate the service worker immediately
self.addEventListener("install", () => {
    self.skipWaiting();
});

// Fetch event: Handle network-first on the first request, then cache-only for the rest of the session
self.addEventListener("fetch", event => {
    // Handle only GET requests
    if (event.request.method === "GET") {
        const sessionFlag = event.request.url;

        // Check if we've already fetched this file from the network in this session
        if (sessionCacheMap.has(sessionFlag)) {
            // Already fetched in this session – use cache only
            console.log(`Serving from cache: ${event.request.url}`);
            event.respondWith(
                caches.match(event.request).then(cachedResponse => 
                    cachedResponse || fetch(event.request)  // If not in cache, fallback to network
                )
            );
        } else {
            // First fetch: Use network-before-cache strategy
            event.respondWith(
                fetch(event.request).then(networkResponse => {
                    console.log(`Fetched from network: ${event.request.url}`);
                    // Cache the response and set the session flag
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        sessionCacheMap.set(sessionFlag, true);  // Mark session entry
                        return networkResponse;  // Return the network response
                    });
                }).catch(() => {
                    console.log(`Network failed, serving from cache (if available): ${event.request.url}`);
                    // If network fails, use the cache
                    return caches.match(event.request);
                })
            );
        }
    } else {
        // For non-GET requests, fetch directly from the network
        event.respondWith(fetch(event.request));
    }
});

// Activate event to clear old caches
self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];  // Keep only the current cache
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map(cacheName => {
                if (!cacheWhitelist.includes(cacheName)) {
                    console.log(`Deleting old cache: ${cacheName}`);
                    return caches.delete(cacheName);
                }
            })
        ))
    );
    self.clients.claim();
});