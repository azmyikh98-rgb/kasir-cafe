<?php
// ============================================================
// Bootstrap aplikasi: autoload class App\..., load config, mulai
// session. Di-include oleh api/index.php di awal setiap request.
// ============================================================

spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) return;
    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/../src/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($path)) require $path;
});

$configPath = __DIR__ . '/../config/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'config.php belum ada. Salin config.example.php menjadi config.php lalu isi datanya.']);
    exit;
}
require $configPath;

App\Core\Session::start();
