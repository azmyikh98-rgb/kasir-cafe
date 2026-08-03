# Setup Google Sheets sebagai Database (Tahap Awal / Gratis)

Panduan ini untuk menjalankan Kasir Cafe dengan **Google Sheets** sebagai
database — cocok untuk demo, testing, atau volume transaksi rendah sebelum
pindah ke MySQL di Hostinger (lihat `documentation/migrasi-ke-mysql.md`).

**Penting:** di arsitektur ini, setiap "tabel" adalah **file Google
Spreadsheet-nya sendiri** — BUKAN tab di dalam satu file besar. Jadi Anda
akan membuat **10 file spreadsheet terpisah**: `users`, `categories`,
`customers`, `products`, `settings`, `transactions`, `transaction_items`,
`stock_mutations`, `returns`, `return_items`.

## 1. Buat 10 Spreadsheet Terpisah

Untuk masing-masing dari 10 nama di atas:

1. Buka [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Ganti nama file (klik judul di kiri atas) — bebas, tapi supaya tidak
   bingung sebaiknya samakan dengan nama tabelnya, mis. **"Kasir Cafe - users"**.
3. Di baris 1 (header), ketik kolom **persis sesuai urutan** berikut (satu
   kolom = satu sel: A1, B1, C1, dst). Nama TAB di bagian bawah (mis.
   "Sheet1") **boleh dibiarkan default**, tidak perlu diubah — aplikasi
   selalu membaca tab pertama di file itu.

   | File spreadsheet | Kolom (urutan harus sama persis) |
   |---|---|
   | `users` | id, username, password_hash, name, role, menu_access_override, created_at, deleted |
   | `categories` | id, name, color, deleted |
   | `customers` | id, name, phone, email, address, note, created_at, deleted |
   | `products` | id, name, category, price, stock, favorite, image, created_at, deleted |
   | `settings` | id, store_name, store_address, store_phone, receipt_footer, default_tax_percent, low_stock_threshold, menu_access, deleted |
   | `transactions` | id, user_id, cashier_name, customer_id, customer_name, subtotal, discount, tax, total, payment_method, cash_given, change_amount, table_number, order_type, status, voided_at, voided_by, created_at, deleted |
   | `transaction_items` | id, transaction_id, product_id, name, price, qty, subtotal, deleted |
   | `stock_mutations` | id, product_id, product_name, type, qty, reason, stock_before, stock_after, user_id, user_name, created_at, deleted |
   | `returns` | id, transaction_id, invoice_label, customer_name, refund_amount, reason, user_id, user_name, created_at, deleted |
   | `return_items` | id, return_id, product_id, name, price, qty, subtotal, deleted |

4. Untuk tiap file, salin **Spreadsheet ID**-nya dari URL address bar:
   `https://docs.google.com/spreadsheets/d/`**`INI_ID_NYA`**`/edit`
   → tempel sementara ke notepad, beri label sesuai nama filenya. Anda akan
   butuh 10 ID ini di Langkah 4.

### Isi data awal (wajib, supaya bisa login pertama kali)

Di file spreadsheet **`users`**, isi baris 2 dan 3. **Penting:** isi kolom
`password_hash` sesuai backend yang akan Anda pakai — dua backend ini punya
format hash yang berbeda (bukan salah satunya salah, memang sengaja beda
karena keterbatasan teknis masing-masing):

**Kalau pakai backend Google Apps Script** (untuk GitHub Pages — lihat
`deploy-github-pages.md`):

| id | username | password_hash | name | role | menu_access_override | created_at | deleted |
|---|---|---|---|---|---|---|---|
| 1 | admin | `5cb99da45e0d4519af16768254dec44a:841fcb36ddd6baebe881a14abe9da1945cd2f581e91c8b3259abfb253da29e09` | Administrator | admin | *(kosong)* | 2026-07-31T00:00:00.000Z | 0 |
| 2 | kasir1 | `0a41d32173854fea9e2ef3e91536106d:ea110091f6f357bcf2f780737cb8fceb40f2a2ec1fbd8ffb48caae91770275a7` | Kasir 1 | kasir | *(kosong)* | 2026-07-31T00:00:00.000Z | 0 |

**Kalau pakai backend PHP** (lokal / nanti pindah ke Hostinger dengan
`DATA_BACKEND = 'sheets'`):

| id | username | password_hash | name | role | menu_access_override | created_at | deleted |
|---|---|---|---|---|---|---|---|
| 1 | admin | `$2b$10$vwlQJofrkLwss6IVcrlrCuhapRdrpa5GejB47NUUwhdvEUUAjQl0G` | Administrator | admin | *(kosong)* | 2026-07-31T00:00:00.000Z | 0 |
| 2 | kasir1 | `$2b$10$yNICDZN9xe0jcE2Pq5Mxm.A.a4XXyDhdtNSe0uDNniGuKjS.00.ce` | Kasir 1 | kasir | *(kosong)* | 2026-07-31T00:00:00.000Z | 0 |

Kedua-duanya login dengan password yang sama: `admin123` (admin) dan
`kasir123` (kasir1) — **wajib
diganti** lewat menu Pengaturan setelah login pertama kali.

Di file spreadsheet **`categories`**, isi baris 2 (kategori default "Umum"
wajib ada — kategori lain yang dihapus otomatis dipindah ke sini):

| id | name | color | deleted |
|---|---|---|---|
| 1 | Umum | #64748B | 0 |

Di file spreadsheet **`settings`**, isi baris 2 (satu-satunya baris, `id` selalu 1):

| id | store_name | store_address | store_phone | receipt_footer | default_tax_percent | low_stock_threshold | menu_access | deleted |
|---|---|---|---|---|---|---|---|---|
| 1 | Kasir Cafe | | | Terima kasih atas kunjungan Anda! | 0 | 15 | | 0 |

File lainnya (`customers`, `products`, `transactions`, `transaction_items`,
`stock_mutations`, `returns`, `return_items`) **cukup header saja** —
biarkan kosong, nanti otomatis terisi lewat aplikasi.

## 2. Buat Service Account (akun robot untuk akses API)

Satu service account cukup untuk mengakses ke-10 file sekaligus.

1. Buka [Google Cloud Console](https://console.cloud.google.com/) → buat
   project baru (atau pakai yang sudah ada).
2. Aktifkan **Google Sheets API** (menu "APIs & Services" → "Enable APIs").
3. Buat **Service Account** ("APIs & Services" → "Credentials" → "Create
   Credentials" → "Service Account").
4. Setelah dibuat, buka service account itu → tab "Keys" → "Add Key" →
   "Create new key" → pilih **JSON** → file akan otomatis terunduh.
5. Simpan file JSON ini sebagai `backend/config/service-account.json`
   (**JANGAN** commit file ini ke Git — sudah ada di `.gitignore`).
6. Buka file JSON tersebut, salin nilai `client_email` (bentuknya seperti
   `nama-robot@nama-project.iam.gserviceaccount.com`).

## 3. Beri Akses Service Account ke SEMUA 10 File

Untuk **masing-masing** dari 10 spreadsheet di Langkah 1: buka filenya →
klik tombol **Share** → tempel email service account dari Langkah 2 →
pastikan role **Editor** → **Send** (boleh uncheck "Notify people").

Ya, ini harus diulang 10 kali (sekali per file) — kalau ada satu file yang
lupa di-share, fitur yang datanya ada di file itu akan gagal dengan error
403 dari Google.

## 4. Konfigurasi Aplikasi

Salin `backend/config/config.example.php` menjadi `backend/config/config.php`, lalu isi:

```php
define('DATA_BACKEND', 'sheets');

define('GOOGLE_SHEET_ID_USERS', 'ID_FILE_USERS');
define('GOOGLE_SHEET_ID_CATEGORIES', 'ID_FILE_CATEGORIES');
define('GOOGLE_SHEET_ID_CUSTOMERS', 'ID_FILE_CUSTOMERS');
define('GOOGLE_SHEET_ID_PRODUCTS', 'ID_FILE_PRODUCTS');
define('GOOGLE_SHEET_ID_SETTINGS', 'ID_FILE_SETTINGS');
define('GOOGLE_SHEET_ID_TRANSACTIONS', 'ID_FILE_TRANSACTIONS');
define('GOOGLE_SHEET_ID_TRANSACTION_ITEMS', 'ID_FILE_TRANSACTION_ITEMS');
define('GOOGLE_SHEET_ID_STOCK_MUTATIONS', 'ID_FILE_STOCK_MUTATIONS');
define('GOOGLE_SHEET_ID_RETURNS', 'ID_FILE_RETURNS');
define('GOOGLE_SHEET_ID_RETURN_ITEMS', 'ID_FILE_RETURN_ITEMS');

define('GOOGLE_SERVICE_ACCOUNT_JSON_PATH', __DIR__ . '/service-account.json');
```

## 5. Batasan Penting (baca sebelum pakai untuk produksi)

Google Sheets **bukan** database transaksional — dipakai di sini murni
supaya Anda bisa mulai tanpa biaya hosting/database. Beberapa batasan
yang perlu disadari:

- **Mengelola 10 file terpisah lebih merepotkan** dibanding 1 file — kalau
  suatu saat perlu audit manual data, Anda harus buka file satu per satu.
  Ini trade-off langsung dari permintaan "tiap tabel file sendiri".
- **Lebih lambat** dari MySQL, terutama saat data (terutama `transactions`
  dan `transaction_items`) sudah banyak — setiap baca menarik seluruh baris
  di file itu.
- **Hapus = soft delete** (baris ditandai `deleted`, bukan dihapus fisik),
  jadi tiap file akan terus bertambah baris seiring waktu.
- **Kuota Google Sheets API**: 300 request/menit **per project** (bukan per
  file) — karena satu request biasanya hanya menyentuh 1 file, kuota ini
  dihitung gabungan dari semua 10 file yang diakses lewat service account
  yang sama.
- Kolom `image` (foto produk, base64) dibatasi ~50.000 karakter oleh Google
  Sheets — kompresi gambar di frontend sudah menjaga ukuran tetap kecil,
  tapi foto beresolusi sangat tinggi tetap bisa gagal tersimpan.
- Tidak ada transaksi atomik lintas-file seperti MySQL — pada skenario
  gagal di tengah proses (mis. listrik/koneksi putus saat checkout), ada
  kemungkinan kecil data tidak 100% konsisten (mis. item transaksi tersimpan
  di file `transaction_items` tapi stok di file `products` belum sempat
  dikurangi). Untuk toko dengan transaksi tinggi, ini alasan kuat untuk
  pindah ke MySQL secepatnya.

**Rekomendasi:** pakai Sheets untuk demo/testing sampai siap deploy ke
Hostinger, lalu pindah ke MySQL (`DATA_BACKEND = 'mysql'`) begitu toko
mulai beroperasi sehari-hari. Karena kode ditulis dengan pola
repository/adapter, pindah backend **tidak perlu ubah kode frontend maupun
controller sama sekali** — cukup ganti nilai `DATA_BACKEND` dan isi kredensial
MySQL di `config.php`.
