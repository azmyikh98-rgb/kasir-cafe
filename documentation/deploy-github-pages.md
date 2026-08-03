# Deploy Sepenuhnya di GitHub (Tanpa Server Sendiri)

Panduan ini untuk menjalankan Kasir Cafe **100% gratis**, dengan link yang
didapat langsung dari GitHub Pages (seperti `https://username.github.io/kasir-cafe/`),
tanpa perlu hosting PHP sama sekali.

**Cara kerjanya:** frontend (HTML/CSS/JS statis) dihosting di GitHub Pages.
Backend (yang di versi PHP ada di `backend/`) digantikan oleh **Google Apps
Script** — kode JavaScript yang jalan gratis di server Google, punya URL
publik sendiri, dan bisa baca/tulis langsung ke 10 file Google Sheets yang
sudah Anda buat. Tidak perlu service account/JSON key untuk jalur ini
(beda dari jalur PHP) karena Apps Script otomatis pakai akses akun Google
Anda sendiri saat di-deploy.

```
Browser  --->  GitHub Pages (frontend statis)  --->  Google Apps Script (backend)  --->  10 file Google Sheets
```

## Bagian A — Deploy Backend (Google Apps Script)

### 1. Buat Project Apps Script
1. Buka [script.google.com](https://script.google.com) (pakai akun Google yang sama dengan 10 Spreadsheet Anda)
2. **New project**
3. Beri nama project (klik "Untitled project" di kiri atas), mis. "Kasir Cafe Backend"

### 2. Salin Semua File Kode
Folder `google-apps-script/` di project ini berisi 12 file `.gs`. Untuk **setiap** file:
1. Di editor Apps Script, klik ikon **+** di sebelah "Files" → **Script**
2. Beri nama **persis sama** dengan nama file aslinya TANPA ekstensi `.gs`
   (mis. file `Code.gs` → nama script `Code`)
3. Buka file aslinya di komputer Anda, copy semua isinya, paste ke editor Apps Script
4. Ulangi untuk ke-12 file: `Code`, `Config`, `Auth`, `Helpers`, `SheetTable`,
   `Repo_Users`, `Repo_Categories`, `Repo_Customers`, `Repo_Products`,
   `Repo_Settings`, `Repo_Stock`, `Repo_Transactions`, `Repo_Returns`, `Reports`

   (Project baru otomatis punya file `Code.gs` bawaan — pakai itu untuk isi `Code.gs`, tidak perlu buat baru untuk yang ini.)

### 3. Isi Spreadsheet ID di `Config`
Buka file `Config` di editor, ganti ke-10 nilai `GANTI_DENGAN_ID_SPREADSHEET_...`
dengan Spreadsheet ID asli Anda (yang sudah dipakai di `config.php` sebelumnya —
ID-nya sama persis, tidak perlu Spreadsheet baru).

### 4. Deploy sebagai Web App
1. Klik tombol **Deploy** (kanan atas) → **New deployment**
2. Klik ikon ⚙️ di sebelah "Select type" → pilih **Web app**
3. Isi:
   - **Description**: bebas, mis. "v1"
   - **Execute as**: **Me** (akun Anda)
   - **Who has access**: **Anyone**
4. Klik **Deploy**
5. Akan muncul dialog minta izin ("Authorize access") — klik **Authorize access**,
   pilih akun Google Anda, kalau muncul peringatan "Google hasn't verified this
   app" klik **Advanced** → **Go to (nama project) (unsafe)** → **Allow**.
   (Ini normal untuk script buatan sendiri, bukan tanda bahaya.)
6. Setelah berhasil, akan muncul **Web app URL** — bentuknya seperti:
   `https://script.google.com/macros/s/AKfycb.../exec`
   **Salin URL ini.**

### 5. (Penting) Isi Data Awal di Sheet `users`
Karena hash password Apps Script BEDA dari versi PHP (SHA-256, bukan bcrypt),
isi ulang kolom `password_hash` di file spreadsheet `users` dengan nilai ini
(cara membaca kolom dan urutan sama seperti sebelumnya):

| id | username | password_hash | name | role | menu_access_override | created_at | deleted |
|---|---|---|---|---|---|---|---|
| 1 | admin | `5cb99da45e0d4519af16768254dec44a:841fcb36ddd6baebe881a14abe9da1945cd2f581e91c8b3259abfb253da29e09` | Administrator | admin | | 2026-07-31T00:00:00.000Z | 0 |
| 2 | kasir1 | `0a41d32173854fea9e2ef3e91536106d:ea110091f6f357bcf2f780737cb8fceb40f2a2ec1fbd8ffb48caae91770275a7` | Kasir 1 | kasir | | 2026-07-31T00:00:00.000Z | 0 |

Password login tetap sama: `admin123` dan `kasir123` (isi kolomnya saja yang beda formatnya, bukan passwordnya).

## Bagian B — Sambungkan Frontend ke Apps Script

1. Buka `frontend/src/shared/config.js` di komputer Anda
2. Ganti `GANTI_DENGAN_URL_WEB_APP_ANDA` dengan URL Web App dari Bagian A Langkah 4:
   ```js
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```

## Bagian C — Build & Deploy Frontend ke GitHub Pages

### 1. Build
```bash
cd frontend
npm install
npm run build
```
Ini otomatis membuat/menimpa folder **`docs/`** di root project (bukan `dist/`
seperti kebanyakan project Vite lain — sudah diatur khusus di `vite.config.js`
supaya cocok dengan cara kerja GitHub Pages).

### 2. Commit & Push
```bash
cd ..
git add .
git commit -m "Deploy: build frontend untuk GitHub Pages"
git push
```

### 3. Aktifkan GitHub Pages
1. Buka repo Anda di GitHub → **Settings** → **Pages** (menu kiri)
2. Di **Source**, pilih **Deploy from a branch**
3. Di **Branch**, pilih **main** dan folder **`/docs`** → **Save**
4. Tunggu 1-2 menit, refresh halaman — akan muncul kotak hijau
   **"Your site is live at https://username.github.io/kasir-cafe/"**

### 4. Buka Aplikasinya
Link Anda: `https://username.github.io/kasir-cafe/login.html`

Login dengan `admin` / `admin123`, lalu **segera ganti password** lewat menu
Pengaturan → Keamanan.

## Setiap Kali Ada Perubahan Kode
Ulangi Bagian C Langkah 1-2 (`npm run build` lalu commit+push). GitHub Pages
otomatis update dalam 1-2 menit setelah push.

## Batasan yang Perlu Diketahui
- **Kecepatan**: tiap request ke Apps Script + Sheets makan waktu ~0.5-2 detik
  (lebih lambat dari PHP+MySQL). Wajar untuk demo, terasa kalau dipakai
  transaksi beruntun cepat.
- **Sesi login**: token login tersimpan max 6 jam (batas teknis CacheService
  Apps Script), setelah itu harus login ulang. Beda dari versi PHP yang bisa
  12 jam.
- **Kuota Apps Script**: akun Google gratis punya batas ~20.000 pemanggilan
  URL Fetch/script per hari — lebih dari cukup untuk demo/UMKM kecil, tapi
  perlu diperhatikan kalau dipakai banyak orang sekaligus.
- Batasan Google Sheets lainnya (soft delete, tanpa transaksi atomik lintas
  file, dst) sama seperti dijelaskan di `google-sheets-setup.md`.

**Kapan pindah ke versi PHP+Hostinger?** Begitu toko beroperasi harian dan
butuh performa/keandalan lebih — backend PHP di folder `backend/` sudah siap
pakai dan tidak berubah sama sekali, tinggal ikuti `migrasi-ke-mysql.md`.
Satu penyesuaian yang perlu dilakukan di frontend: `shared/api.js` saat ini
ditulis khusus untuk memanggil Apps Script (format single-endpoint dengan
`action`) — untuk kembali ke backend PHP (REST `/api/...` biasa), file ini
perlu dikembalikan ke versi sebelumnya (tersedia di riwayat Git/commit
sebelum perubahan ini), karena kedua gaya komunikasi itu berbeda.
