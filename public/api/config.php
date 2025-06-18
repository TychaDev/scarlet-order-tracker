
<?php
define('DB_HOST', 'clouds.desanta.ru');
define('DB_PORT', '3306');
define('DB_NAME', 's9_apelsin');
define('DB_USER', 'u9_Ry5YvUhBuJ');
define('DB_PASS', 'sq0EnaGT@BaUIpaHcD7z..N3');

define('XML_UPLOAD_DIR', __DIR__ . '/../xml_upload/');

// Создаем папку для XML файлов если её нет
if (!file_exists(XML_UPLOAD_DIR)) {
    mkdir(XML_UPLOAD_DIR, 0755, true);
}

// Функция для тестирования подключения к базе данных
function testDatabaseConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);
        return ['success' => true, 'message' => 'Database connection successful'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()];
    }
}
?>
