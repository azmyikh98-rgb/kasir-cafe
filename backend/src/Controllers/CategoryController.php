<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\RepositoryFactory;

class CategoryController
{
    public static function index(): void
    {
        Auth::requireLogin();
        Response::json(RepositoryFactory::categories()->all());
    }

    public static function store(): void
    {
        Auth::requireLogin();
        $body = Router::bodyJson();
        if (empty($body['name'])) Response::error('Nama kategori wajib diisi', 400);
        Response::json(RepositoryFactory::categories()->create($body), 201);
    }

    public static function update(array $params): void
    {
        Auth::requireLogin();
        $repo = RepositoryFactory::categories();
        $id = (int)$params['id'];
        if (!$repo->find($id)) Response::error('Kategori tidak ditemukan', 404);
        Response::json($repo->update($id, Router::bodyJson()));
    }

    public static function destroy(array $params): void
    {
        Auth::requireLogin();
        RepositoryFactory::categories()->delete((int)$params['id']);
        Response::json(['ok' => true]);
    }
}
