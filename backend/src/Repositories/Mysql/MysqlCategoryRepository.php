<?php
namespace App\Repositories\Mysql;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use PDO;

class MysqlCategoryRepository implements CategoryRepositoryInterface
{
    private PDO $db;

    public function __construct() { $this->db = MysqlConnection::get(); }

    public function all(): array
    {
        $rows = $this->db->query(
            'SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category = c.name) AS product_count
             FROM categories c ORDER BY c.name'
        )->fetchAll();
        return array_map(fn($r) => [
            'id' => (int)$r['id'], 'name' => $r['name'], 'color' => $r['color'],
            'productCount' => (int)$r['product_count'],
        ], $rows);
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM categories WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) return null;
        $countStmt = $this->db->prepare('SELECT COUNT(*) FROM products WHERE category = ?');
        $countStmt->execute([$row['name']]);
        return ['id' => (int)$row['id'], 'name' => $row['name'], 'color' => $row['color'], 'productCount' => (int)$countStmt->fetchColumn()];
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
        $stmt->execute([$data['name'], $data['color'] ?? '#2563EB']);
        return $this->find((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): array
    {
        $existing = $this->find($id);
        $newName = $data['name'] ?? $existing['name'];
        $this->db->beginTransaction();
        try {
            $this->db->prepare('UPDATE categories SET name = ?, color = ? WHERE id = ?')
                ->execute([$newName, $data['color'] ?? $existing['color'], $id]);
            // nama kategori disimpan sebagai string di tabel products -> ikut di-rename
            if ($newName !== $existing['name']) {
                $this->db->prepare('UPDATE products SET category = ? WHERE category = ?')->execute([$newName, $existing['name']]);
            }
            $this->db->commit();
        } catch (\Throwable $e) { $this->db->rollBack(); throw $e; }
        return $this->find($id);
    }

    public function delete(int $id): void
    {
        $cat = $this->find($id);
        if (!$cat || $cat['name'] === 'Umum') return;
        $this->db->beginTransaction();
        try {
            $this->db->prepare('UPDATE products SET category = ? WHERE category = ?')->execute(['Umum', $cat['name']]);
            $this->db->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
            $this->db->commit();
        } catch (\Throwable $e) { $this->db->rollBack(); throw $e; }
    }
}
