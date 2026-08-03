<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Core\Session;
use App\Repositories\RepositoryFactory;

class AuthController
{
    public static function me(): void
    {
        Response::json(['user' => Auth::currentUser()]);
    }

    public static function login(): void
    {
        $body = Router::bodyJson();
        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';
        if (!$username || !$password) Response::error('Username dan password wajib diisi', 400);

        $userRepo = RepositoryFactory::users();
        $raw = $userRepo->findRawByUsername($username);
        if (!$raw || !password_verify($password, $raw['password_hash'])) {
            Response::error('Username atau password salah', 401);
        }

        $user = [
            'id' => (int)$raw['id'], 'username' => $raw['username'], 'name' => $raw['name'], 'role' => $raw['role'],
            'menuAccessOverride' => \App\Helpers\Format::decodeMenuAccessOverride($raw['menu_access_override'] ?? null),
        ];
        Session::set('user', $user);
        Response::json(['user' => $user]);
    }

    public static function logout(): void
    {
        Session::destroy();
        Response::json(['ok' => true]);
    }

    public static function changeOwnPassword(): void
    {
        $me = Auth::requireLogin();
        $body = Router::bodyJson();
        $current = $body['currentPassword'] ?? '';
        $new = $body['newPassword'] ?? '';
        if (!$current || !$new) Response::error('Lengkapi semua kolom', 400);

        $userRepo = RepositoryFactory::users();
        $raw = $userRepo->findRawById($me['id']);
        if (!$raw || !password_verify($current, $raw['password_hash'])) {
            Response::error('Password saat ini salah', 400);
        }
        $userRepo->updatePassword($me['id'], password_hash($new, PASSWORD_BCRYPT));
        Response::json(['ok' => true]);
    }
}
