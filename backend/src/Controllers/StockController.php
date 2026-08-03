<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\RepositoryFactory;

class StockController
{
    public static function overview(): void
    {
        Auth::requireLogin();
        $products = RepositoryFactory::products()->all();
        $threshold = RepositoryFactory::settings()->get()['lowStockThreshold'];

        $shaped = array_map(function ($p) use ($threshold) {
            $status = $p['stock'] <= 0 ? 'habis' : ($p['stock'] <= $threshold ? 'menipis' : 'aman');
            return $p + ['status' => $status];
        }, $products);

        $summary = [
            'totalProducts' => count($products),
            'lowStockCount' => count(array_filter($shaped, fn($p) => $p['status'] === 'menipis')),
            'outOfStockCount' => count(array_filter($shaped, fn($p) => $p['status'] === 'habis')),
            'totalStockValue' => array_sum(array_map(fn($p) => $p['price'] * $p['stock'], $products)),
        ];
        Response::json(['products' => $shaped, 'summary' => $summary]);
    }

    public static function mutations(): void
    {
        Auth::requireLogin();
        Response::json(RepositoryFactory::stock()->mutations());
    }

    public static function adjust(): void
    {
        $user = Auth::requireLogin();
        $body = Router::bodyJson();
        $productId = (int)($body['productId'] ?? 0);
        $type = $body['type'] ?? '';
        $qty = (int)($body['qty'] ?? 0);
        $reason = $body['reason'] ?? 'Lainnya';
        if (!in_array($type, ['in', 'out'], true) || $qty <= 0) Response::error('Data penyesuaian stok tidak valid', 400);

        $productRepo = RepositoryFactory::products();
        $product = $productRepo->find($productId);
        if (!$product) Response::error('Produk tidak ditemukan', 404);

        $before = $product['stock'];
        if ($type === 'out' && $qty > $before) Response::error('Jumlah keluar melebihi stok saat ini', 400);

        $delta = $type === 'in' ? $qty : -$qty;
        $updated = $productRepo->adjustStock($productId, $delta);
        $mutation = RepositoryFactory::stock()->recordMutation([
            'productId' => $productId, 'productName' => $product['name'], 'type' => $type, 'qty' => $qty,
            'reason' => $reason, 'stockBefore' => $before, 'stockAfter' => $updated['stock'],
            'userId' => $user['id'], 'userName' => $user['name'],
        ]);
        Response::json(['product' => $updated, 'mutation' => $mutation]);
    }
}
