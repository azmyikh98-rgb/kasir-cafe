<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\RepositoryFactory;

class CustomerController
{
    public static function index(): void
    {
        Auth::requireLogin();
        $search = $_GET['search'] ?? '';
        Response::json(RepositoryFactory::customers()->all($search));
    }

    public static function store(): void
    {
        Auth::requireLogin();
        $body = Router::bodyJson();
        if (empty($body['name'])) Response::error('Nama pelanggan wajib diisi', 400);
        Response::json(RepositoryFactory::customers()->create($body), 201);
    }

    public static function update(array $params): void
    {
        Auth::requireLogin();
        $repo = RepositoryFactory::customers();
        $id = (int)$params['id'];
        if (!$repo->find($id)) Response::error('Pelanggan tidak ditemukan', 404);
        Response::json($repo->update($id, Router::bodyJson()));
    }

    public static function destroy(array $params): void
    {
        Auth::requireLogin();
        RepositoryFactory::customers()->delete((int)$params['id']);
        Response::json(['ok' => true]);
    }
}
