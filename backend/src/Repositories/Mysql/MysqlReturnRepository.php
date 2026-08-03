<?php
namespace App\Repositories\Mysql;

use App\Helpers\Format;
use App\Repositories\Contracts\ReturnRepositoryInterface;
use PDO;

class MysqlReturnRepository implements ReturnRepositoryInterface
{
    private PDO $db;

    public function __construct() { $this->db = MysqlConnection::get(); }

    private function shape(array $row): array
    {
        $stmt = $this->db->prepare('SELECT product_id AS productId, name, price, qty, subtotal FROM return_items WHERE return_id = ?');
        $stmt->execute([$row['id']]);
        $items = $stmt->fetchAll();
        foreach ($items as &$it) { $it['productId'] = $it['productId'] !== null ? (int)$it['productId'] : null; $it['qty'] = (int)$it['qty']; $it['price'] = (float)$it['price']; $it['subtotal'] = (float)$it['subtotal']; }
        return [
            'id' => (int)$row['id'], 'transactionId' => (int)$row['transaction_id'], 'invoiceLabel' => $row['invoice_label'],
            'customerName' => $row['customer_name'], 'refundAmount' => (float)$row['refund_amount'], 'reason' => $row['reason'],
            'userId' => $row['user_id'] !== null ? (int)$row['user_id'] : null, 'userName' => $row['user_name'],
            'items' => $items, 'createdAt' => $row['created_at'],
        ];
    }

    public function all(): array
    {
        $rows = $this->db->query('SELECT * FROM returns ORDER BY created_at DESC')->fetchAll();
        return array_map([$this, 'shape'], $rows);
    }

    public function create(array $data): array
    {
        $txRepo = new MysqlTransactionRepository();
        $productRepo = new MysqlProductRepository();
        $stockRepo = new MysqlStockRepository();

        $tx = $txRepo->find((int)$data['transactionId']);
        if (!$tx) throw new \RuntimeException('Transaksi tidak ditemukan');
        $returnable = $txRepo->returnableItems($tx['id']);
        $returnableMap = [];
        foreach ($returnable['items'] as $it) $returnableMap[$it['productId']] = $it;

        $this->db->beginTransaction();
        try {
            $refundAmount = 0.0; $lineItems = [];
            foreach ($data['items'] as $reqItem) {
                $pid = (int)$reqItem['productId'];
                $qty = (int)$reqItem['qty'];
                if ($qty <= 0) continue;
                $ref = $returnableMap[$pid] ?? null;
                if (!$ref || $qty > $ref['remainingQty']) throw new \RuntimeException('Jumlah retur melebihi sisa item yang bisa diretur');
                $subtotal = $ref['price'] * $qty;
                $refundAmount += $subtotal;
                $lineItems[] = ['productId' => $pid, 'name' => $ref['name'], 'price' => $ref['price'], 'qty' => $qty, 'subtotal' => $subtotal];
            }
            if (!$lineItems) throw new \RuntimeException('Tidak ada item yang diretur');

            $actor = $data['actor'];
            $stmt = $this->db->prepare(
                'INSERT INTO returns (transaction_id, invoice_label, customer_name, refund_amount, reason, user_id, user_name)
                 VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([$tx['id'], Format::invoiceLabel($tx['id']), $tx['customerName'], $refundAmount, $data['reason'] ?? 'Tidak disebutkan', $actor['id'], $actor['name']]);
            $returnId = (int)$this->db->lastInsertId();

            $itemStmt = $this->db->prepare('INSERT INTO return_items (return_id, product_id, name, price, qty, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
            foreach ($lineItems as $li) {
                $itemStmt->execute([$returnId, $li['productId'], $li['name'], $li['price'], $li['qty'], $li['subtotal']]);
                $product = $productRepo->find($li['productId']);
                $before = $product ? $product['stock'] : 0;
                $productRepo->adjustStock($li['productId'], $li['qty']);
                $stockRepo->recordMutation([
                    'productId' => $li['productId'], 'productName' => $li['name'], 'type' => 'in', 'qty' => $li['qty'],
                    'reason' => 'Retur ' . Format::invoiceLabel($tx['id']), 'stockBefore' => $before, 'stockAfter' => $before + $li['qty'],
                    'userId' => $actor['id'], 'userName' => $actor['name'],
                ]);
            }

            $this->db->commit();
            $stmt = $this->db->prepare('SELECT * FROM returns WHERE id = ?');
            $stmt->execute([$returnId]);
            return $this->shape($stmt->fetch());
        } catch (\Throwable $e) { $this->db->rollBack(); throw $e; }
    }
}
