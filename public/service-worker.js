const CACHE_NAME = 'budget-tracker-v5';

// 安装 Service Worker
self.addEventListener('install', event => {
  // 强制跳过等待，立即激活
  self.skipWaiting();
  console.log('Service Worker 安装成功');
});

// 激活 Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    // 清除所有旧缓存
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('删除缓存:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // 立即控制所有页面
      return self.clients.claim();
    })
  );
  console.log('Service Worker 激活成功');
});

// 拦截请求 - 始终使用网络，不缓存
self.addEventListener('fetch', event => {
  // 直接使用网络请求，不缓存
  event.respondWith(fetch(event.request));
});
