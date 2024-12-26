<?php
header("Content-Type: application/json");

$file = 'events.json';

// читаємо вхідні дані
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // перевіряємо, чи прийшли коректні дані
    if (isset($data['id'], $data['action'], $data['timestamp'])) {
        // якщо файл існує, читаємо його вміст
        $existing = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
        // додаємо нову подію до масиву
        $existing[] = $data;
        // зберігаємо оновлений масив у файл
        file_put_contents($file, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    }
} elseif (isset($_GET['get_events'])) {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode([]);
    }
} elseif (isset($_GET['clear_events'])) {
    // видаляємо файл, якщо він існує
    if (file_exists($file)) {
        unlink($file);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'File not found']);
    }
} else {
    // якщо метод не підтримується
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
