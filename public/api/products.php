
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim($path, '/'));
$id = isset($pathParts[2]) ? $pathParts[2] : null;

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$id]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($product) {
                    $product['xml_data'] = json_decode($product['xml_data'], true);
                    echo json_encode($product);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Product not found']);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM products ORDER BY name");
                $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($products as &$product) {
                    $product['xml_data'] = json_decode($product['xml_data'], true);
                }
                
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
                $input['name'],
                $input['category'] ?? null,
                $input['price'] ?? null,
                $input['stock_quantity'] ?? 0,
                $input['description'] ?? null,
                $input['image_url'] ?? null,
                $input['custom_description'] ?? null,
                json_encode($input['xml_data'] ?? null)
            ]);
            
            $id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            $product['xml_data'] = json_decode($product['xml_data'], true);
            
            echo json_encode($product);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID required']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $fields = [];
            $values = [];
            
            if (isset($input['name'])) {
                $fields[] = 'name = ?';
                $values[] = $input['name'];
            }
            if (isset($input['category'])) {
                $fields[] = 'category = ?';
                $values[] = $input['category'];
            }
            if (isset($input['price'])) {
                $fields[] = 'price = ?';
                $values[] = $input['price'];
            }
            if (isset($input['stock_quantity'])) {
                $fields[] = 'stock_quantity = ?';
                $values[] = $input['stock_quantity'];
            }
            if (isset($input['description'])) {
                $fields[] = 'description = ?';
                $values[] = $input['description'];
            }
            if (isset($input['image_url'])) {
                $fields[] = 'image_url = ?';
                $values[] = $input['image_url'];
            }
            if (isset($input['custom_description'])) {
                $fields[] = 'custom_description = ?';
                $values[] = $input['custom_description'];
            }
            if (isset($input['xml_data'])) {
                $fields[] = 'xml_data = ?';
                $values[] = json_encode($input['xml_data']);
            }
            
            $fields[] = 'updated_at = CURRENT_TIMESTAMP';
            $values[] = $id;
            
            $stmt = $pdo->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);
            
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            $product['xml_data'] = json_decode($product['xml_data'], true);
            
            echo json_encode($product);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID required']);
                break;
            }
            
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
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
