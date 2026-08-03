<?php
namespace App\Repositories\Contracts;

interface ReturnRepositoryInterface
{
    public function all(): array;
    public function create(array $data): array;
}
