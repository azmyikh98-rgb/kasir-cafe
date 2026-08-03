<?php
namespace App\Repositories\Mysql;

use App\Helpers\Format;
use App\Repositories\Contracts\SettingsRepositoryInterface;
use PDO;

class MysqlSettingsRepository implements SettingsRepositoryInterface
{
    private PDO $db;

    public function __construct() { $this->db = MysqlConnection::get(); }

    private function shape(array $row): array
    {
        return [
            'storeName' => $row['store_name'],
            'storeAddress' => $row['store_address'],
            'storePhone' => $row['store_phone'],
            'receiptFooter' => $row['receipt_footer'],
            'defaultTaxPercent' => (float)$row['default_tax_percent'],
            'lowStockThreshold' => (int)$row['low_stock_threshold'],
            'menuAccess' => Format::decodeMenuAccess($row['menu_access'] ?? null),
        ];
    }

    public function get(): array
    {
        $row = $this->db->query('SELECT * FROM settings WHERE id = 1')->fetch();
        if (!$row) {
            $this->db->exec("INSERT INTO settings (id) VALUES (1)");
            $row = $this->db->query('SELECT * FROM settings WHERE id = 1')->fetch();
        }
        return $this->shape($row);
    }

    public function update(array $data): array
    {
        $map = [
            'storeName' => 'store_name', 'storeAddress' => 'store_address', 'storePhone' => 'store_phone',
            'receiptFooter' => 'receipt_footer', 'defaultTaxPercent' => 'default_tax_percent',
            'lowStockThreshold' => 'low_stock_threshold',
        ];
        $fields = []; $params = [];
        foreach ($map as $key => $col) {
            if (array_key_exists($key, $data)) { $fields[] = "$col = ?"; $params[] = $data[$key]; }
        }
        if (array_key_exists('menuAccess', $data)) {
            $current = $this->get();
            $merged = array_merge($current['menuAccess'], $data['menuAccess']);
            $fields[] = 'menu_access = ?';
            $params[] = json_encode($merged);
        }
        if ($fields) {
            $this->db->prepare('UPDATE settings SET ' . implode(', ', $fields) . ' WHERE id = 1')->execute($params);
        }
        return $this->get();
    }

    public function lowStockThreshold(): int
    {
        return $this->get()['lowStockThreshold'];
    }
}
