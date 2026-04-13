const CACHE_NAME = 'berkah-app-v1776083489';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.svg',
  './manifest.json',
  /* PATH FONT LOKAL */
  './fonts/amiri-v30-arabic-700.woff2',
  './fonts/amiri-quran-v19-arabic-regular.woff2',
  './fonts/amiri-v30-arabic-regular.woff2',
  /* PATH DOA DI DALAM FOLDER */
  './doa harian/doa1.json',
  './doa harian/doa2.json',
  './doa harian/doa3.json',
  './doa harian/doa4.json',
  './doa harian/doa5.json',
  './doa harian/doa6.json',
  './doa harian/doa7.json',
  './doa harian/doa8.json',
  './doa harian/doa9.json',
  './doa harian/doa10.json',
  './doa harian/doa11.json',
  './doa harian/doa12.json',
  './sw.js'
];

// 1. Install & Pre-cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Berkah App: Mengamankan aset folder doa dan fonts...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Aktivasi & Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Strategi Fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.json') || url.pathname.endsWith('.woff2')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
