<?php
class TaskController {
    private $taskModel;

    public function __construct($taskModel) {
        $this->taskModel = $taskModel;
    }

    // Điều hướng request dựa vào HTTP Method
    public function processRequest($method, $id) {
        switch ($method) {
            case 'GET':
                $this->getTasks();
                break;
            case 'POST':
                $this->createTask();
                break;
            case 'PUT':
                if ($id) {
                    $this->updateTask($id);
                } else {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Thiếu ID"]);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteTask($id);
                } else {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Thiếu ID"]);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
                break;
        }
    }

    private function getTasks() {
        $stmt = $this->taskModel->getAll();
        $tasks_arr = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Ép kiểu ID về int để chuẩn định dạng JSON
            $task_item = array(
                "id" => (int)$row['id'],
                "title" => $row['title'],
                "status" => $row['status']
            );
            array_push($tasks_arr, $task_item);
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $tasks_arr]);
    }

    private function createTask() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->title)) {
            $this->taskModel->title = $data->title;
            $new_id = $this->taskModel->create();

            if ($new_id) {
                http_response_code(201);
                echo json_encode([
                    "status" => "success", 
                    "data" => [
                        "id" => (int)$new_id, 
                        "title" => $this->taskModel->title, 
                        "status" => "pending"
                    ]
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu title."]);
        }
    }

    private function updateTask($id) {
        $data = json_decode(file_get_contents("php://input"));
        $this->taskModel->id = $id;

        if (!empty($data->status)) {
            $this->taskModel->status = $data->status;
            if ($this->taskModel->updateStatus()) {
                http_response_code(200);
                echo json_encode(["status" => "success", "message" => "Cập nhật thành công"]);
            }
        }
    }

    private function deleteTask($id) {
        $this->taskModel->id = $id;
        if ($this->taskModel->delete()) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Xóa thành công"]);
        }
    }
}
?>