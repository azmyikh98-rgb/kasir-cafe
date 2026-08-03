<?php
namespace App\Repositories\Sheets;

use App\Repositories\Contracts\CategoryRepositoryInterface;

class SheetsCategoryRepository implements CategoryRepositoryInterface
{
    private SheetsTable $table;

    public function __construct()
    {
        $this->table = new SheetsTable(GOOGLE_SHEET_ID_CATEGORIES, ['id', 'name', 'color']);
    }

    private function shape(array $row, int $productCount): array
    {
        return ['id' => (int)$row['id'], 'name' => $row['name'], 'color' => $row['color'], 'productCount' => $productCount];
    }

    private function productCounts(): array
    {
        $productRepo = new SheetsProductRepository();
        $counts = [];
        foreach ($productRepo->all() as $p) { $counts[$p['category']] = ($counts[$p['category']] ?? 0) + 1; }
        return $counts;
    }

    public function all(): array
    {
        $counts = $this->productCounts();
        return array_map(fn($row) => $this->shape($row, $counts[$row['name']] ?? 0), $this->table->readAll());
    }

    public function find(int $id): ?array
    {
        $row = $this->table->findById($id);
        if (!$row) return null;
        $counts = $this->productCounts();
        return $this->shape($row, $counts[$row['name']] ?? 0);
    }

    public function create(array $data): array
    {
        $row = $this->table->insert(['name' => $data['name'], 'color' => $data['color'] ?? '#2563EB']);
        return $this->shape($row, 0);
    }

    public function update(int $id, array $data): array
    {
        $existing = $this->table->findById($id);
        $newName = $data['name'] ?? $existing['name'];
        $row = $this->table->update($id, ['name' => $newName, 'color' => $data['color'] ?? $existing['color']]);
        if ($newName !== $existing['name']) {
            $productRepo = new SheetsProductRepository();
            foreach ($productRepo->all() as $p) {
                if ($p['category'] === $existing['name']) $productRepo->update($p['id'], ['category' => $newName]);
            }
        }
        return $this->find($id);
    }

    public function delete(int $id): void
    {
        $cat = $this->table->findById($id);
        if (!$cat || $cat['name'] === 'Umum') return;
        $productRepo = new SheetsProductRepository();
        foreach ($productRepo->all() as $p) {
            if ($p['category'] === $cat['name']) $productRepo->update($p['id'], ['category' => 'Umum']);
        }
        $this->table->softDelete($id);
    }
}
