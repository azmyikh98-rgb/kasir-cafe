<?php
namespace App\Repositories\Mysql;

use App\Repositories\Contracts\ProductRepositoryInterface;
use PDO;

class MysqlProductRepository implements ProductRepositoryInterface
{
    private PDO $db;

    public function __construct() { $this->db = MysqlConnection::get(); }

    private function shape(array $row): array
    {
        return [
            'id' => (int)$row['id'], 'name' => $row['name'], 'category' => $row['category'],
            'price' => (float)$row['price'], 'stock' => (int)$row['stock'],
            'favorite' => (bool)$row['favorite'], 'image' => $row['image'],
        ];
    }

    public function all(): array
    {
        $rows = $this->db->query('SELECT * FROM products ORDER BY name')->fetchAll();
        return array_map([$this, 'shape'], $rows);
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->shape($row) : null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('INSERT INTO products (name, category, price, stock, favorite, image) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['name'], $data['category'] ?? 'Umum', $data['price'] ?? 0, $data['stock'] ?? 0,
            !empty($data['favorite']) ? 1 : 0, $data['image'] ?? null,
        ]);
        return $this->find((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): array
    {
        $existing = $this->find($id);
        $stmt = $this->db->prepare('UPDATE products SET name=?, category=?, price=?, stock=?, favorite=?, image=? WHERE id=?');
        $stmt->execute([
            $data['name'] ?? $existing['name'], $data['category'] ?? $existing['category'],
            $data['price'] ?? $existing['price'], $data['stock'] ?? $existing['stock'],
            array_key_exists('favorite', $data) ? (!empty($data['favorite']) ? 1 : 0) : ($existing['favorite'] ? 1 : 0),
            array_key_exists('image', $data) ? $data['image'] : $existing['image'], $id,
        ]);
        return $this->find($id);
    }

    public function delete(int $id): void
    {
        $this->db->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
    }

    public function adjustStock(int $id, int $delta): array
    {
        $this->db->prepare('UPDATE products SET stock = GREATEST(0, stock + ?) WHERE id = ?')->execute([$delta, $id]);
        return $this->find($id);
    }
}
