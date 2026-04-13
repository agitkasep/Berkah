const CACHE_NAME = 'berkah-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.svg',
  './manifest.json',
  // Tambahkan file HTML atau CSS lain jika ada, contoh:
  // './jadwal-sholat.html'
];

// 1. Install Service Worker dan simpan aset utama ke Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Aktivasi Service Worker dan bersihkan cache lama jika ada
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

// 3. Logika Pintar: Strategi Fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // STRATEGI KHUSUS JSON: Selalu ambil dari internet (Network-First)
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Opsional: Simpan salinan terbaru ke cache untuk cadangan offline
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Jika internet mati/gagal, ambil dari cache yang terakhir tersimpan
          return caches.match(event.request);
        })
    );
    return;
  }

  // STRATEGI BIASA: Cache-First (Untuk Gambar, CSS, Font agar cepat)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
