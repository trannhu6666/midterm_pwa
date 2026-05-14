<?php
class Database {
    private $host = "localhost";
    private $db_name = "pwa_task_tracker";
    private $username = "root";
    private $password = ""; // Mặc định của XAMPP thường là rỗng
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            // Thiết lập chế độ báo lỗi để dễ debug
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Đảm bảo không bị lỗi font Tiếng Việt
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Lỗi kết nối CSDL: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>