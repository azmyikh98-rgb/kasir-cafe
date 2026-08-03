<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\RepositoryFactory;

class UserController
{
    public static function index(): void
    {
        Auth::requireAdmin();
        Response::json(RepositoryFactory::users()->all());
    }

    public static function store(): void
    {
        Auth::requireAdmin();
        $body = Router::bodyJson();
        if (empty($body['username']) || empty($body['password']) || empty($body['name'])) {
            Response::error('Username, password, dan nama wajib diisi', 400);
        }
        $repo = RepositoryFactory::users();
        if ($repo->findByUsername($body['username'])) Response::error('Username sudah digunakan', 400);
        Response::json($repo->create($body), 201);
    }

    public static function update(array $params): void
    {
        $me = Auth::requireLogin();
        $id = (int)$params['id'];
        if ($me['role'] !== 'admin' && $me['id'] !== $id) Response::error('Tidak diizinkan', 403);
        $body = Router::bodyJson();
        $repo = RepositoryFactory::users();
        if (!$repo->find($id)) Response::error('Pengguna tidak ditemukan', 404);
        Response::json($repo->update($id, $body));
    }

    public static function destroy(array $params): void
    {
        $me = Auth::requireAdmin();
        $id = (int)$params['id'];
        if ($id === $me['id']) Response::error('Tidak bisa menghapus akun sendiri', 400);
        RepositoryFactory::users()->delete($id);
        Response::json(['ok' => true]);
    }
}
