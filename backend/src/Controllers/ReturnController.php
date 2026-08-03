<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Router;
use App\Repositories\RepositoryFactory;

class ReturnController
{
    public static function index(): void
    {
        Auth::requireLogin();
        Response::json(RepositoryFactory::returns()->all());
    }

    public static function store(): void
    {
        $user = Auth::requireLogin();
        $body = Router::bodyJson();
        if (empty($body['transactionId']) || empty($body['items'])) {
            Response::error('Data retur tidak lengkap', 400);
        }
        $body['actor'] = $user;
        try {
            Response::json(RepositoryFactory::returns()->create($body), 201);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
