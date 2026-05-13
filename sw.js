const CACHE_NAME = 'pwa-task-cache-v1';

// Danh sách các file cần lưu offline
const urlsToCache = [
    './index.html',
    './app.js',
    './manifest.json',
    // Cache luôn thư viện Bootstrap để rớt mạng giao diện không bị bể
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
];

// 1. Quá trình Cài đặt: Mở kho và cất các file tĩnh vào
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. Quá trình Kích hoạt: Xóa các file rác cũ nếu có bản cập nhật mới
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. Quá trình Bắt Request (Fetch): Ưu tiên lấy từ Cache nếu có
self.addEventListener('fetch', event => {
    // Chỉ áp dụng cache cho phương thức GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(response => {
            // Nếu file đã có trong Cache thì trả về, nếu không thì lên mạng tải
            return response || fetch(event.request);
        }).catch(() => {
            // Khi rớt mạng mà không có trong cache, trả về một Response giả 
            // để trình duyệt không bị văng lỗi TypeError
            console.log("Rớt mạng và không tìm thấy cache cho: ", event.request.url);
            return new Response("Offline mode", { status: 503, statusText: "Service Unavailable" });
        })
    );
}); 