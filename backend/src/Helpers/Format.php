<?php
namespace App\Helpers;

class Format
{
    const MENU_ACCESS_KEYS = ['dashboard', 'kasir', 'produk', 'kategori', 'pelanggan', 'transaksi', 'retur', 'stok', 'laporan'];

    public static function nowIso(): string
    {
        return gmdate('Y-m-d\TH:i:s.v\Z');
    }

    public static function invoiceLabel(int $txId): string
    {
        return 'INV-' . str_pad((string)$txId, 4, '0', STR_PAD_LEFT);
    }

    public static function defaultMenuAccess(): array
    {
        $out = [];
        foreach (self::MENU_ACCESS_KEYS as $k) $out[$k] = true;
        return $out;
    }

    public static function decodeMenuAccess(?string $raw): array
    {
        $default = self::defaultMenuAccess();
        if (!$raw) return $default;
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) return $default;
        foreach (self::MENU_ACCESS_KEYS as $k) {
            if (array_key_exists($k, $decoded)) $default[$k] = (bool)$decoded[$k];
        }
        return $default;
    }

    /** null = tidak ada override khusus, ikut pengaturan umum. */
    public static function decodeMenuAccessOverride(?string $raw): ?array
    {
        if (!$raw) return null;
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) return null;
        $out = [];
        foreach (self::MENU_ACCESS_KEYS as $k) {
            $out[$k] = array_key_exists($k, $decoded) ? (bool)$decoded[$k] : true;
        }
        return $out;
    }

    public static function encodeMenuAccessOverride($value): ?string
    {
        if ($value === null || !is_array($value)) return null;
        $normalized = [];
        foreach (self::MENU_ACCESS_KEYS as $k) {
            $normalized[$k] = array_key_exists($k, $value) ? (bool)$value[$k] : true;
        }
        return json_encode($normalized);
    }

    public static function pctChange(float $current, float $previous): float
    {
        if ($previous == 0.0) return $current == 0.0 ? 0.0 : 100.0;
        return round((($current - $previous) / $previous) * 1000) / 10;
    }
}
