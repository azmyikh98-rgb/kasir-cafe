<?php
namespace App\Repositories\Sheets;

use App\Helpers\Format;
use App\Repositories\Contracts\CustomerRepositoryInterface;

class SheetsCustomerRepository implements CustomerRepositoryInterface
{
    private SheetsTable $table;

    public function __construct()
    {
        $this->table = new SheetsTable(GOOGLE_SHEET_ID_CUSTOMERS, ['id', 'name', 'phone', 'email', 'address', 'note', 'created_at']);
    }

    private function withStats(array $row): array
    {
        $txRepo = new SheetsTransactionRepository();
        $stats = $txRepo->statsForCustomer((int)$row['id']);
        return [
            'id' => (int)$row['id'], 'name' => $row['name'], 'phone' => $row['phone'], 'email' => $row['email'],
            'address' => $row['address'], 'note' => $row['note'], 'createdAt' => $row['created_at'],
            'transactionCount' => $stats['count'], 'totalSpend' => $stats['spend'], 'lastVisit' => $stats['lastVisit'],
        ];
    }

    public function all(string $search = ''): array
    {
        $rows = $this->table->readAll();
        if ($search) {
            $s = mb_strtolower($search);
            $rows = array_filter($rows, fn($r) => str_contains(mb_strtolower($r['name']), $s) || str_contains($r['phone'], $search));
        }
        return array_values(array_map([$this, 'withStats'], $rows));
    }

    public function find(int $id): ?array
    {
        $row = $this->table->findById($id);
        return $row ? $this->withStats($row) : null;
    }

    public function create(array $data): array
    {
        $row = $this->table->insert([
            'name' => $data['name'], 'phone' => $data['phone'] ?? '', 'email' => $data['email'] ?? '',
            'address' => $data['address'] ?? '', 'note' => $data['note'] ?? '', 'created_at' => Format::nowIso(),
        ]);
        return $this->withStats($row);
    }

    public function update(int $id, array $data): array
    {
        $row = $this->table->update($id, array_intersect_key($data, array_flip(['name', 'phone', 'email', 'address', 'note'])));
        return $this->withStats($row);
    }

    public function delete(int $id): void { $this->table->softDelete($id); }
}
