self.addEventListener('fetch', e => {
   e.respondWith(fetchCacheFirst("myCache", e));
});

/**
 * Fetches the request from the cache. If not found in the cache, it will be fetched from the network.
 * @param {string} cacheName The name of the cache to find the request in.
 * @param {FetchEvent} event The fetch event.
 * @returns {Promise<Response>}
 */
async function fetchCacheFirst(cacheName, event) {
    const targetCache = await caches.open(cacheName);
    const cacheResponse = await targetCache.match(event.request);
    if (cacheResponse) {
        // We've got it in the cache. Serve it.
        return cacheResponse;
    }

    // It's not in the cache. Fallback to the network and update the cache.
    const networkResponse = await fetchFromNetwork(event);
    if (networkResponse) {
        await addToCache(cacheName, event.request, networkResponse);
    }
  
    return networkResponse;
}

/**
 * Fetches a response from the network.
 * @param {FetchEvent} event The fetch event.
 * @returns {Promise<Response> | null}
 */
async function fetchFromNetwork(event) {
    return await fetch(event.request);
}

async function addToCache(cacheName, request, response) {
    const cache = await caches.open(cacheName);
    if (response.ok) {
        await cache.add(request, response);
    } else if (response.opaque) {
        await cache.put(request, response);
    } else {
        console.warn("Unable to add to cache", request, response);
    }
}