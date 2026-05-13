<?php
class Device {
    private $conn;
    private $table_name = "devices";

    public $device_token;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Lưu token
    public function saveToken() {
        // Dùng INSERT IGNORE để tránh lỗi trùng lặp token nếu người dùng tải lại trang nhiều lần
        $query = "INSERT IGNORE INTO " . $this->table_name . " (device_token) VALUES (:token)";
        $stmt = $this->conn->prepare($query);

        $this->device_token = htmlspecialchars(strip_tags($this->device_token));
        $stmt->bindParam(":token", $this->device_token);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>