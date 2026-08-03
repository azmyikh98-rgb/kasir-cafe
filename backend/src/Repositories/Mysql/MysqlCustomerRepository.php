<?php
namespace App\Repositories\Mysql;

use App\Repositories\Contracts\CustomerRepositoryInterface;
use PDO;

class MysqlCustomerRepository implements CustomerRepositoryInterface
{
    private PDO $db;

    public function __construct() { $this->db = MysqlConnection::get(); }

    private function withStats(array $row): array
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) AS cnt, COALESCE(SUM(total),0) AS spend, MAX(created_at) AS last_visit FROM transactions WHERE customer_id = ? AND status != "void"');
        $stmt->execute([$row['id']]);
        $s = $stmt->fetch();
        return [
            'id' => (int)$row['id'], 'name' => $row['name'], 'phone' => $row['phone'], 'email' => $row['email'],
            'address' => $row['address'], 'note' => $row['note'], 'createdAt' => $row['created_at'],
            'transactionCount' => (int)$s['cnt'], 'totalSpend' => (float)$s['spend'], 'lastVisit' => $s['last_visit'],
        ];
    }

    public function all(string $search = ''): array
    {
        if ($search) {
            $stmt = $this->db->prepare('SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name');
            $like = '%' . $search . '%';
            $stmt->execute([$like, $like]);
        } else {
            $stmt = $this->db->query('SELECT * FROM customers ORDER BY name');
        }
        return array_map([$this, 'withStats'], $stmt->fetchAll());
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM customers WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->withStats($row) : null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('INSERT INTO customers (name, phone, email, address, note) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$data['name'], $data['phone'] ?? '', $data['email'] ?? '', $data['address'] ?? '', $data['note'] ?? '']);
        return $this->find((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): array
    {
        $existing = $this->find($id);
        $stmt = $this->db->prepare('UPDATE customers SET name=?, phone=?, email=?, address=?, note=? WHERE id=?');
        $stmt->execute([
            $data['name'] ?? $existing['name'], $data['phone'] ?? $existing['phone'], $data['email'] ?? $existing['email'],
            $data['address'] ?? $existing['address'], $data['note'] ?? $existing['note'], $id,
        ]);
        return $this->find($id);
    }

    public function delete(int $id): void
    {
        $this->db->prepare('DELETE FROM customers WHERE id = ?')->execute([$id]);
    }
}
