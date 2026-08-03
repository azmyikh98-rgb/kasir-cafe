<?php
namespace App\Repositories\Contracts;

interface TransactionRepositoryInterface
{
    public function search(array $filters, string $sortBy, string $sortDir, int $page, int $pageSize): array;
    public function find(int $id): ?array;
    public function create(array $payload, array $cashier): array;
    public function void(int $id, array $actor): array;
    /** Pencarian bebas untuk fitur retur (invoice / nama pelanggan). */
    public function lookup(string $query): array;
    /** Item transaksi + sisa qty yang masih bisa diretur. */
    public function returnableItems(int $id): array;
    public function summarizePeriod(string $from, string $to): array;
}
