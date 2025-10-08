/**
 * Service Worker for V-A Emotion Visualization
 * 캐싱을 통한 성능 최적화
 */

const CACHE_NAME = 'va-emotion-viz-v1';
const API_CACHE_NAME = 'va-emotion-api-v1';

// 캐시할 리소스들
const STATIC_ASSETS = [
  '/',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main-app.js',
  '/_next/static/chunks/app-pages-internals.js',
  '/_next/static/chunks/app/page.js'
];

// API 엔드포인트 패턴
const API_PATTERNS = [
  /\/api\/emotions\/metadata/,
  /\/api\/emotions\/chunk\/\d+/
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 정적 리소스 처리
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// API 요청 처리 (캐시 우선, 네트워크 폴백)
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[SW] Serving API from cache:', request.url);
    return cachedResponse;
  }

  try {
    console.log('[SW] Fetching API from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 성공적인 응답만 캐시
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      console.log('[SW] Cached API response:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', request.url, error);
    throw error;
  }
}

// 정적 리소스 처리 (캐시 우선, 네트워크 폴백)
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[SW] Serving static asset from cache:', request.url);
    return cachedResponse;
  }

  try {
    console.log('[SW] Fetching static asset from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      console.log('[SW] Cached static asset:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset request failed:', request.url, error);
    throw error;
  }
}

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // 백그라운드에서 수행할 작업들
  console.log('[SW] Performing background sync...');
  
  // 예: 오래된 캐시 정리
  const cache = await caches.open(API_CACHE_NAME);
  const requests = await cache.keys();
  
  // 1시간 이상 된 캐시 삭제
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (responseDate < oneHourAgo) {
          await cache.delete(request);
          console.log('[SW] Deleted old cache entry:', request.url);
        }
      }
    }
  }
}

// 메시지 처리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}


