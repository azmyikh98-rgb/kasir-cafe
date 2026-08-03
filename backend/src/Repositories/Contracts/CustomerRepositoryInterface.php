<?php
namespace App\Repositories\Contracts;

interface CustomerRepositoryInterface
{
    /** @return array daftar pelanggan + transactionCount/totalSpend/lastVisit */
    public function all(string $search = ''): array;
    public function find(int $id): ?array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): void;
}
