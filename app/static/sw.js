/**
 * Service Worker
 * キャッシング戦略とオフライン対応
 */

const CACHE_NAME = 'kuku-app-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/static/css/style.css',
    '/static/css/responsive.css',
    '/static/js/pwa.js',
    '/static/js/quizLogic.js',
    '/static/js/scorer.js',
    '/static/js/main.js',
    '/kuku/',
    '/kuku/api/session',
    '/kuku/api/result'
];

// インストール時
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// アクティベーション時
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// フェッチイベント処理
self.addEventListener('fetch', (event) => {
    // APIリクエストはネットワークファースト
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // オフライン時はキャッシュから取得
                    return caches.match(event.request);
                })
        );
    } else {
        // 静的アセットはキャッシュファースト
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request)
                        .then((response) => {
                            // 正常なレスポンスのみキャッシュ
                            if (!response || response.status !== 200 || response.type === 'error') {
                                return response;
                            }
                            // レスポンスをクローン（使い回せるように）
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                            return response;
                        });
                })
                .catch(() => {
                    // キャッシュとネットワークの両方が失敗した場合のフォールバック
                    return new Response('Offline - Resource not available', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                })
        );
    }
});

// メッセージ処理
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
