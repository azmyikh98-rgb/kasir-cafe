# Migrasi dari Google Sheets ke MySQL (Hostinger)

Saat toko sudah siap jalan sehari-hari (atau transaksi mulai banyak),
pindahkan backend ke MySQL:

## 1. Buat Database di Hostinger

1. Login ke hPanel Hostinger → **Databases** → **MySQL Databases** → buat
   database baru. Catat: nama database, username, password (host biasanya
   `localhost`).
2. Buka **phpMyAdmin** dari hPanel → pilih database yang baru dibuat.
3. Tab **Import** → pilih file `database/kasir-cafe-schema-hostinger.sql` →
   klik **Go**. Ini akan membuat semua tabel + data contoh (2 user, produk
   contoh, dst).

## 2. Ubah Konfigurasi

Di `backend/config/config.php`:

```php
define('DATA_BACKEND', 'mysql');
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_kasir');
define('DB_USER', 'u123456789_admin');
define('DB_PASS', 'password_asli_anda');
```

Tidak ada perubahan kode apa pun yang diperlukan — controller dan frontend
memanggil repository lewat `RepositoryFactory`, yang otomatis memilih
implementasi MySQL begitu `DATA_BACKEND` diubah.

## 3. (Opsional) Pindahkan Data yang Sudah Ada di Sheets

Aplikasi ini tidak menyertakan tool migrasi data otomatis Sheets → MySQL,
karena kebutuhan tiap toko biasanya beda (mis. apakah retur lama perlu
dibawa, atau mulai bersih). Cara paling aman untuk pindahan manual:

1. Export tiap sheet ke CSV (File → Download → CSV di Google Sheets).
2. Di phpMyAdmin, gunakan fitur **Import** per tabel, sesuaikan nama
   kolom CSV dengan nama kolom tabel MySQL (lihat
   `database/kasir-cafe-schema-hostinger.sql` untuk nama kolom persis).
3. Untuk toko baru tanpa data lama, cukup pakai data contoh (seed) yang
   sudah ada di file schema — lalu ganti password `admin`/`kasir1` segera
   setelah deploy.

## 4. Upload ke Hostinger

1. Build frontend: `cd frontend && npm install && npm run build` →
   hasilnya ada di `frontend/dist/`.
2. Lewat **File Manager** hPanel atau FTP, upload ke `public_html/`:
   - Semua isi `frontend/dist/` (index.html, login.html, assets/) → taruh
     langsung di root `public_html/`.
   - Seluruh folder `backend/` → taruh sebagai `public_html/backend/`.
   - File `.htaccess` (dari root project ini) → taruh di `public_html/.htaccess`.
3. Pastikan `backend/config/config.php` (bukan `.example.php`) sudah berisi
   kredensial MySQL asli, dan **tidak** ikut ter-commit ke repo publik.
4. Buka `https://domainanda.com/login.html` — login dengan salah satu akun
   contoh dari schema (`admin` / `admin123` atau `kasir1` / `kasir123`),
   lalu **segera ganti password** lewat menu Pengaturan → Keamanan.
