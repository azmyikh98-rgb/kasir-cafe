<?php
namespace App\Repositories\Sheets;

use App\Helpers\Format;
use App\Repositories\Contracts\ReturnRepositoryInterface;

class SheetsReturnRepository implements ReturnRepositoryInterface
{
    private SheetsTable $table;
    private SheetsTable $itemsTable;

    public function __construct()
    {
        $this->table = new SheetsTable(GOOGLE_SHEET_ID_RETURNS, ['id', 'transaction_id', 'invoice_label', 'customer_name', 'refund_amount', 'reason', 'user_id', 'user_name', 'created_at']);
        $this->itemsTable = new SheetsTable(GOOGLE_SHEET_ID_RETURN_ITEMS, ['id', 'return_id', 'product_id', 'name', 'price', 'qty', 'subtotal']);
    }

    /** Dipakai oleh SheetsTransactionRepository untuk menghitung sisa qty yang bisa diretur. */
    public function itemsForTransaction(int $txId): array
    {
        $returnIds = array_map(fn($r) => (int)$r['id'], array_filter($this->table->readAll(), fn($r) => (int)$r['transaction_id'] === $txId));
        $items = array_filter($this->itemsTable->readAll(), fn($r) => in_array((int)$r['return_id'], $returnIds, true));
        return array_map(fn($r) => ['productId' => (int)$r['product_id'], 'qty' => (int)$r['qty']], array_values($items));
    }

    private function shape(array $row): array
    {
        $items = array_values(array_filter($this->itemsTable->readAll(), fn($r) => (int)$r['return_id'] === (int)$row['id']));
        $items = array_map(fn($r) => [
            'productId' => $r['product_id'] !== '' ? (int)$r['product_id'] : null, 'name' => $r['name'],
            'price' => (float)$r['price'], 'qty' => (int)$r['qty'], 'subtotal' => (float)$r['subtotal'],
        ], $items);
        return [
            'id' => (int)$row['id'], 'transactionId' => (int)$row['transaction_id'], 'invoiceLabel' => $row['invoice_label'],
            'customerName' => $row['customer_name'], 'refundAmount' => (float)$row['refund_amount'], 'reason' => $row['reason'],
            'userId' => $row['user_id'] !== '' ? (int)$row['user_id'] : null, 'userName' => $row['user_name'],
            'items' => $items, 'createdAt' => $row['created_at'],
        ];
    }

    public function all(): array
    {
        $rows = array_map([$this, 'shape'], $this->table->readAll());
        usort($rows, fn($a, $b) => $b['createdAt'] <=> $a['createdAt']);
        return $rows;
    }

    public function create(array $data): array
    {
        $txRepo = new SheetsTransactionRepository();
        $productRepo = new SheetsProductRepository();
        $stockRepo = new SheetsStockRepository();

        $tx = $txRepo->find((int)$data['transactionId']);
        if (!$tx) throw new \RuntimeException('Transaksi tidak ditemukan');
        $returnable = $txRepo->returnableItems($tx['id']);
        $returnableMap = [];
        foreach ($returnable['items'] as $it) $returnableMap[$it['productId']] = $it;

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
        $returnRow = $this->table->insert([
            'transaction_id' => $tx['id'], 'invoice_label' => Format::invoiceLabel($tx['id']), 'customer_name' => $tx['customerName'],
            'refund_amount' => $refundAmount, 'reason' => $data['reason'] ?? 'Tidak disebutkan',
            'user_id' => $actor['id'], 'user_name' => $actor['name'], 'created_at' => Format::nowIso(),
        ]);
        $returnId = (int)$returnRow['id'];

        foreach ($lineItems as $li) {
            $this->itemsTable->insert([
                'return_id' => $returnId, 'product_id' => $li['productId'], 'name' => $li['name'],
                'price' => $li['price'], 'qty' => $li['qty'], 'subtotal' => $li['subtotal'],
            ]);
            $product = $productRepo->find($li['productId']);
            $before = $product ? $product['stock'] : 0;
            $productRepo->adjustStock($li['productId'], $li['qty']);
            $stockRepo->recordMutation([
                'productId' => $li['productId'], 'productName' => $li['name'], 'type' => 'in', 'qty' => $li['qty'],
                'reason' => 'Retur ' . Format::invoiceLabel($tx['id']), 'stockBefore' => $before, 'stockAfter' => $before + $li['qty'],
                'userId' => $actor['id'], 'userName' => $actor['name'],
            ]);
        }

        $row = $this->table->findById($returnId);
        return $this->shape($row);
    }
}
