/* 余录 · Service Worker —— 离线缓存 + PWA 安装支持 */
const CACHE = 'yulu-v18';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './art/book.jpg?v=2',
  './art/film.jpg?v=3',
  './art/comment.jpg?v=2',
  './art/econ.jpg?v=10'
];

/* 安装：预缓存应用外壳 */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

/* 激活：清理旧缓存 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 请求拦截 */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  /* 同步 API：永远直连网络，绝不缓存 */
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  /* 页面导航：网络优先，断网回退缓存（保证能拿到最新版） */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  /* 字体 / CSS（jsdelivr CDN）：缓存优先 + 后台更新（opaque 响应也可缓存） */
  if (url.origin !== self.location.origin && (url.pathname.endsWith('.woff2') || url.pathname.endsWith('.css'))) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const fetching = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => hit);
        return hit || fetching;
      })
    );
    return;
  }

  /* 同源静态资源：缓存优先，同时后台刷新 */
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const fetching = fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => hit);
        return hit || fetching;
      })
    );
  }
});
