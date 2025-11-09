// Service Worker untuk BUSSID Money Top Up PWA
const CACHE_NAME = 'bussid-topup-v2.1.0';
const STATIC_CACHE = 'static-cache-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v2';

// Assets yang akan di-cache saat install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/app.js',
  'https://i.ibb.co/Q7qc788Z/icon-72x72.png',
  'https://i.ibb.co/Q7qc788Z/icon-96x96.png',
  'https://i.ibb.co/Q7qc788Z/icon-128x128.png',
  'https://i.ibb.co/Q7qc788Z/icon-144x144.png',
  'https://i.ibb.co/Q7qc788Z/icon-152x152.png',
  'https://i.ibb.co/Q7qc788Z/icon-192x192.png',
  'https://i.ibb.co/Q7qc788Z/icon-384x384.png',
  'https://i.ibb.co/Q7qc788Z/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Segoe+UI:wght@300;400;500;600;700&display=swap'
];

// API endpoints yang perlu di-cache
const API_ENDPOINTS = [
  'https://4AE9.playfabapi.com/Client/LoginWithAndroidDeviceID',
  'https://4AE9.playfabapi.com/Client/GetPlayerCombinedInfo',
  'https://4AE9.playfabapi.com/Client/ExecuteCloudScript',
  'https://api.github.com/repos/Revansyabian/Webtopupotomatis/contents/lisensi'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing BUSSID Top Up...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching Static Assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Install Completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Install Failed', error);
      })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating BUSSID Top Up...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== CACHE_NAME) {
              console.log('Service Worker: Clearing Old Cache', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activate Completed');
        return self.clients.claim();
      })
  );
});

// Fetch Event - Network first strategy untuk API, Cache first untuk assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network First Strategy untuk API calls
  if (url.pathname.includes('/Client/') || 
      url.href.includes('playfabapi.com') || 
      url.href.includes('github.com') ||
      API_ENDPOINTS.some(api => request.url.includes(api))) {
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response untuk cache
          const responseToCache = response.clone();
          
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // Fallback ke cache jika offline
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return offline response untuk API
              return new Response(
                JSON.stringify({
                  error: 'Anda sedang offline',
                  code: 'OFFLINE_MODE',
                  message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Cache First Strategy untuk static assets dan gambar
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version jika ada
        if (cachedResponse) {
          return cachedResponse;
        }

        // Jika tidak ada di cache, fetch dari network
        return fetch(request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response untuk cache
            const responseToCache = response.clone();

            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback untuk gambar yang gagal load
            if (request.url.includes('.png') || request.url.includes('.jpg') || request.url.includes('.jpeg')) {
              return caches.match('https://i.ibb.co/Q7qc788Z/icon-192x192.png')
                .then((iconResponse) => {
                  return iconResponse || createFallbackIcon();
                });
            }
            
            // Fallback untuk HTML
            if (request.destination === 'document') {
              return caches.match('/')
                .then((indexResponse) => {
                  return indexResponse || new Response(
                    '<h1>BUSSID Top Up - Offline</h1><p>Aplikasi sedang offline. Periksa koneksi internet Anda.</p>',
                    { headers: { 'Content-Type': 'text/html' } }
                  );
                });
            }
            
            return createFallbackResponse();
          });
      })
  );
});

// Fungsi untuk membuat fallback icon
function createFallbackIcon() {
  const svg = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="192" height="192" rx="24" fill="#0074D9"/>
    <rect width="192" height="192" rx="24" fill="url(#gradient)" opacity="0.8"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="20" font-weight="bold">BUSSID</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="14">TOP UP</text>
    <text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="10">OFFLINE</text>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0074D9"/>
        <stop offset="100%" stop-color="#00BFFF"/>
      </linearGradient>
    </defs>
  </svg>`;
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// Fungsi untuk membuat fallback response
function createFallbackResponse() {
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Tidak dapat mengakses resource saat offline'
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Background Sync untuk mengantri request saat offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-bussid') {
    console.log('Background Sync: Processing queued requests for BUSSID');
    event.waitUntil(processQueuedRequests());
  }
});

// Push Notification untuk BUSSID Top Up
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'BUSSID Top Up',
      body: event.data.text() || 'Notifikasi dari BUSSID Top Up'
    };
  }

  const options = {
    body: data.body || 'Update terbaru dari BUSSID Top Up',
    icon: 'https://i.ibb.co/Q7qc788Z/icon-192x192.png',
    badge: 'https://i.ibb.co/Q7qc788Z/icon-72x72.png',
    image: 'https://i.ibb.co/Q7qc788Z/icon-512x512.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: new Date().toISOString()
    },
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ],
    tag: 'bussid-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'BUSSID Top Up', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Cari tab yang sudah terbuka
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Jika tidak ada, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Fungsi untuk memproses request yang diantri
function processQueuedRequests() {
  // Di sini Anda bisa implementasi logika untuk sync data
  // yang tertunda saat offline
  console.log('Processing queued requests...');
  return Promise.resolve();
}

// Periodic Sync untuk update background
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  // Update cached content periodically
  console.log('Periodic sync: Updating content...');
}