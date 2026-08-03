<?php
namespace App\Repositories\Sheets;

use App\Helpers\Format;
use App\Repositories\Contracts\SettingsRepositoryInterface;

class SheetsSettingsRepository implements SettingsRepositoryInterface
{
    private SheetsTable $table;

    public function __construct()
    {
        $this->table = new SheetsTable(GOOGLE_SHEET_ID_SETTINGS, [
            'id', 'store_name', 'store_address', 'store_phone', 'receipt_footer',
            'default_tax_percent', 'low_stock_threshold', 'menu_access',
        ]);
    }

    private function shape(array $row): array
    {
        return [
            'storeName' => $row['store_name'] ?: 'Kasir Cafe', 'storeAddress' => $row['store_address'],
            'storePhone' => $row['store_phone'], 'receiptFooter' => $row['receipt_footer'] ?: 'Terima kasih atas kunjungan Anda!',
            'defaultTaxPercent' => (float)($row['default_tax_percent'] ?: 0),
            'lowStockThreshold' => (int)($row['low_stock_threshold'] ?: LOW_STOCK_THRESHOLD_DEFAULT),
            'menuAccess' => Format::decodeMenuAccess($row['menu_access'] ?: null),
        ];
    }

    public function get(): array
    {
        $row = $this->table->findById(1);
        if (!$row) {
            $row = $this->table->insert([
                'id' => 1, 'store_name' => 'Kasir Cafe', 'store_address' => '', 'store_phone' => '',
                'receipt_footer' => 'Terima kasih atas kunjungan Anda!', 'default_tax_percent' => 0,
                'low_stock_threshold' => LOW_STOCK_THRESHOLD_DEFAULT, 'menu_access' => json_encode(Format::defaultMenuAccess()),
            ]);
        }
        return $this->shape($row);
    }

    public function update(array $data): array
    {
        $changes = [];
        $map = ['storeName' => 'store_name', 'storeAddress' => 'store_address', 'storePhone' => 'store_phone', 'receiptFooter' => 'receipt_footer', 'defaultTaxPercent' => 'default_tax_percent', 'lowStockThreshold' => 'low_stock_threshold'];
        foreach ($map as $k => $col) if (array_key_exists($k, $data)) $changes[$col] = $data[$k];
        if (array_key_exists('menuAccess', $data)) {
            $current = $this->get();
            $changes['menu_access'] = json_encode(array_merge($current['menuAccess'], $data['menuAccess']));
        }
        if ($changes) $this->table->update(1, $changes);
        return $this->get();
    }

    public function lowStockThreshold(): int { return $this->get()['lowStockThreshold']; }
}
