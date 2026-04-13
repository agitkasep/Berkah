const CACHE_NAME = 'berkah-app-v2'; // Naikkan versi jika Anda mengubah file doa atau kode index
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.svg',
  './manifest.json',
  './doa1.json',
  './doa2.json',
  './doa3.json',
  './doa4.json',
  './doa5.json',
  './doa6.json',
  './doa7.json',
  './doa8.json',
  './doa9.json',
  './doa10.json',
  './doa11.json',
  './doa12.json',
  './sw.js'
];

// 1. Install & Pre-cache (Menyimpan semua doa saat pertama kali aplikasi dibuka)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Berkah App: Mengamankan aset untuk mode offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Aktivasi & Cleanup (Menghapus cache versi lama seperti v1)
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

// 3. Strategi Fetch yang Optimal
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategi Khusus untuk File JSON Doa (Stale-While-Revalidate)
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
        // Berikan cache dulu (cepat), perbarui di background (jika ada internet)
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategi untuk Aset Statis (Cache-First)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
