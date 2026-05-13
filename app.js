const API_BASE_URL = './api';
let tasks = [];

const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const offlineBadge = document.getElementById('offline-badge');

// ==========================================
// 1. GỌI API LẤY DANH SÁCH TASK (GET)
// ==========================================
async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks.php`);
        const result = await response.json();
        if (result.status === 'success') {
            tasks = result.data;
            renderTasks();
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ Server:", error);
        // Nếu lỗi do mất mạng, UI vẫn hiện mảng tasks rỗng hoặc tasks đã lưu ở RAM
    }
}

// ==========================================
// 2. RENDER GIAO DIỆN
// ==========================================
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const isCompleted = task.status === 'completed';
        const li = document.createElement('li');
        li.className = `list-group-item d-flex justify-content-between align-items-center border mb-2 rounded shadow-sm ${isCompleted ? 'bg-light text-muted opacity-75' : 'bg-white'}`;
        li.innerHTML = `
            <div class="d-flex align-items-center overflow-hidden">
                <input class="form-check-input me-3 fs-5 flex-shrink-0" type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="text-truncate ${isCompleted ? 'text-decoration-line-through' : 'fw-medium'}">${task.title}</span>
            </div>
            <button class="btn btn-sm btn-outline-danger border-0 flex-shrink-0 ms-2" onclick="deleteTask(${task.id})"><i class="bi bi-trash3-fill"></i></button>
        `;
        taskList.appendChild(li);
    });
}

// ==========================================
// 3. SETUP INDEXEDDB (LƯU OFFLINE)
// ==========================================
let db;
const request = indexedDB.open("MidtermTaskDB", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("offline_tasks")) {
        db.createObjectStore("offline_tasks", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    updateNetworkStatus();
    // Vừa vào trang là tự động lấy dữ liệu mới nhất
    fetchTasks();
};

// ==========================================
// 4. LOGIC THÊM, SỬA, XÓA TASK
// ==========================================
async function addTask() {
    const title = taskInput.value.trim();
    if (!title) return;

    if (navigator.onLine) {
        // --- ONLINE: Bắn API lên Server ---
        try {
            const response = await fetch(`${API_BASE_URL}/tasks.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title })
            });
            const result = await response.json();
            if (result.status === 'success') {
                tasks.unshift(result.data); // Thêm lên đầu mảng
                renderTasks();
            }
        } catch (error) {
            console.error("Lỗi khi thêm task:", error);
        }
    } else {
        // --- OFFLINE: Lưu vào kho IndexedDB ---
        const newTask = { title: title, status: "pending" }; // Bỏ id tĩnh đi để khi push lên server lấy ID chuẩn
        const transaction = db.transaction(["offline_tasks"], "readwrite");
        const store = transaction.objectStore("offline_tasks");

        store.put(newTask);
        transaction.oncomplete = () => {
            // Hiển thị tạm thời cho User thấy
            tasks.unshift({ id: Date.now(), ...newTask });
            renderTasks();
            alert("Mất mạng: Đã lưu công việc cục bộ!");
        };
    }
    taskInput.value = '';
}

window.toggleTask = async function (id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'pending' ? 'completed' : 'pending';

    if (navigator.onLine) {
        try {
            await fetch(`${API_BASE_URL}/tasks.php?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            task.status = newStatus;
            renderTasks();
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
        }
    } else {
        alert("Tính năng cập nhật trạng thái tạm khóa khi offline!");
        renderTasks(); // Render lại để reset cái checkbox
    }
}

window.deleteTask = async function (id) {
    if (navigator.onLine) {
        try {
            await fetch(`${API_BASE_URL}/tasks.php?id=${id}`, {
                method: 'DELETE'
            });
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
        }
    } else {
        alert("Vui lòng kết nối mạng để xóa công việc!");
    }
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

// ==========================================
// 5. THEO DÕI TRẠNG THÁI MẠNG VÀ ĐỒNG BỘ
// ==========================================
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function updateNetworkStatus() {
    if (navigator.onLine) {
        offlineBadge.classList.add('d-none');
        syncOfflineTasks();
    } else {
        offlineBadge.classList.remove('d-none');
    }
}

function syncOfflineTasks() {
    if (!db) return;
    const transaction = db.transaction(["offline_tasks"], "readonly");
    const store = transaction.objectStore("offline_tasks");
    const request = store.getAll();

    request.onsuccess = async () => {
        const offlineTasks = request.result;
        if (offlineTasks.length === 0) return;

        try {
            const response = await fetch(`${API_BASE_URL}/sync.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offline_tasks: offlineTasks })
            });

            const result = await response.json();
            if (result.status === 'success') {
                alert(`Đã đồng bộ thành công ${offlineTasks.length} công việc lên Server!`);

                // Dọn dẹp DB offline
                const clearTx = db.transaction(["offline_tasks"], "readwrite");
                clearTx.objectStore("offline_tasks").clear();

                // Tải lại danh sách mới nhất từ server
                fetchTasks();
            }
        } catch (error) {
            console.error("Lỗi đồng bộ:", error);
        }
    };
}

// ==========================================
// 6. ĐĂNG KÝ SERVICE WORKER
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('Lỗi đăng ký Service Worker:', err));
    });
}

// ==========================================
// 7. PUSH NOTIFICATION & SUBSCRIBE API
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") setupNotificationToken();
        });
    } else if (Notification.permission === "granted") {
        setupNotificationToken();
    }
});

async function setupNotificationToken() {
    // Trong thực tế, bạn sẽ lấy token từ Firebase Cloud Messaging (FCM).
    // Ở đây theo yêu cầu môn học, ta giả lập tạo 1 token ngẫu nhiên gắn với trình duyệt.
    let mockDeviceToken = localStorage.getItem('device_token');
    if (!mockDeviceToken) {
        mockDeviceToken = "token_trinh_duyet_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_token', mockDeviceToken);
    }

    try {
        await fetch(`${API_BASE_URL}/subscribe.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_token: mockDeviceToken })
        });

        new Notification("PWA Task Tracker", {
            body: "Đã bật thông báo thành công!",
            icon: "https://cdn-icons-png.flaticon.com/512/906/906334.png"
        });
    } catch (error) {
        console.error("Lỗi đăng ký token:", error);
    }
}