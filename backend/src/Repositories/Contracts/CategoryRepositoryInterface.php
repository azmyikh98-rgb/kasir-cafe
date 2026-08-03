<?php
namespace App\Repositories\Contracts;

interface CategoryRepositoryInterface
{
    /** @return array daftar kategori + productCount masing-masing */
    public function all(): array;
    public function find(int $id): ?array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    /** Menghapus kategori dan memindahkan produknya ke kategori "Umum". */
    public function delete(int $id): void;
}
