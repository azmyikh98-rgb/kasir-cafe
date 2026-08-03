<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\RepositoryFactory;

class TransactionController
{
    public static function search(): void
    {
        Auth::requireLogin();
        $filters = [
            'search' => $_GET['search'] ?? '', 'from' => $_GET['from'] ?? '', 'to' => $_GET['to'] ?? '',
            'paymentMethod' => $_GET['paymentMethod'] ?? '', 'status' => $_GET['status'] ?? '',
        ];
        $sortBy = $_GET['sortBy'] ?? 'createdAt';
        $sortDir = $_GET['sortDir'] ?? 'desc';
        $page = max(1, (int)($_GET['page'] ?? 1));
        $pageSize = max(1, min(100000, (int)($_GET['pageSize'] ?? 10)));
        Response::json(RepositoryFactory::transactions()->search($filters, $sortBy, $sortDir, $page, $pageSize));
    }

    public static function show(array $params): void
    {
        Auth::requireLogin();
        $tx = RepositoryFactory::transactions()->find((int)$params['id']);
        if (!$tx) Response::error('Transaksi tidak ditemukan', 404);
        Response::json($tx);
    }

    public static function store(): void
    {
        $user = Auth::requireLogin();
        $body = Router::bodyJson();
        if (empty($body['items'])) Response::error('Keranjang tidak boleh kosong', 400);
        try {
            $tx = RepositoryFactory::transactions()->create($body, $user);
            Response::json($tx, 201);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public static function void(array $params): void
    {
        $user = Auth::requireAdmin();
        try {
            Response::json(RepositoryFactory::transactions()->void((int)$params['id'], $user));
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public static function lookup(): void
    {
        Auth::requireLogin();
        $query = $_GET['query'] ?? '';
        if (!$query) Response::json([]);
        Response::json(RepositoryFactory::transactions()->lookup($query));
    }

    public static function returnable(array $params): void
    {
        Auth::requireLogin();
        Response::json(RepositoryFactory::transactions()->returnableItems((int)$params['id']));
    }
}
