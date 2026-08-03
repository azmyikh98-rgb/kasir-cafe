<?php
namespace App\Repositories\Sheets;

use App\Helpers\Format;
use App\Repositories\Contracts\TransactionRepositoryInterface;

class SheetsTransactionRepository implements TransactionRepositoryInterface
{
    private SheetsTable $txTable;
    private SheetsTable $itemsTable;

    public function __construct()
    {
        $this->txTable = new SheetsTable(GOOGLE_SHEET_ID_TRANSACTIONS, [
            'id', 'user_id', 'cashier_name', 'customer_id', 'customer_name', 'subtotal', 'discount', 'tax', 'total',
            'payment_method', 'cash_given', 'change_amount', 'table_number', 'order_type', 'status', 'voided_at', 'voided_by', 'created_at',
        ]);
        $this->itemsTable = new SheetsTable(GOOGLE_SHEET_ID_TRANSACTION_ITEMS, ['id', 'transaction_id', 'product_id', 'name', 'price', 'qty', 'subtotal']);
    }

    private function itemsFor(int $txId): array
    {
        $items = array_values(array_filter($this->itemsTable->readAll(), fn($r) => (int)$r['transaction_id'] === $txId));
        return array_map(fn($r) => [
            'productId' => $r['product_id'] !== '' ? (int)$r['product_id'] : null, 'name' => $r['name'],
            'price' => (float)$r['price'], 'qty' => (int)$r['qty'], 'subtotal' => (float)$r['subtotal'],
        ], $items);
    }

    private function shape(array $row): array
    {
        return [
            'id' => (int)$row['id'], 'userId' => $row['user_id'] !== '' ? (int)$row['user_id'] : null,
            'cashierName' => $row['cashier_name'], 'customerId' => $row['customer_id'] !== '' ? (int)$row['customer_id'] : null,
            'customerName' => $row['customer_name'], 'items' => $this->itemsFor((int)$row['id']),
            'subtotal' => (float)$row['subtotal'], 'discount' => (float)$row['discount'], 'tax' => (float)$row['tax'],
            'total' => (float)$row['total'], 'paymentMethod' => $row['payment_method'], 'cashGiven' => (float)$row['cash_given'],
            'change' => (float)$row['change_amount'], 'tableNumber' => $row['table_number'] ?: null, 'orderType' => $row['order_type'],
            'status' => $row['status'], 'voidedAt' => $row['voided_at'] ?: null, 'voidedBy' => $row['voided_by'] ?: null,
            'createdAt' => $row['created_at'],
        ];
    }

    public function find(int $id): ?array
    {
        $row = $this->txTable->findById($id);
        return $row ? $this->shape($row) : null;
    }

    public function search(array $filters, string $sortBy, string $sortDir, int $page, int $pageSize): array
    {
        $rows = array_map([$this, 'shape'], $this->txTable->readAll());

        if (!empty($filters['search'])) {
            $s = mb_strtolower($filters['search']);
            $rows = array_values(array_filter($rows, fn($t) =>
                str_contains((string)$t['id'], $filters['search']) ||
                str_contains(mb_strtolower($t['cashierName']), $s) ||
                str_contains(mb_strtolower($t['customerName'] ?? ''), $s)
            ));
        }
        if (!empty($filters['from'])) $rows = array_values(array_filter($rows, fn($t) => substr($t['createdAt'], 0, 10) >= $filters['from']));
        if (!empty($filters['to'])) $rows = array_values(array_filter($rows, fn($t) => substr($t['createdAt'], 0, 10) <= $filters['to']));
        if (!empty($filters['paymentMethod'])) $rows = array_values(array_filter($rows, fn($t) => $t['paymentMethod'] === $filters['paymentMethod']));
        if (!empty($filters['status'])) $rows = array_values(array_filter($rows, fn($t) => $t['status'] === $filters['status']));

        $sortKeyMap = ['id' => 'id', 'createdAt' => 'createdAt', 'total' => 'total', 'itemCount' => 'id'];
        $key = $sortKeyMap[$sortBy] ?? 'createdAt';
        usort($rows, fn($a, $b) => $sortDir === 'asc' ? ($a[$key] <=> $b[$key]) : ($b[$key] <=> $a[$key]));

        $total = count($rows);
        $offset = max(0, ($page - 1) * $pageSize);
        $pageRows = array_slice($rows, $offset, $pageSize);

        return ['data' => $pageRows, 'total' => $total, 'page' => $page, 'pageSize' => $pageSize, 'totalPages' => max(1, (int)ceil($total / max(1, $pageSize)))];
    }

    private function returnedQtyMap(int $txId): array
    {
        $returnRepo = new SheetsReturnRepository();
        $map = [];
        foreach ($returnRepo->itemsForTransaction($txId) as $it) {
            $map[$it['productId']] = ($map[$it['productId']] ?? 0) + $it['qty'];
        }
        return $map;
    }

    private function withReturnInfo(array $tx): array
    {
        $returnedMap = $this->returnedQtyMap($tx['id']);
        foreach ($tx['items'] as &$it) {
            $already = $returnedMap[$it['productId']] ?? 0;
            $it['returnedQty'] = $already;
            $it['remainingQty'] = $it['qty'] - $already;
        }
        return $tx;
    }

    public function returnableItems(int $id): array
    {
        $tx = $this->find($id);
        return $tx ? $this->withReturnInfo($tx) : [];
    }

    public function lookup(string $query): array
    {
        $needle = preg_replace('/^INV-0*/i', '', $query);
        $s = mb_strtolower($query);
        $matches = array_filter(array_map([$this, 'shape'], $this->txTable->readAll()), fn($t) =>
            $t['status'] !== 'void' && (
                str_contains((string)$t['id'], $needle) ||
                str_contains(mb_strtolower($t['customerName'] ?? ''), $s) ||
                str_contains(mb_strtolower($t['cashierName']), $s)
            )
        );
        $matches = array_slice($matches, 0, 20);
        return array_map(fn($t) => $this->withReturnInfo($t), array_values($matches));
    }

    public function create(array $payload, array $cashier): array
    {
        $productRepo = new SheetsProductRepository();
        $stockRepo = new SheetsStockRepository();

        $subtotal = 0.0; $lineItems = [];
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
            $customerRepo = new SheetsCustomerRepository();
            $c = $customerRepo->find((int)$payload['customerId']);
            $customerName = $c ? $c['name'] : 'Pelanggan Umum';
        }
        $customerName = $customerName ?: 'Pelanggan Umum';

        $txRow = $this->txTable->insert([
            'user_id' => $cashier['id'], 'cashier_name' => $cashier['name'],
            'customer_id' => $payload['customerId'] ?? '', 'customer_name' => $customerName,
            'subtotal' => $subtotal, 'discount' => $discount, 'tax' => $tax, 'total' => $total,
            'payment_method' => $payload['paymentMethod'], 'cash_given' => $cashGiven, 'change_amount' => $change,
            'table_number' => $payload['tableNumber'] ?: '', 'order_type' => $payload['orderType'] ?? 'dine-in',
            'status' => 'paid', 'voided_at' => '', 'voided_by' => '', 'created_at' => Format::nowIso(),
        ]);
        $txId = (int)$txRow['id'];

        foreach ($lineItems as $li) {
            $this->itemsTable->insert([
                'transaction_id' => $txId, 'product_id' => $li['productId'], 'name' => $li['name'],
                'price' => $li['price'], 'qty' => $li['qty'], 'subtotal' => $li['subtotal'],
            ]);
            $before = $productRepo->find($li['productId'])['stock'];
            $productRepo->adjustStock($li['productId'], -$li['qty']);
            $stockRepo->recordMutation([
                'productId' => $li['productId'], 'productName' => $li['name'], 'type' => 'out', 'qty' => $li['qty'],
                'reason' => 'Penjualan ' . Format::invoiceLabel($txId), 'stockBefore' => $before, 'stockAfter' => $before - $li['qty'],
                'userId' => $cashier['id'], 'userName' => $cashier['name'],
            ]);
        }

        return $this->find($txId);
    }

    public function void(int $id, array $actor): array
    {
        $tx = $this->find($id);
        if (!$tx) throw new \RuntimeException('Transaksi tidak ditemukan');
        if ($tx['status'] === 'void') throw new \RuntimeException('Transaksi sudah dibatalkan sebelumnya');

        $productRepo = new SheetsProductRepository();
        $stockRepo = new SheetsStockRepository();

        $this->txTable->update($id, ['status' => 'void', 'voided_at' => Format::nowIso(), 'voided_by' => $actor['name']]);
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
        return $this->find($id);
    }

    public function summarizePeriod(string $from, string $to): array
    {
        $all = array_map([$this, 'shape'], $this->txTable->readAll());
        $txs = array_values(array_filter($all, fn($t) => $t['status'] !== 'void' && substr($t['createdAt'], 0, 10) >= $from && substr($t['createdAt'], 0, 10) <= $to));
        $totalRevenue = array_sum(array_map(fn($t) => $t['total'], $txs));
        $totalTransactions = count($txs);
        $totalItemsSold = array_sum(array_map(fn($t) => array_sum(array_map(fn($it) => $it['qty'], $t['items'])), $txs));
        $avg = $totalTransactions ? (int)round($totalRevenue / $totalTransactions) : 0;
        return [
            'txs' => $txs, 'txIds' => array_map(fn($t) => $t['id'], $txs), 'totalRevenue' => $totalRevenue,
            'totalTransactions' => $totalTransactions, 'totalItemsSold' => $totalItemsSold, 'avgTransactionValue' => $avg,
        ];
    }

    /** Dipakai oleh SheetsCustomerRepository untuk statistik pelanggan. */
    public function statsForCustomer(int $customerId): array
    {
        $all = array_map([$this, 'shape'], $this->txTable->readAll());
        $mine = array_values(array_filter($all, fn($t) => $t['customerId'] === $customerId && $t['status'] !== 'void'));
        $lastVisit = null;
        foreach ($mine as $t) { if ($lastVisit === null || $t['createdAt'] > $lastVisit) $lastVisit = $t['createdAt']; }
        return ['count' => count($mine), 'spend' => array_sum(array_map(fn($t) => $t['total'], $mine)), 'lastVisit' => $lastVisit];
    }
}
