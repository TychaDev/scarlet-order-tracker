
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
?>
