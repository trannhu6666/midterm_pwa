<?php
class Task {
    private $conn;
    private $table_name = "tasks";

    public $id;
    public $title;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Lấy tất cả task
    public function getAll() {
        $query = "SELECT id, title, status FROM " . $this->table_name . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Tạo task mới
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET title=:title, status=:status";
        $stmt = $this->conn->prepare($query);

        // Làm sạch dữ liệu đầu vào
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->status = "pending"; // Mặc định khi tạo mới là pending

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":status", $this->status);

        if($stmt->execute()) {
            return $this->conn->lastInsertId(); // Trả về ID vừa tạo
        }
        return false;
    }

    // Cập nhật trạng thái
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . " SET status=:status WHERE id=:id";
        $stmt = $this->conn->prepare($query);

        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Xóa task
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>