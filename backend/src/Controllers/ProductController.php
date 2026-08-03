<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\RepositoryFactory;

class ProductController
{
    public static function index(): void
    {
        Auth::requireLogin();
        Response::json(RepositoryFactory::products()->all());
    }

    public static function store(): void
    {
        Auth::requireLogin();
        $body = Router::bodyJson();
        if (empty($body['name'])) Response::error('Nama produk wajib diisi', 400);
        Response::json(RepositoryFactory::products()->create($body), 201);
    }

    public static function update(array $params): void
    {
        Auth::requireLogin();
        $repo = RepositoryFactory::products();
        $id = (int)$params['id'];
        if (!$repo->find($id)) Response::error('Produk tidak ditemukan', 404);
        Response::json($repo->update($id, Router::bodyJson()));
    }

    public static function destroy(array $params): void
    {
        Auth::requireLogin();
        RepositoryFactory::products()->delete((int)$params['id']);
        Response::json(['ok' => true]);
    }
}
