
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

function logMessage($message) {
    error_log("[XML-SYNC] " . date('Y-m-d H:i:s') . " - " . $message);
}

function processXmlFile($filepath, $pdo) {
    logMessage("Обработка файла: " . basename($filepath));
    
    $xmlContent = file_get_contents($filepath);
    if (!$xmlContent) {
        throw new Exception("Не удалось прочитать файл: " . basename($filepath));
    }
    
    $xml = simplexml_load_string($xmlContent);
    if (!$xml) {
        throw new Exception("Ошибка парсинга XML файла: " . basename($filepath));
    }
    
    $offers = $xml->xpath('//offer');
    if (empty($offers)) {
        // Попробуем найти другие варианты
        $offers = $xml->xpath('//product');
        if (empty($offers)) {
            $offers = $xml->xpath('//item');
        }
    }
    
    if (empty($offers)) {
        throw new Exception("В XML файле не найдено товаров");
    }
    
    logMessage("Найдено товаров в XML: " . count($offers));
    
    $processed = 0;
    $errors = 0;
    
    foreach ($offers as $offer) {
        try {
            $sku = (string)($offer['sku'] ?? $offer['id'] ?? '');
            $group1 = (string)($offer['group1'] ?? $offer['category'] ?? 'Без категории');
            $group2 = (string)($offer['group2'] ?? $offer['subcategory'] ?? '');
            
            $name = (string)($offer->name ?? $offer->title ?? 'Неизвестный товар');
            $ostatok = (string)($offer->ostatok ?? $offer->quantity ?? $offer->stock ?? '0');
            $priceText = (string)($offer->price ?? $offer->cost ?? '0');
            
            $stockQuantity = (int)floatval(str_replace(',', '.', $ostatok));
            $price = floatval(str_replace([' ', ','], ['', '.'], $priceText));
            
            $category = $group2 ?: $group1;
            $description = "SKU: $sku";
            if ($group1) $description .= " | Группа: $group1";
            if ($group2) $description .= " | Подгруппа: $group2";
            
            $xmlData = [
                'sku' => $sku,
                'group1' => $group1,
                'group2' => $group2,
                'original_ostatok' => $ostatok,
                'original_price' => $priceText,
                'imported_from' => basename($filepath),
                'imported_at' => date('Y-m-d H:i:s')
            ];
            
            // Проверяем, существует ли товар с таким SKU
            $stmt = $pdo->prepare("SELECT id FROM products WHERE JSON_EXTRACT(xml_data, '$.sku') = ?");
            $stmt->execute([$sku]);
            $existingProduct = $stmt->fetch();
            
            if ($existingProduct) {
                // Обновляем существующий товар
                $stmt = $pdo->prepare("
                    UPDATE products 
                    SET price = ?, stock_quantity = ?, xml_data = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ");
                $stmt->execute([$price, $stockQuantity, json_encode($xmlData), $existingProduct['id']]);
            } else {
                // Создаем новый товар
                $stmt = $pdo->prepare("
                    INSERT INTO products (name, category, price, stock_quantity, description, xml_data) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$name, $category, $price, $stockQuantity, $description, json_encode($xmlData)]);
            }
            
            $processed++;
            
        } catch (Exception $e) {
            $errors++;
            logMessage("Ошибка при обработке товара: " . $e->getMessage());
        }
    }
    
    logMessage("Обработано товаров: $processed, ошибок: $errors");
    return $processed;
}

function getFileHash($filepath) {
    return hash_file('md5', $filepath);
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    logMessage("Начинаем синхронизацию XML файлов");
    
    if (!file_exists(XML_UPLOAD_DIR)) {
        throw new Exception("Папка xml_upload не существует: " . XML_UPLOAD_DIR);
    }
    
    $xmlFiles = glob(XML_UPLOAD_DIR . '*.xml');
    logMessage("Найдено XML файлов: " . count($xmlFiles));
    
    if (empty($xmlFiles)) {
        echo json_encode([
            'message' => 'XML файлы не найдены в папке xml_upload',
            'processedFiles' => 0
        ]);
        exit;
    }
    
    $totalProcessed = 0;
    $processedFiles = 0;
    
    foreach ($xmlFiles as $xmlFile) {
        try {
            $filename = basename($xmlFile);
            $fileHash = getFileHash($xmlFile);
            $lastModified = date('Y-m-d H:i:s', filemtime($xmlFile));
            
            // Проверяем, изменился ли файл
            $stmt = $pdo->prepare("SELECT file_hash FROM xml_file_log WHERE filename = ? ORDER BY processed_at DESC LIMIT 1");
            $stmt->execute([$filename]);
            $lastRecord = $stmt->fetch();
            
            if ($lastRecord && $lastRecord['file_hash'] === $fileHash) {
                logMessage("Файл $filename не изменился, пропускаем");
                continue;
            }
            
            logMessage("Обрабатываем файл: $filename");
            $productsCount = processXmlFile($xmlFile, $pdo);
            
            // Записываем в лог
            $stmt = $pdo->prepare("
                INSERT INTO xml_file_log (filename, file_hash, last_modified, products_count, status) 
                VALUES (?, ?, ?, ?, 'success')
            ");
            $stmt->execute([$filename, $fileHash, $lastModified, $productsCount]);
            
            $totalProcessed += $productsCount;
            $processedFiles++;
            
        } catch (Exception $e) {
            logMessage("Ошибка при обработке файла $filename: " . $e->getMessage());
            
            // Записываем ошибку в лог
            $stmt = $pdo->prepare("
                INSERT INTO xml_file_log (filename, file_hash, last_modified, products_count, status, error_message) 
                VALUES (?, ?, ?, 0, 'error', ?)
            ");
            $stmt->execute([$filename, $fileHash ?? '', $lastModified ?? date('Y-m-d H:i:s'), $e->getMessage()]);
        }
    }
    
    logMessage("Синхронизация завершена. Обработано файлов: $processedFiles, товаров: $totalProcessed");
    
    echo json_encode([
        'message' => "Синхронизация завершена успешно",
        'processedFiles' => $processedFiles,
        'totalProducts' => $totalProcessed
    ]);
    
} catch (PDOException $e) {
    logMessage("Ошибка базы данных: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    logMessage("Ошибка сервера: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
