<?php
namespace App\Repositories\Mysql;

use App\Helpers\Format;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use PDO;

class MysqlTransactionRepository implements TransactionRepositoryInterface
{
    private PDO $db;

    public function __construct() { $this->db = MysqlConnection::get(); }

    private function fetchItems(int $txId): array
    {
        $stmt = $this->db->prepare('SELECT product_id AS productId, name, price, qty, subtotal FROM transaction_items WHERE transaction_id = ? ORDER BY id');
        $stmt->execute([$txId]);
        $items = $stmt->fetchAll();
        foreach ($items as &$it) {
            $it['productId'] = $it['productId'] !== null ? (int)$it['productId'] : null;
            $it['price'] = (float)$it['price']; $it['qty'] = (int)$it['qty']; $it['subtotal'] = (float)$it['subtotal'];
        }
        return $items;
    }

    private function shape(array $tx): array
    {
        return [
            'id' => (int)$tx['id'], 'userId' => $tx['user_id'] !== null ? (int)$tx['user_id'] : null,
            'cashierName' => $tx['cashier_name'], 'customerId' => $tx['customer_id'] !== null ? (int)$tx['customer_id'] : null,
            'customerName' => $tx['customer_name'], 'items' => $this->fetchItems((int)$tx['id']),
            'subtotal' => (float)$tx['subtotal'], 'discount' => (float)$tx['discount'], 'tax' => (float)$tx['tax'],
            'total' => (float)$tx['total'], 'paymentMethod' => $tx['payment_method'], 'cashGiven' => (float)$tx['cash_given'],
            'change' => (float)$tx['change_amount'], 'tableNumber' => $tx['table_number'], 'orderType' => $tx['order_type'],
            'status' => $tx['status'], 'voidedAt' => $tx['voided_at'], 'voidedBy' => $tx['voided_by'], 'createdAt' => $tx['created_at'],
        ];
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM transactions WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->shape($row) : null;
    }

    public function search(array $filters, string $sortBy, string $sortDir, int $page, int $pageSize): array
    {
        $where = ['1=1']; $params = [];
        if (!empty($filters['search'])) {
            $where[] = '(id LIKE ? OR cashier_name LIKE ? OR customer_name LIKE ?)';
            $like = '%' . $filters['search'] . '%';
            array_push($params, $like, $like, $like);
        }
        if (!empty($filters['from'])) { $where[] = 'DATE(created_at) >= ?'; $params[] = $filters['from']; }
        if (!empty($filters['to'])) { $where[] = 'DATE(created_at) <= ?'; $params[] = $filters['to']; }
        if (!empty($filters['paymentMethod'])) { $where[] = 'payment_method = ?'; $params[] = $filters['paymentMethod']; }
        if (!empty($filters['status'])) { $where[] = 'status = ?'; $params[] = $filters['status']; }

        $sortColMap = ['id' => 'id', 'createdAt' => 'created_at', 'total' => 'total', 'itemCount' => 'id'];
        $sortCol = $sortColMap[$sortBy] ?? 'created_at';
        $dir = strtolower($sortDir) === 'asc' ? 'ASC' : 'DESC';

        $whereSql = implode(' AND ', $where);
        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM transactions WHERE $whereSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $offset = max(0, ($page - 1) * $pageSize);
        $stmt = $this->db->prepare("SELECT * FROM transactions WHERE $whereSql ORDER BY $sortCol $dir LIMIT ? OFFSET ?");
        $i = 1;
        foreach ($params as $p) { $stmt->bindValue($i++, $p); }
        $stmt->bindValue($i++, (int)$pageSize, PDO::PARAM_INT);
        $stmt->bindValue($i++, (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = array_map([$this, 'shape'], $stmt->fetchAll());

        return [
            'data' => $rows, 'total' => $total, 'page' => $page, 'pageSize' => $pageSize,
            'totalPages' => max(1, (int)ceil($total / max(1, $pageSize))),
        ];
    }

    public function lookup(string $query): array
    {
        $like = '%' . preg_replace('/^INV-0*/i', '', $query) . '%';
        $stmt = $this->db->prepare(
            "SELECT * FROM transactions WHERE status != 'void' AND (id LIKE ? OR customer_name LIKE ? OR cashier_name LIKE ?) ORDER BY created_at DESC LIMIT 20"
        );
        $stmt->execute([$like, '%' . $query . '%', '%' . $query . '%']);
        return array_map(function ($row) {
            $tx = $this->shape($row);
            $tx['items'] = $this->withReturnInfo((int)$row['id'], $tx['items']);
            return $tx;
        }, $stmt->fetchAll());
    }

    private function withReturnInfo(int $txId, array $items): array
    {
        $stmt = $this->db->prepare(
            'SELECT product_id AS productId, COALESCE(SUM(qty),0) AS returnedQty FROM return_items ri
             JOIN returns r ON r.id = ri.return_id WHERE r.transaction_id = ? GROUP BY product_id'
        );
        $stmt->execute([$txId]);
        $returnedMap = [];
        foreach ($stmt->fetchAll() as $row) $returnedMap[(int)$row['productId']] = (int)$row['returnedQty'];
        foreach ($items as &$it) {
            $already = $returnedMap[$it['productId']] ?? 0;
            $it['returnedQty'] = $already;
            $it['remainingQty'] = $it['qty'] - $already;
        }
        return $items;
    }

    public function returnableItems(int $id): array
    {
        $tx = $this->find($id);
        if (!$tx) return [];
        $tx['items'] = $this->withReturnInfo($id, $tx['items']);
        return $tx;
    }

    public function create(array $payload, array $cashier): array
    {
        $productRepo = new MysqlProductRepository();
        $stockRepo = new MysqlStockRepository();

        $this->db->beginTransaction();
        try {
            $subtotal = 0.0;
            $lineItems = [];
            foreach ($payload['items'] as $item) {
                $product = $productRepo->find((int)$item['productId']);
                if (!$product) throw new \RuntimeException('Produk tidak ditemukan: #' . $item['productId']);
                $qty = (int)$item['qty'];
                if ($qty <= 0) throw new \RuntimeException('Jumlah item tidak valid');
                if ($product['stock'] < $qty) throw new \RuntimeException('Stok "' . $product['name'] . '" tidak mencukupi');
                $lineSubtotal = $product['price'] * $qty;
                $subtotal += $lineSubtotal;
                $lineItems[] = ['productId' => $product['id'], 'name' => $product['name'], 'price' => $product['price'], 'qty' => $qty, 'subtotal' => $lineSubtotal];
            }
            $discount = (float)($payload['discount'] ?? 0);
            $tax = (float)($payload['tax'] ?? 0);
            $total = max(0, $subtotal - $discount + $tax);
            $cashGiven = (float)($payload['cashGiven'] ?? 0);
            $change = $payload['paymentMethod'] === 'cash' ? max(0, $cashGiven - $total) : 0;

            $customerName = $payload['customerName'] ?? null;
            if (!empty($payload['customerId'])) {
                $stmt = $this->db->prepare('SELECT name FROM customers WHERE id = ?');
                $stmt->execute([$payload['customerId']]);
                $customerName = $stmt->fetchColumn() ?: 'Pelanggan Umum';
            }
            $customerName = $customerName ?: 'Pelanggan Umum';

            $stmt = $this->db->prepare(
                'INSERT INTO transactions (user_id, cashier_name, customer_id, customer_name, subtotal, discount, tax, total, payment_method, cash_given, change_amount, table_number, order_type, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "paid")'
            );
            $stmt->execute([
                $cashier['id'], $cashier['name'], $payload['customerId'] ?? null, $customerName,
                $subtotal, $discount, $tax, $total, $payload['paymentMethod'], $cashGiven, $change,
                $payload['tableNumber'] ?: null, $payload['orderType'] ?? 'dine-in',
            ]);
            $txId = (int)$this->db->lastInsertId();

            $itemStmt = $this->db->prepare('INSERT INTO transaction_items (transaction_id, product_id, name, price, qty, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
            foreach ($lineItems as $li) {
                $itemStmt->execute([$txId, $li['productId'], $li['name'], $li['price'], $li['qty'], $li['subtotal']]);
                $product = $productRepo->find($li['productId']);
                $before = $product['stock'];
                $productRepo->adjustStock($li['productId'], -$li['qty']);
                $stockRepo->recordMutation([
                    'productId' => $li['productId'], 'productName' => $li['name'], 'type' => 'out', 'qty' => $li['qty'],
                    'reason' => 'Penjualan ' . Format::invoiceLabel($txId), 'stockBefore' => $before, 'stockAfter' => $before - $li['qty'],
                    'userId' => $cashier['id'], 'userName' => $cashier['name'],
                ]);
            }

            $this->db->commit();
            return $this->find($txId);
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function void(int $id, array $actor): array
    {
        $tx = $this->find($id);
        if (!$tx) throw new \RuntimeException('Transaksi tidak ditemukan');
        if ($tx['status'] === 'void') throw new \RuntimeException('Transaksi sudah dibatalkan sebelumnya');

        $productRepo = new MysqlProductRepository();
        $stockRepo = new MysqlStockRepository();

        $this->db->beginTransaction();
        try {
            $this->db->prepare("UPDATE transactions SET status='void', voided_at = NOW(), voided_by = ? WHERE id = ?")
                ->execute([$actor['name'], $id]);
            foreach ($tx['items'] as $it) {
                if (!$it['productId']) continue;
                $product = $productRepo->find($it['productId']);
                if (!$product) continue;
                $before = $product['stock'];
                $productRepo->adjustStock($it['productId'], $it['qty']);
                $stockRepo->recordMutation([
                    'productId' => $it['productId'], 'productName' => $it['name'], 'type' => 'in', 'qty' => $it['qty'],
                    'reason' => 'Pembatalan ' . Format::invoiceLabel($id), 'stockBefore' => $before, 'stockAfter' => $before + $it['qty'],
                    'userId' => $actor['id'], 'userName' => $actor['name'],
                ]);
            }
            $this->db->commit();
            return $this->find($id);
        } catch (\Throwable $e) { $this->db->rollBack(); throw $e; }
    }

    public function summarizePeriod(string $from, string $to): array
    {
        $stmt = $this->db->prepare("SELECT * FROM transactions WHERE status != 'void' AND DATE(created_at) >= ? AND DATE(created_at) <= ?");
        $stmt->execute([$from, $to]);
        $txs = $stmt->fetchAll();
        $totalRevenue = 0.0; $txIds = [];
        foreach ($txs as $t) { $totalRevenue += (float)$t['total']; $txIds[] = (int)$t['id']; }
        $totalTransactions = count($txs);
        $totalItemsSold = 0;
        if ($txIds) {
            $in = implode(',', array_fill(0, count($txIds), '?'));
            $stmt2 = $this->db->prepare("SELECT COALESCE(SUM(qty),0) AS s FROM transaction_items WHERE transaction_id IN ($in)");
            $stmt2->execute($txIds);
            $totalItemsSold = (int)$stmt2->fetch()['s'];
        }
        $avg = $totalTransactions ? (int)round($totalRevenue / $totalTransactions) : 0;
        return [
            'txs' => array_map([$this, 'shape'], $txs), 'txIds' => $txIds, 'totalRevenue' => $totalRevenue,
            'totalTransactions' => $totalTransactions, 'totalItemsSold' => $totalItemsSold, 'avgTransactionValue' => $avg,
        ];
    }
}
