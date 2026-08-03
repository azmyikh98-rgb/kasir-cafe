<?php
namespace App\Repositories\Contracts;

interface StockRepositoryInterface
{
    public function mutations(): array;
    public function recordMutation(array $data): array;
}
