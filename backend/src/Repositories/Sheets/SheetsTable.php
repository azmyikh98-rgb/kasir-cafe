<?php
namespace App\Repositories\Sheets;

/**
 * Membungkus SATU FILE Google Spreadsheet sebagai "tabel" sederhana:
 * setiap tabel (users, categories, products, dst) adalah FILE spreadsheet-nya
 * SENDIRI — bukan tab di dalam satu file besar. Baris 1 di tab pertama
 * file itu = header, baris berikutnya = data.
 *
 * Karena setiap file hanya berisi satu tabel, range dibaca TANPA prefix
 * nama tab (mis. "A2:Z100000", bukan "users!A2:Z100000") — Google Sheets
 * API otomatis mengarah ke tab pertama kalau nama tab tidak disebutkan,
 * jadi tab boleh dinamai apa saja.
 *
 * Catatan desain penting (baca sebelum menambah tabel baru):
 * - "Hapus" di sini adalah SOFT DELETE (kolom `deleted` diisi "1"), bukan
 *   menghapus baris fisik. Ini sengaja: menghapus baris fisik di Sheets API
 *   butuh batchUpdate + deleteDimension yang berisiko salah index kalau ada
 *   penulisan bersamaan dari kasir lain. Trade-off: sheet akan terus
 *   bertambah baris seiring waktu -> untuk toko dengan volume transaksi
 *   tinggi, ini salah satu alasan kuat untuk pindah ke MySQL (lihat README).
 * - Setiap readAll() menarik SELURUH baris tabel (tidak ada index/WHERE di
 *   sisi server seperti SQL) -> filter/sort dilakukan di PHP. Untuk tabel
 *   yang tumbuh besar (transactions, transaction_items) ini akan melambat;
 *   itulah kenapa docs menyarankan migrasi ke MySQL begitu volume naik.
 */
class SheetsTable
{
    private SheetsClient $client;
    private array $columns; // urutan kolom persis seperti di header row

    public function __construct(string $spreadsheetId, array $columns)
    {
        $this->client = new SheetsClient($spreadsheetId);
        $this->columns = $columns; // TIDAK termasuk kolom 'deleted' -> ditambahkan otomatis
        if (!in_array('deleted', $this->columns, true)) $this->columns[] = 'deleted';
    }

    private function colLetter(int $index): string
    {
        $letters = '';
        $index++;
        while ($index > 0) {
            $mod = ($index - 1) % 26;
            $letters = chr(65 + $mod) . $letters;
            $index = intdiv($index - 1, 26);
        }
        return $letters;
    }

    private function rowToAssoc(array $row, int $sheetRowNum): array
    {
        $assoc = ['_row' => $sheetRowNum];
        foreach ($this->columns as $i => $col) {
            $assoc[$col] = $row[$i] ?? '';
        }
        return $assoc;
    }

    private function assocToRow(array $assoc): array
    {
        return array_map(fn($col) => $assoc[$col] ?? '', $this->columns);
    }

    /** @return array daftar baris (assoc), tidak termasuk yang soft-deleted */
    public function readAll(bool $includeDeleted = false): array
    {
        $lastCol = $this->colLetter(count($this->columns) - 1);
        $raw = $this->client->getValues("A2:{$lastCol}100000");
        $out = [];
        foreach ($raw as $i => $row) {
            if (!array_filter($row, fn($v) => $v !== '')) continue; // baris kosong dilewati
            $assoc = $this->rowToAssoc($row, $i + 2);
            if (!$includeDeleted && $assoc['deleted'] === '1') continue;
            $out[] = $assoc;
        }
        return $out;
    }

    public function findById($id): ?array
    {
        foreach ($this->readAll() as $row) {
            if ((string)$row['id'] === (string)$id) return $row;
        }
        return null;
    }

    private function nextId(): int
    {
        $max = 0;
        foreach ($this->readAll(true) as $row) {
            $max = max($max, (int)$row['id']);
        }
        return $max + 1;
    }

    public function insert(array $data): array
    {
        $data['id'] = $data['id'] ?? $this->nextId();
        $data['deleted'] = $data['deleted'] ?? '0';
        $row = $this->assocToRow($data);
        $lastCol = $this->colLetter(count($this->columns) - 1);
        $this->client->appendValues("A:{$lastCol}", [$row]);
        return $data;
    }

    public function update($id, array $changes): ?array
    {
        $existing = $this->findById($id);
        if (!$existing) return null;
        $merged = array_merge($existing, $changes);
        $row = $this->assocToRow($merged);
        $lastCol = $this->colLetter(count($this->columns) - 1);
        $this->client->updateValues("A{$existing['_row']}:{$lastCol}{$existing['_row']}", [$row]);
        unset($merged['_row']);
        return $merged;
    }

    public function softDelete($id): void
    {
        $this->update($id, ['deleted' => '1']);
    }
}
