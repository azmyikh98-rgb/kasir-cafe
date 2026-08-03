<?php
// ============================================================
// Konfigurasi aplikasi. SALIN file ini menjadi "config.php" lalu
// isi nilai-nilai di bawah. Jangan commit "config.php" (sudah
// ada di .gitignore) — hanya file .example ini yang masuk Git.
// ============================================================

// 'mysql' atau 'sheets'. Mulai dengan 'sheets' untuk demo gratis di
// GitHub/testing, lalu ganti ke 'mysql' saat pindah ke Hostinger.
define('DATA_BACKEND', 'sheets');

// ---------- MySQL (dipakai kalau DATA_BACKEND = 'mysql') ----------
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_kasir');
define('DB_USER', 'u123456789_admin');
define('DB_PASS', 'GANTI_PASSWORD_INI');

// ---------- Google Sheets (dipakai kalau DATA_BACKEND = 'sheets') ----------
// Setiap "tabel" adalah FILE spreadsheet-nya SENDIRI (bukan tab dalam satu
// file). Buat 10 spreadsheet terpisah lalu isi ID masing-masing di bawah.
// Lihat docs/google-sheets-setup.md untuk cara membuat spreadsheet-nya,
// service account, dan mendapatkan file JSON credential-nya.
define('GOOGLE_SHEET_ID_USERS', 'GANTI_DENGAN_ID_SPREADSHEET_USERS');
define('GOOGLE_SHEET_ID_CATEGORIES', 'GANTI_DENGAN_ID_SPREADSHEET_CATEGORIES');
define('GOOGLE_SHEET_ID_CUSTOMERS', 'GANTI_DENGAN_ID_SPREADSHEET_CUSTOMERS');
define('GOOGLE_SHEET_ID_PRODUCTS', 'GANTI_DENGAN_ID_SPREADSHEET_PRODUCTS');
define('GOOGLE_SHEET_ID_SETTINGS', 'GANTI_DENGAN_ID_SPREADSHEET_SETTINGS');
define('GOOGLE_SHEET_ID_TRANSACTIONS', 'GANTI_DENGAN_ID_SPREADSHEET_TRANSACTIONS');
define('GOOGLE_SHEET_ID_TRANSACTION_ITEMS', 'GANTI_DENGAN_ID_SPREADSHEET_TRANSACTION_ITEMS');
define('GOOGLE_SHEET_ID_STOCK_MUTATIONS', 'GANTI_DENGAN_ID_SPREADSHEET_STOCK_MUTATIONS');
define('GOOGLE_SHEET_ID_RETURNS', 'GANTI_DENGAN_ID_SPREADSHEET_RETURNS');
define('GOOGLE_SHEET_ID_RETURN_ITEMS', 'GANTI_DENGAN_ID_SPREADSHEET_RETURN_ITEMS');
// Satu service account yang sama dipakai untuk akses ke semua 10 file di atas
// (tiap file di-share ke email service account ini secara terpisah).
define('GOOGLE_SERVICE_ACCOUNT_JSON_PATH', __DIR__ . '/service-account.json');

// ---------- Umum ----------
define('SESSION_SECRET', 'kasir-app-secret-ganti-ini-di-produksi');
define('LOW_STOCK_THRESHOLD_DEFAULT', 15);
