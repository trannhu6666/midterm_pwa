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
include_once '../models/Device.php';

$database = new Database();
$db = $database->getConnection();
$device = new Device($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->device_token)) {
    $device->device_token = $data->device_token;
    
    if ($device->saveToken()) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Đã đăng ký nhận thông báo"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Lỗi server khi lưu token"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Thiếu device_token"]);
}
?>