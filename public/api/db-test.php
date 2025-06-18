
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

$dbTest = testDatabaseConnection();

if ($dbTest['success']) {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);
        
        // Проверяем существование таблиц
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        
        // Считаем количество товаров
        $productsCount = 0;
        if (in_array('products', $tables)) {
            $stmt = $pdo->query("SELECT COUNT(*) FROM products");
            $productsCount = $stmt->fetchColumn();
        }
        
        echo json_encode([
            'database_connection' => $dbTest,
            'tables' => $tables,
            'products_count' => $productsCount,
            'xml_upload_dir' => XML_UPLOAD_DIR,
            'xml_upload_exists' => file_exists(XML_UPLOAD_DIR),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'database_connection' => $dbTest,
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
} else {
    echo json_encode($dbTest);
}
?>
