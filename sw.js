const CACHE_NAME = 'berkah-v2'; // Versi naik ke v2 agar cache diperbarui
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/Quran.html',
  '/Hadist.html',
  '/Berita.html',
  '/Infoloker.html',
  '/jadwal-sholat.html',
  '/manifest.json',
  '/logo.svg'
];

// 1. Install & Simpan Aset Inti
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mencadangkan aset utama...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Aktivasi & Hapus Cache Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Strategi: Ambil dari Cache dulu, kalau gak ada baru internet
// Ini bikin semua halaman (Quran, Hadist, dll) bisa dibuka offline setelah dikunjungi sekali
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Simpan otomatis halaman/audio/data yang baru dibuka ke cache
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
      // Jika benar-benar offline dan belum ada di cache
      return caches.match('/index.html');
    })
  );
});
