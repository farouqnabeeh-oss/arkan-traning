// Service Worker بسيط وآمن لدعم PWA - يخزن فقط الأصول الثابتة، ويترك كل المحتوى الديناميكي يُجلب من الشبكة دائمًا
const CACHE_NAME = 'arkan-static-v1';
const STATIC_ASSETS = ['/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first لكل شي، مع fallback للكاش فقط للأصول الثابتة عند انقطاع الشبكة
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!STATIC_ASSETS.includes(url.pathname)) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
