<?php
namespace App\Repositories\Contracts;

interface ProductRepositoryInterface
{
    public function all(): array;
    public function find(int $id): ?array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): void;
    /** Menambah (delta positif) atau mengurangi (delta negatif) stok. */
    public function adjustStock(int $id, int $delta): array;
}
