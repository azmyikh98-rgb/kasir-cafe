<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\RepositoryFactory;

class SettingsController
{
    public static function show(): void
    {
        Auth::requireLogin();
        Response::json(RepositoryFactory::settings()->get());
    }

    public static function update(): void
    {
        Auth::requireAdmin();
        $body = Router::bodyJson();
        Response::json(RepositoryFactory::settings()->update($body));
    }
}
