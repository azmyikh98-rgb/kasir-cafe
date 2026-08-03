<?php
namespace App\Repositories\Mysql;

use App\Repositories\Contracts\StockRepositoryInterface;
use PDO;

class MysqlStockRepository implements StockRepositoryInterface
{
    private PDO $db;

    public function __construct() { $this->db = MysqlConnection::get(); }

    private function shape(array $row): array
    {
        return [
            'id' => (int)$row['id'], 'productId' => $row['product_id'] !== null ? (int)$row['product_id'] : null,
            'productName' => $row['product_name'], 'type' => $row['type'], 'qty' => (int)$row['qty'],
            'reason' => $row['reason'], 'stockBefore' => (int)$row['stock_before'], 'stockAfter' => (int)$row['stock_after'],
            'userId' => $row['user_id'] !== null ? (int)$row['user_id'] : null, 'userName' => $row['user_name'],
            'createdAt' => $row['created_at'],
        ];
    }

    public function mutations(): array
    {
        $rows = $this->db->query('SELECT * FROM stock_mutations ORDER BY created_at DESC, id DESC LIMIT 300')->fetchAll();
        return array_map([$this, 'shape'], $rows);
    }

    public function recordMutation(array $data): array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO stock_mutations (product_id, product_name, type, qty, reason, stock_before, stock_after, user_id, user_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['productId'], $data['productName'], $data['type'], $data['qty'], $data['reason'],
            $data['stockBefore'], $data['stockAfter'], $data['userId'], $data['userName'],
        ]);
        $id = (int)$this->db->lastInsertId();
        $stmt = $this->db->prepare('SELECT * FROM stock_mutations WHERE id = ?');
        $stmt->execute([$id]);
        return $this->shape($stmt->fetch());
    }
}
