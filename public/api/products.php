
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'config.php';

try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));

    switch ($method) {
        case 'GET':
            if (isset($pathParts[2])) {
                // Получение конкретного товара
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$pathParts[2]]);
                $product = $stmt->fetch();
                
                if ($product) {
                    echo json_encode($product);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Product not found']);
                }
            } else {
                // Получение всех товаров
                $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
                $products = $stmt->fetchAll();
                echo json_encode($products);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                INSERT INTO products (name, category, price, stock_quantity, description, image_url, custom_description, xml_data) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $input['name'] ?? '',
                $input['category'] ?? '',
                $input['price'] ?? 0,
                $input['stock_quantity'] ?? 0,
                $input['description'] ?? '',
                $input['image_url'] ?? null,
                $input['custom_description'] ?? null,
                isset($input['xml_data']) ? json_encode($input['xml_data']) : null
            ]);
            
            $newId = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$newId]);
            $product = $stmt->fetch();
            
            echo json_encode($product);
            break;

        case 'PUT':
            if (!isset($pathParts[2])) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID required']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $fields = [];
            $values = [];
            
            foreach (['name', 'category', 'price', 'stock_quantity', 'description', 'image_url', 'custom_description'] as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $input[$field];
                }
            }
            
            if (isset($input['xml_data'])) {
                $fields[] = "xml_data = ?";
                $values[] = json_encode($input['xml_data']);
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                break;
            }
            
            $values[] = $pathParts[2];
            
            $stmt = $pdo->prepare("UPDATE products SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute($values);
            
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$pathParts[2]]);
            $product = $stmt->fetch();
            
            echo json_encode($product);
            break;

        case 'DELETE':
            if (!isset($pathParts[2])) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID required']);
                break;
            }
            
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$pathParts[2]]);
            
            echo json_encode(['message' => 'Product deleted successfully']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
