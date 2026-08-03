<?php
namespace App\Repositories\Sheets;

use App\Helpers\Format;
use App\Repositories\Contracts\ProductRepositoryInterface;

class SheetsProductRepository implements ProductRepositoryInterface
{
    private SheetsTable $table;

    public function __construct()
    {
        $this->table = new SheetsTable(GOOGLE_SHEET_ID_PRODUCTS, ['id', 'name', 'category', 'price', 'stock', 'favorite', 'image', 'created_at']);
    }

    private function shape(array $row): array
    {
        return [
            'id' => (int)$row['id'], 'name' => $row['name'], 'category' => $row['category'] ?: 'Umum',
            'price' => (float)$row['price'], 'stock' => (int)$row['stock'], 'favorite' => $row['favorite'] === '1',
            'image' => $row['image'] ?: null,
        ];
    }

    public function all(): array { return array_map([$this, 'shape'], $this->table->readAll()); }

    public function find(int $id): ?array
    {
        $row = $this->table->findById($id);
        return $row ? $this->shape($row) : null;
    }

    public function create(array $data): array
    {
        $row = $this->table->insert([
            'name' => $data['name'], 'category' => $data['category'] ?? 'Umum', 'price' => $data['price'] ?? 0,
            'stock' => $data['stock'] ?? 0, 'favorite' => !empty($data['favorite']) ? '1' : '0',
            'image' => $data['image'] ?? '', 'created_at' => Format::nowIso(),
        ]);
        return $this->shape($row);
    }

    public function update(int $id, array $data): array
    {
        $changes = [];
        foreach (['name', 'category', 'price', 'stock'] as $k) if (array_key_exists($k, $data)) $changes[$k] = $data[$k];
        if (array_key_exists('favorite', $data)) $changes['favorite'] = !empty($data['favorite']) ? '1' : '0';
        if (array_key_exists('image', $data)) $changes['image'] = $data['image'] ?? '';
        $row = $this->table->update($id, $changes);
        return $this->shape($row);
    }

    public function delete(int $id): void { $this->table->softDelete($id); }

    public function adjustStock(int $id, int $delta): array
    {
        $row = $this->table->findById($id);
        $newStock = max(0, (int)$row['stock'] + $delta);
        $updated = $this->table->update($id, ['stock' => $newStock]);
        return $this->shape($updated);
    }
}
