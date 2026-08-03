<?php
namespace App\Core;

class Auth
{
    public static function currentUser(): ?array
    {
        return Session::get('user');
    }

    public static function requireLogin(): array
    {
        $user = self::currentUser();
        if (!$user) Response::error('Belum login', 401);
        return $user;
    }

    public static function requireAdmin(): array
    {
        $user = self::requireLogin();
        if ($user['role'] !== 'admin') Response::error('Hanya admin yang bisa mengakses', 403);
        return $user;
    }
}
