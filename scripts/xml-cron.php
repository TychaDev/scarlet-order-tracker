
#!/usr/bin/env php
<?php
// Скрипт для cron-задачи синхронизации XML файлов

// Устанавливаем путь к API
$apiUrl = 'http://localhost/api/xml-sync.php'; // Измените на ваш домен

function logMessage($message) {
    $logFile = __DIR__ . '/xml-cron.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
    echo "[$timestamp] $message\n";
}

logMessage("Запуск cron-задачи синхронизации XML");

try {
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'timeout' => 300 // 5 минут
        ]
    ]);
    
    $response = file_get_contents($apiUrl, false, $context);
    
    if ($response === false) {
        throw new Exception("Не удалось выполнить запрос к API");
    }
    
    $result = json_decode($response, true);
    
    if ($result) {
        logMessage("Результат: " . $result['message']);
        if (isset($result['processedFiles'])) {
            logMessage("Обработано файлов: " . $result['processedFiles']);
        }
        if (isset($result['totalProducts'])) {
            logMessage("Всего товаров: " . $result['totalProducts']);
        }
    } else {
        logMessage("Получен некорректный ответ: " . $response);
    }
    
} catch (Exception $e) {
    logMessage("Ошибка выполнения cron-задачи: " . $e->getMessage());
    exit(1);
}

logMessage("Cron-задача завершена успешно");
exit(0);
?>
