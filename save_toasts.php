<?php
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['toasts'])) {
    file_put_contents('toasts.json', json_encode($data['toasts'], JSON_PRETTY_PRINT));
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
}
?>

