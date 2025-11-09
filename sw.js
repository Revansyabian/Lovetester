const CACHE_NAME = 'revan-store-v1';
const urlsToCache = [
  './',
  'index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/NdtMCQBg/telegram-photo.jpg',
  'https://i.ibb.co/wNPhHtD0/telegram-photo.jpg'
];

self.addEventListener('instal', (peristiwa) => {
  acara.tunggusampai(
    cache.buka(NAMA_CACHE)
      .lalu((cache) => {
        kembalikan cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (peristiwa) => {
  acara.respondWith(
    cache.cocok(permintaan.peristiwa)
      .lalu((respons) => {
        jika (respons) {
          mengembalikan respons;
        }
        kembalikan fetch(permintaan.acara);
      })
  );
});

self.addEventListener('aktifkan', (peristiwa) => {
  const cacheWhitelist = [NAMA_CACHE];
  acara.tunggusampai(
    caches.keys().lalu((namacache) => {
      kembalikan Promise.all(
        namacache.peta((namacache) => {
          jika (cacheWhitelist.indexOf(namacache) === -1) {
            kembalikan cache.hapus(namacache);
          }
        })
      );
    })
  );
});