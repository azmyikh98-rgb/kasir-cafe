<?php
namespace App\Repositories\Contracts;

interface UserRepositoryInterface
{
    public function all(): array;
    public function find(int $id): ?array;
    public function findByUsername(string $username): ?array;
    /** Baris mentah termasuk password_hash — HANYA untuk verifikasi login/password. */
    public function findRawByUsername(string $username): ?array;
    public function findRawById(int $id): ?array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): void;
    public function updatePassword(int $id, string $newPasswordHash): void;
}
