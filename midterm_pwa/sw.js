const CACHE_NAME = 'pwa-task-cache-v2'; // Đã đổi lên v2 để ép trình duyệt nhận code mới

// Danh sách các file cần lưu offline
const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './icon-192.png', // Lưu icon offline để lúc mất mạng app vẫn có logo
    './icon-512.png',
    // Cache luôn thư viện Bootstrap để rớt mạng giao diện không bị bể
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
];

// 1. Quá trình Cài đặt: Mở kho và cất các file tĩnh vào
self.addEventListener('install', event => {
    self.skipWaiting(); // Ép Service Worker mới kích hoạt ngay lập tức
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Đã mở bộ nhớ đệm v2');
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. Quá trình Kích hoạt: Xóa các file rác cũ nếu có bản cập nhật mới
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim()); // Giành quyền điều khiển ngay lập tức
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Đang xóa cache cũ:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. Quá trình Bắt Request (Fetch): Ưu tiên lấy từ Cache nếu có
self.addEventListener('fetch', event => {
    // Bỏ qua các API call (để app.js tự lo phần IndexedDB offline)
    if (event.request.url.includes('/api/')) return;

    // Chỉ áp dụng cache cho phương thức GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(response => {
            // Nếu file đã có trong Cache thì trả về, nếu không thì lên mạng tải
            return response || fetch(event.request);
        }).catch(() => {
            console.log("Rớt mạng và không tìm thấy cache cho: ", event.request.url);
            return new Response("Offline mode", { status: 503, statusText: "Service Unavailable" });
        })
    );
});