/**
 * ============================================================
 * Config.gs
 * ============================================================
 * Isi 10 Spreadsheet ID di bawah ini (dari URL tiap file, bagian
 * antara /d/ dan /edit). Tidak perlu service account/JSON key sama
 * sekali di sini -- karena script ini jalan LANGSUNG di akun Google
 * Anda, aksesnya otomatis mengikuti akun Anda yang deploy.
 * ============================================================
 */

var CONFIG = {
  SHEET_ID_USERS: 'GANTI_DENGAN_ID_SPREADSHEET_USERS',
  SHEET_ID_CATEGORIES: 'GANTI_DENGAN_ID_SPREADSHEET_CATEGORIES',
  SHEET_ID_CUSTOMERS: 'GANTI_DENGAN_ID_SPREADSHEET_CUSTOMERS',
  SHEET_ID_PRODUCTS: 'GANTI_DENGAN_ID_SPREADSHEET_PRODUCTS',
  SHEET_ID_SETTINGS: 'GANTI_DENGAN_ID_SPREADSHEET_SETTINGS',
  SHEET_ID_TRANSACTIONS: 'GANTI_DENGAN_ID_SPREADSHEET_TRANSACTIONS',
  SHEET_ID_TRANSACTION_ITEMS: 'GANTI_DENGAN_ID_SPREADSHEET_TRANSACTION_ITEMS',
  SHEET_ID_STOCK_MUTATIONS: 'GANTI_DENGAN_ID_SPREADSHEET_STOCK_MUTATIONS',
  SHEET_ID_RETURNS: 'GANTI_DENGAN_ID_SPREADSHEET_RETURNS',
  SHEET_ID_RETURN_ITEMS: 'GANTI_DENGAN_ID_SPREADSHEET_RETURN_ITEMS',
  LOW_STOCK_THRESHOLD_DEFAULT: 15,
  // Lama sesi login (jam) -- CacheService Apps Script maksimum 6 jam per entri,
  // jadi ini juga otomatis jadi batas atas meski diisi lebih besar.
  SESSION_HOURS: 6,
};
