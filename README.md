# PWA Task Tracker - Midterm Project

Dự án Giữa kỳ môn Lập trình Web: Ứng dụng quản lý công việc (Task Tracker) áp dụng công nghệ Progressive Web App (PWA) với kiến trúc MVC PHP Backend.

## Thành viên nhóm

- **Trần Thị Ngọc Như** (MSSV: 524H0021) - Dev A (UI/UX Design, PWA Logic).
- **Nguyễn Thành An** (MSSV: 519H0133) - Dev B (PHP Backend, RESTful API, Database & Sync) & Hoàn thiện Frontend.

## Tính năng nổi bật

- **Offline-first:** Có thể thêm công việc ngay cả khi không có kết nối mạng (sử dụng IndexedDB).
- **Auto-Sync:** Tự động đồng bộ dữ liệu cục bộ lên MySQL Server khi có mạng trở lại.
- **RESTful API:** Hệ thống Backend viết bằng PHP thuần chuẩn MVC, giao tiếp qua JSON.
- **Push Notification:** Hỗ trợ đăng ký và nhận thông báo (Mô phỏng lấy Token thiết bị).
- **Cài đặt như App:** Ứng dụng có file `manifest.json` và `sw.js` để có thể "Add to Home Screen" trên điện thoại/máy tính.

## Cài đặt & Khởi chạy (Dành cho Giảng viên chấm bài)

1. Clone hoặc copy thư mục `midterm_pwa` vào `C:\xampp\htdocs\`.
2. Mở phpMyAdmin, tạo database tên là `pwa_task_tracker`.
3. Import script SQL (đính kèm trong báo cáo) hoặc chạy lệnh khởi tạo bảng `tasks` và `devices`.
4. Mở file cấu hình `config/Database.php` và đảm bảo thông tin user/password khớp với XAMPP của thầy/cô (mặc định: root / rỗng).
5. Truy cập ứng dụng tại: `http://localhost/midterm_pwa/index.html`

## Cấu trúc API (Endpoints)

- `GET /api/tasks.php` : Lấy danh sách công việc.
- `POST /api/tasks.php` : Tạo công việc mới.
- `PUT /api/tasks.php?id={id}` : Cập nhật trạng thái hoàn thành.
- `DELETE /api/tasks.php?id={id}` : Xóa công việc.
- `POST /api/sync.php` : Đồng bộ mảng tasks từ IndexedDB lên Server.
- `POST /api/subscribe.php` : Đăng ký Device Token để nhận thông báo.
