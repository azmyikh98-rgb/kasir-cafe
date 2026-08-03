<?php
namespace App\Repositories\Sheets;

use App\Helpers\Format;
use App\Repositories\Contracts\StockRepositoryInterface;

class SheetsStockRepository implements StockRepositoryInterface
{
    private SheetsTable $table;

    public function __construct()
    {
        $this->table = new SheetsTable(GOOGLE_SHEET_ID_STOCK_MUTATIONS, [
            'id', 'product_id', 'product_name', 'type', 'qty', 'reason', 'stock_before', 'stock_after', 'user_id', 'user_name', 'created_at',
        ]);
    }

    private function shape(array $row): array
    {
        return [
            'id' => (int)$row['id'], 'productId' => $row['product_id'] !== '' ? (int)$row['product_id'] : null,
            'productName' => $row['product_name'], 'type' => $row['type'], 'qty' => (int)$row['qty'],
            'reason' => $row['reason'], 'stockBefore' => (int)$row['stock_before'], 'stockAfter' => (int)$row['stock_after'],
            'userId' => $row['user_id'] !== '' ? (int)$row['user_id'] : null, 'userName' => $row['user_name'],
            'createdAt' => $row['created_at'],
        ];
    }

    public function mutations(): array
    {
        $rows = array_map([$this, 'shape'], $this->table->readAll());
        usort($rows, fn($a, $b) => $b['createdAt'] <=> $a['createdAt']);
        return array_slice($rows, 0, 300);
    }

    public function recordMutation(array $data): array
    {
        $row = $this->table->insert([
            'product_id' => $data['productId'], 'product_name' => $data['productName'], 'type' => $data['type'],
            'qty' => $data['qty'], 'reason' => $data['reason'], 'stock_before' => $data['stockBefore'],
            'stock_after' => $data['stockAfter'], 'user_id' => $data['userId'], 'user_name' => $data['userName'],
            'created_at' => Format::nowIso(),
        ]);
        return $this->shape($row);
    }
}
