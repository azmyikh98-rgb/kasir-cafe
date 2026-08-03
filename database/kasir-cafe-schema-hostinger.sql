-- ============================================================
-- Kasir Cafe — MySQL / MariaDB Schema untuk Hostinger
-- ============================================================
-- Cara pakai:
-- 1. Login ke hPanel Hostinger -> Databases -> buat database MySQL baru
--    (catat: nama database, username, password, host — biasanya "localhost").
-- 2. Buka phpMyAdmin dari hPanel, pilih database yang baru dibuat.
-- 3. Tab "Import" -> pilih file ini -> klik "Go".
-- Struktur ini menormalkan data yang sebelumnya disimpan di data/db.json
-- menjadi tabel-tabel relasional standar (InnoDB + utf8mb4).
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  role          ENUM('admin','kasir') NOT NULL DEFAULT 'kasir',
  menu_access_override JSON NULL, -- akses menu khusus per user (kosong = ikut pengaturan umum)
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- CATEGORIES ----------
CREATE TABLE IF NOT EXISTS categories (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(9)   NOT NULL DEFAULT '#2563EB'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- CUSTOMERS ----------
CREATE TABLE IF NOT EXISTS customers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  phone      VARCHAR(30)  NOT NULL DEFAULT '',
  email      VARCHAR(150) NOT NULL DEFAULT '',
  address    VARCHAR(255) NOT NULL DEFAULT '',
  note       VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customers_name (name),
  INDEX idx_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- PRODUCTS ----------
CREATE TABLE IF NOT EXISTS products (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  category   VARCHAR(100) NOT NULL DEFAULT 'Umum',
  price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock      INT NOT NULL DEFAULT 0,
  favorite   TINYINT(1) NOT NULL DEFAULT 0,
  image      LONGTEXT NULL,            -- base64 data URL (hasil kompresi di sisi frontend)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_name (name),
  INDEX idx_products_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- SETTINGS (single row, id selalu 1) ----------
CREATE TABLE IF NOT EXISTS settings (
  id                    TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  store_name            VARCHAR(150) NOT NULL DEFAULT 'Kasir Cafe',
  store_address         VARCHAR(255) NOT NULL DEFAULT '',
  store_phone           VARCHAR(30)  NOT NULL DEFAULT '',
  receipt_footer        VARCHAR(255) NOT NULL DEFAULT 'Terima kasih atas kunjungan Anda!',
  default_tax_percent   DECIMAL(5,2) NOT NULL DEFAULT 0,
  low_stock_threshold   INT NOT NULL DEFAULT 15,
  menu_access           JSON NULL, -- akses menu umum untuk role kasir
  CONSTRAINT chk_settings_single_row CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- TRANSACTIONS ----------
CREATE TABLE IF NOT EXISTS transactions (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NULL,
  cashier_name   VARCHAR(100) NOT NULL,
  customer_id    INT UNSIGNED NULL,
  customer_name  VARCHAR(150) NOT NULL DEFAULT 'Pelanggan Umum',
  subtotal       DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount       DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax            DECIMAL(12,2) NOT NULL DEFAULT 0,
  total          DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method ENUM('cash','qris','debit') NOT NULL DEFAULT 'cash',
  cash_given     DECIMAL(12,2) NOT NULL DEFAULT 0,
  change_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  table_number   VARCHAR(20) NULL,
  order_type     ENUM('dine-in','takeaway') NOT NULL DEFAULT 'dine-in',
  status         ENUM('paid','void') NOT NULL DEFAULT 'paid',
  voided_at      TIMESTAMP NULL,
  voided_by      VARCHAR(100) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_tx_created_at (created_at),
  INDEX idx_tx_status (status),
  INDEX idx_tx_payment_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- TRANSACTION ITEMS (baris per produk dalam satu transaksi) ----------
CREATE TABLE IF NOT EXISTS transaction_items (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT UNSIGNED NOT NULL,
  product_id     INT UNSIGNED NULL,
  name           VARCHAR(150) NOT NULL,
  price          DECIMAL(12,2) NOT NULL DEFAULT 0,
  qty            INT NOT NULL DEFAULT 1,
  subtotal       DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_ti_transaction (transaction_id),
  INDEX idx_ti_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- STOCK MUTATIONS (audit trail keluar/masuk stok) ----------
CREATE TABLE IF NOT EXISTS stock_mutations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id    INT UNSIGNED NULL,
  product_name  VARCHAR(150) NOT NULL,
  type          ENUM('in','out') NOT NULL,
  qty           INT NOT NULL,
  reason        VARCHAR(255) NOT NULL DEFAULT '',
  stock_before  INT NOT NULL DEFAULT 0,
  stock_after   INT NOT NULL DEFAULT 0,
  user_id       INT UNSIGNED NULL,
  user_name     VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_sm_product (product_id),
  INDEX idx_sm_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- RETURNS (retur/refund) ----------
CREATE TABLE IF NOT EXISTS returns (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT UNSIGNED NOT NULL,
  invoice_label  VARCHAR(30)  NOT NULL,
  customer_name  VARCHAR(150) NOT NULL DEFAULT 'Pelanggan Umum',
  refund_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  reason         VARCHAR(255) NOT NULL DEFAULT 'Tidak disebutkan',
  user_id        INT UNSIGNED NULL,
  user_name      VARCHAR(100) NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_returns_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- RETURN ITEMS ----------
CREATE TABLE IF NOT EXISTS return_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  return_id  INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  name       VARCHAR(150) NOT NULL,
  price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  qty        INT NOT NULL DEFAULT 1,
  subtotal   DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_ri_return (return_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED DATA (sama persis dengan data contoh bawaan aplikasi)
-- ============================================================

INSERT INTO users (username, password_hash, name, role) VALUES
('admin',  '$2a$08$jdZ09eFdAFBROW4B992s/ueXd6BGeOrjlDrqVdBURjmH2KyO0zec2', 'Administrator', 'admin'),
('kasir1', '$2a$08$FmFratleYu/YorF6/2mBmOMr/rlQk3M/lY0CcZNBy07egxfBOr8K.', 'Kasir 1', 'kasir');
-- Password asli (sebelum di-hash): admin/admin123, kasir1/kasir123 — SEGERA GANTI setelah deploy ke production.

INSERT INTO categories (name, color) VALUES
('Minuman', '#2563EB'),
('Makanan', '#F59E0B'),
('Snack',   '#22C55E'),
('Umum',    '#64748B');

INSERT INTO products (name, category, price, stock, favorite) VALUES
('Kopi Hitam',     'Minuman', 15000, 100, 1),
('Kopi Susu',      'Minuman', 20000, 100, 1),
('Cappuccino',     'Minuman', 25000, 80,  0),
('Teh Manis',      'Minuman', 10000, 100, 0),
('Es Jeruk',       'Minuman', 12000, 60,  0),
('Nasi Goreng',    'Makanan', 28000, 40,  1),
('Mie Goreng',     'Makanan', 26000, 40,  0),
('Ayam Geprek',    'Makanan', 22000, 50,  1),
('Kentang Goreng', 'Snack',   15000, 60,  0),
('Roti Bakar',     'Snack',   18000, 12,  0);

INSERT INTO customers (name, phone, email, address, note) VALUES
('Budi Santoso', '081234567890', 'budi@example.com', 'Jl. Merdeka No. 10', ''),
('Siti Aminah',  '081298765432', 'siti@example.com', 'Jl. Sudirman No. 5', 'Suka kopi susu'),
('Andi Wijaya',  '081311122233', '', '', '');

INSERT INTO settings (id, store_name, store_address, store_phone, receipt_footer, default_tax_percent, low_stock_threshold) VALUES
(1, 'Kasir Cafe', 'Jl. Contoh No. 123, Jakarta', '021-1234567', 'Terima kasih atas kunjungan Anda!', 0, 15)
ON DUPLICATE KEY UPDATE store_name = store_name;
