// FindmyPoint Service Worker - Fast Image & Asset Caching
const CACHE_NAME = 'findmypoint-images-v1';
const STATIC_CACHE_NAME = 'findmypoint-static-v1';

const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|webp|svg|gif|ico|avif)(\?.*)?$/i;

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Cache-First strategy for images with network fallback and background update
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip API requests and socket connections
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) {
    return;
  }

  // Check if this is an image request (uploads, assets, or image file extensions)
  const isImage =
    url.pathname.startsWith('/uploads/') ||
    url.pathname.startsWith('/assets/') ||
    request.destination === 'image' ||
    IMAGE_EXTENSIONS.test(url.pathname) ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('cloudinary.com');

  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Return cached image immediately (0ms latency)
          // Optional: revalidate in background if desired
          return cachedResponse;
        }

        // Otherwise fetch from network, cache it, and return response
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // If network fails and nothing in cache, return fallback if available
          return cachedResponse || new Response('', { status: 408, statusText: 'Request Timeout' });
        }
      })
    );
  }
});
