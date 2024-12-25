<?php
header("Content-Type: application/json");

$file = 'events.json';

// Читаємо вхідні дані
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Перевіряємо, чи прийшли коректні дані
    if (isset($data['id'], $data['action'], $data['timestamp'])) {
        // Якщо файл існує, читаємо його вміст
        $existing = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
        // Додаємо нову подію до масиву
        $existing[] = $data;
        // Зберігаємо оновлений масив у файл
        file_put_contents($file, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    }
} elseif (isset($_GET['get_events'])) {
    // Повертаємо вміст файлу, якщо він існує
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode([]);
    }
} else {
    // Якщо метод не підтримується
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}




