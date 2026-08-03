# Kasir Cafe

Aplikasi kasir (POS) untuk cafe/restoran kecil-menengah: transaksi, produk,
kategori, pelanggan, stok, retur, laporan, dan manajemen pengguna.

## Arsitektur

Proyek ini disusun modular per fitur. Frontend-nya sama untuk semua skenario
deploy; yang berbeda cuma backend-nya, dan Anda bisa pilih salah satu:

| Cara pakai | Backend | Hosting | Link publik? |
|---|---|---|---|
| **Demo/coba-coba (GitHub Pages)** | Google Apps Script | Gratis, tanpa hosting sendiri | ✅ `username.github.io/kasir-cafe` |
| **Development lokal** | PHP + Google Sheets | Komputer sendiri (`php -S`) | ❌ |
| **Produksi (toko beroperasi)** | PHP + MySQL | Hostinger (berbayar) | ✅ domain sendiri |

Panduan lengkap tiap opsi: `documentation/deploy-github-pages.md`,
`documentation/google-sheets-setup.md`, `documentation/migrasi-ke-mysql.md`.

```
kasir-cafe/
├── frontend/                  Vite app (vanilla JS ES Modules) — dipakai semua skenario
│   ├── index.html             Shell aplikasi utama (sidebar + topbar)
│   ├── login.html             Halaman login
│   └── src/
│       ├── main.js            Entry point — mendaftarkan semua modul fitur
│       ├── router.js          Switch antar-view
│       ├── shared/            Util lintas-modul (api.js, state, catalog, dst)
│       ├── styles/            CSS terpisah per modul
│       └── modules/           1 folder = 1 fitur (dashboard, kasir, produk, ...)
├── docs/                      HASIL BUILD frontend (dibuat otomatis oleh `npm run build`,
│                               dipakai GitHub Pages) — jangan diedit manual
├── google-apps-script/        Backend alternatif untuk GitHub Pages — kumpulan file .gs,
│                               di-copy-paste ke script.google.com (lihat deploy-github-pages.md)
├── backend/                    Backend PHP (tanpa framework, tanpa dependency composer)
│   ├── api/index.php          Front controller — semua request /api/* masuk sini
│   ├── config/                Konfigurasi (config.php — JANGAN commit ke Git)
│   └── src/
│       ├── Core/               Router, Session, Auth, Response
│       ├── Controllers/        1 controller = 1 resource (Product, Transaction, dst)
│       ├── Helpers/             Fungsi bisnis kecil (format invoice, dsb)
│       └── Repositories/
│           ├── Contracts/       Interface — kontrak yang backend manapun harus penuhi
│           ├── Mysql/           Implementasi untuk MySQL (Hostinger)
│           └── Sheets/          Implementasi untuk Google Sheets (dipakai backend PHP)
├── database/
│   └── kasir-cafe-schema-hostinger.sql   Schema + data contoh untuk MySQL
└── documentation/
    ├── deploy-github-pages.md  Cara deploy 100% gratis lewat GitHub Pages + Apps Script
    ├── google-sheets-setup.md  Cara buat 10 file Google Sheets sebagai database
    └── migrasi-ke-mysql.md     Cara pindah ke MySQL di Hostinger
```

**Kenapa ada 2 backend (PHP dan Apps Script)?** GitHub Pages hanya bisa
menyajikan file statis (HTML/CSS/JS), tidak bisa menjalankan PHP. Supaya
aplikasi bisa punya link langsung dari GitHub Pages, backend-nya perlu
sesuatu yang juga "gratis dan tanpa server sendiri" — itulah Google Apps
Script (`google-apps-script/`). Backend PHP (`backend/`) tetap dipertahankan
untuk jalur produksi di Hostinger nanti, karena lebih cepat dan lebih
matang (mendukung MySQL). Keduanya membaca/menulis ke skema data yang sama
(10 tabel/entitas yang sama), jadi tidak ada data yang perlu diubah — hanya
format hash password yang berbeda (lihat `google-sheets-setup.md`).

### Kenapa disusun begini?

- **Modular per fitur** — setiap fitur (Kasir, Produk, Laporan, dst) adalah
  file/folder sendiri dengan template HTML + logika + (di backend)
  controller-nya sendiri. Menambah atau memperbaiki 1 fitur tidak perlu
  membuka file 2000 baris seperti sebelumnya.
- **Repository/Adapter pattern di backend PHP** — controller tidak pernah tahu
  apakah data disimpan di Sheets atau MySQL; keduanya mengikuti "kontrak"
  yang sama (`Repositories/Contracts/*.php`). Pindah backend = ganti 1 baris
  config, bukan tulis ulang aplikasi.
- **Cache ringan + event bus di frontend** — `shared/api.js` men-cache hasil
  fetch selama beberapa detik dan menghindari request duplikat yang terjadi
  bersamaan, supaya perpindahan antar halaman (mis. Kasir ⇄ Dashboard) terasa
  instan. Modul saling memberi tahu perubahan data lewat event bus
  (`shared/bus.js`), bukan saling import langsung — supaya tetap independen.

## Cara Tercepat: Demo Publik Lewat GitHub Pages

Ikuti `documentation/deploy-github-pages.md` — dalam garis besar:
1. Deploy 12 file di `google-apps-script/` sebagai Web App lewat script.google.com
2. Isi URL Web App itu ke `frontend/src/shared/config.js`
3. `cd frontend && npm run build` (otomatis build ke folder `docs/`)
4. Commit + push, lalu aktifkan GitHub Pages di Settings → Pages → source `/docs`

## Menjalankan Secara Lokal (mode PHP)

### Backend

Butuh PHP 8+ dengan ekstensi `pdo_mysql` (kalau pakai MySQL) dan `curl`.

```bash
cd backend
cp config/config.example.php config/config.php
# edit config.php: pilih DATA_BACKEND ('sheets' atau 'mysql') dan isi kredensialnya
php -S localhost:8080
```

**Catatan:** `frontend/src/shared/api.js` saat ini dikonfigurasi untuk
memanggil backend Apps Script (format single-endpoint `action`), bukan REST
`/api/...` seperti backend PHP. Untuk menjalankan mode PHP lokal, `api.js`
perlu dikembalikan ke versi REST — lihat riwayat Git sebelum perubahan
"deploy ke GitHub Pages", atau minta bantuan untuk membuatkan versi yang
bisa switch otomatis antara kedua mode.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173/login.html`.

Akun contoh: `admin` / `admin123` (role admin) atau `kasir1` / `kasir123`
(role kasir) — **ganti password ini** sebelum dipakai sungguhan.

## Deploy ke GitHub

Repo ini aman untuk di-push ke GitHub publik — semua kredensial (config.php,
service-account.json) sudah masuk `.gitignore` dan tidak pernah ter-commit.
`frontend/src/shared/config.js` (berisi URL Apps Script) **ikut ter-commit**
karena URL Web App bukan rahasia (aksesnya tetap dikontrol lewat token login
di aplikasi) — tapi tetap jangan taruh kredensial lain di file itu.

## Menambah Fitur Baru

1. **Frontend**: buat folder baru di `frontend/src/modules/nama-fitur/`,
   ekspor `{ id, template, init, load }` mengikuti pola modul yang sudah ada
   (lihat `modules/kategori/kategori.js` untuk contoh paling sederhana),
   lalu daftarkan di `main.js`.
2. **Backend PHP**: tambah interface baru di `Repositories/Contracts/`, buat
   implementasi di `Repositories/Mysql/` dan `Repositories/Sheets/`, daftarkan
   di `RepositoryFactory`, lalu buat `Controllers/NamaFiturController.php`
   dan daftarkan rute-nya di `backend/api/index.php`.
3. **Backend Apps Script**: tambah fungsi repo baru di file `Repo_*.gs` yang
   sesuai (atau buat file baru), lalu daftarkan action barunya di `routeAction_()`
   pada `Code.gs`. Terakhir tambahkan rute barunya juga ke tabel `ROUTES` di
   `frontend/src/shared/api.js` supaya frontend tahu cara memanggilnya.

## Keterbatasan yang Perlu Diketahui

- Backend Google Sheets (baik lewat PHP maupun Apps Script) menggunakan
  **soft delete** dan menarik seluruh baris tabel setiap kali membaca (tidak
  ada index sisi server) — cocok untuk volume kecil-menengah, bukan untuk
  toko dengan ribuan transaksi/hari. Detail lengkap ada di
  `documentation/google-sheets-setup.md` dan `documentation/deploy-github-pages.md`.
- Backend Apps Script punya keterbatasan tambahan: sesi login maksimum 6 jam,
  tiap request lebih lambat (~0.5-2 detik), dan ada kuota harian dari Google.
- Belum ada test otomatis (unit/integration test) — mengingat ukuran proyek,
  ini kandidat kuat untuk iterasi berikutnya, terutama untuk logika checkout,
  void, dan retur yang cukup krusial secara bisnis.
