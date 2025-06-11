// Service Worker for aggressive Disco content caching
const DISCO_CACHE_NAME = 'disco-cache-v1';
const DISCO_DOMAINS = [
    'concord-music-publishing.disco.ac',
    'embed.disco.ac'
];

// Install event - preload common disco resources
self.addEventListener('install', event => {
    console.log('🎵 Disco cache worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('🎵 Disco cache worker activated');
    event.waitUntil(self.clients.claim());
});

// Fetch event - cache disco resources aggressively
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Only handle disco domain requests
    if (DISCO_DOMAINS.some(domain => url.hostname.includes(domain))) {
        event.respondWith(
            caches.open(DISCO_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    if (response) {
                        // Return cached version immediately
                        console.log('🎵 Disco cache hit:', url.pathname);
                        return response;
                    }
                    
                    // Fetch and cache for next time
                    return fetch(event.request).then(fetchResponse => {
                        if (fetchResponse.ok) {
                            cache.put(event.request, fetchResponse.clone());
                            console.log('🎵 Disco cached:', url.pathname);
                        }
                        return fetchResponse;
                    });
                });
            })
        );
    }
});
