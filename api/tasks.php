<?php
// Mở CORS để Frontend (dù chạy ở port khác) vẫn gọi được API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Bắt buộc phải có đoạn này để xử lý Preflight Request khi JS gọi PUT/DELETE
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';
include_once '../models/Task.php';
include_once '../controllers/TaskController.php';

$database = new Database();
$db = $database->getConnection();

$task = new Task($db);
$controller = new TaskController($task);

$method = $_SERVER['REQUEST_METHOD'];

// Bắt ID từ URL (VD: api/tasks.php?id=1)
$id = isset($_GET['id']) ? $_GET['id'] : null;

// Hỗ trợ thêm kiểu bắt ID trực tiếp từ URL path (/api/tasks/1) nếu sau này cấu hình .htaccess
if (!$id) {
    $path = explode('/', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    $last_segment = end($path);
    if (is_numeric($last_segment)) {
        $id = $last_segment;
    }
}

$controller->processRequest($method, $id);
?>