<?php
require __DIR__ . '/bootstrap.php';

use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\SettingsController;
use App\Controllers\UserController;
use App\Controllers\CategoryController;
use App\Controllers\CustomerController;
use App\Controllers\ProductController;
use App\Controllers\TransactionController;
use App\Controllers\StockController;
use App\Controllers\ReturnController;
use App\Controllers\ReportController;

$router = new Router();

// ---------- Auth ----------
$router->get('/api/me', [AuthController::class, 'me']);
$router->post('/api/login', [AuthController::class, 'login']);
$router->post('/api/logout', [AuthController::class, 'logout']);
$router->put('/api/me/password', [AuthController::class, 'changeOwnPassword']);

// ---------- Settings ----------
$router->get('/api/settings', [SettingsController::class, 'show']);
$router->put('/api/settings', [SettingsController::class, 'update']);

// ---------- Users ----------
$router->get('/api/users', [UserController::class, 'index']);
$router->post('/api/users', [UserController::class, 'store']);
$router->put('/api/users/:id', [UserController::class, 'update']);
$router->delete('/api/users/:id', [UserController::class, 'destroy']);

// ---------- Categories ----------
$router->get('/api/categories', [CategoryController::class, 'index']);
$router->post('/api/categories', [CategoryController::class, 'store']);
$router->put('/api/categories/:id', [CategoryController::class, 'update']);
$router->delete('/api/categories/:id', [CategoryController::class, 'destroy']);

// ---------- Customers ----------
$router->get('/api/customers', [CustomerController::class, 'index']);
$router->post('/api/customers', [CustomerController::class, 'store']);
$router->put('/api/customers/:id', [CustomerController::class, 'update']);
$router->delete('/api/customers/:id', [CustomerController::class, 'destroy']);

// ---------- Products ----------
$router->get('/api/products', [ProductController::class, 'index']);
$router->post('/api/products', [ProductController::class, 'store']);
$router->put('/api/products/:id', [ProductController::class, 'update']);
$router->delete('/api/products/:id', [ProductController::class, 'destroy']);

// ---------- Transactions (dipakai Kasir/Transaksi/Retur) ----------
// Rute statis (search/lookup) didaftarkan SEBELUM rute dinamis (:id) supaya
// tidak salah tertangkap sebagai id="search" dsb.
$router->get('/api/transactions/search', [TransactionController::class, 'search']);
$router->get('/api/transactions/lookup', [TransactionController::class, 'lookup']);
$router->get('/api/transactions/:id/returnable', [TransactionController::class, 'returnable']);
$router->get('/api/transactions/:id', [TransactionController::class, 'show']);
$router->post('/api/transactions', [TransactionController::class, 'store']);
$router->put('/api/transactions/:id/void', [TransactionController::class, 'void']);

// ---------- Stock ----------
$router->get('/api/stock/overview', [StockController::class, 'overview']);
$router->get('/api/stock/mutations', [StockController::class, 'mutations']);
$router->post('/api/stock/adjust', [StockController::class, 'adjust']);

// ---------- Returns ----------
$router->get('/api/returns', [ReturnController::class, 'index']);
$router->post('/api/returns', [ReturnController::class, 'store']);

// ---------- Reports ----------
$router->get('/api/reports/dashboard', [ReportController::class, 'dashboard']);
$router->get('/api/reports/range', [ReportController::class, 'range']);

// ---------- Dispatch ----------
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$router->dispatch($method, $path);
