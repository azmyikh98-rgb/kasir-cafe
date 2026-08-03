<?php
namespace App\Core;

class Session
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => 60 * 60 * 12, // 12 jam
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_name('kasir_session');
            session_start();
        }
    }

    public static function get(string $key)
    {
        return $_SESSION[$key] ?? null;
    }

    public static function set(string $key, $value): void
    {
        $_SESSION[$key] = $value;
    }

    public static function destroy(): void
    {
        $_SESSION = [];
        session_destroy();
    }
}
