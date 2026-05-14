<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';
include_once '../models/Task.php';

$database = new Database();
$db = $database->getConnection();
$task = new Task($db);

$data = json_decode(file_get_contents("php://input"));

// Kiểm tra xem có mảng offline_tasks được gửi lên không
if (!empty($data->offline_tasks) && is_array($data->offline_tasks)) {
    $count = 0;
    
    foreach ($data->offline_tasks as $offline_task) {
        $task->title = $offline_task->title;
        
        // Nếu task tạo lúc offline mà người dùng đã tick hoàn thành luôn, thì giữ nguyên status
        if (isset($offline_task->status)) {
            $task->status = $offline_task->status;
        }

        if ($task->create()) {
            // Nếu có update status khác 'pending' thì cập nhật luôn
            if (isset($offline_task->status) && $offline_task->status !== 'pending') {
                $task->id = $db->lastInsertId();
                $task->updateStatus();
            }
            $count++;
        }
    }

    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Đã đồng bộ " . $count . " công việc thành công"]);
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Dữ liệu không hợp lệ hoặc trống"]);
}
?>