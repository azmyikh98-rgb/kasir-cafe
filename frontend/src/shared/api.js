// ============================================================
// Lapisan komunikasi ke backend. Semua modul fitur WAJIB lewat
// sini (get/post/put/del) — jangan panggil fetch() langsung di
// file modul. Modul TIDAK PERLU TAHU bahwa di balik layar semua
// request ini diterjemahkan jadi satu POST ke Google Apps Script
// (bukan REST /api/... seperti versi PHP) -- lihat ROUTES di bawah.
//
// Kenapa begini: GitHub Pages cuma bisa menyajikan file statis,
// tidak bisa menjalankan PHP. Solusinya backend dipindah ke Google
// Apps Script (jalan gratis di infrastruktur Google, baca/tulis
// langsung ke 10 file Google Sheets). Apps Script Web App hanya
// resmi mendukung doGet & doPost, jadi SEMUA request (termasuk
// yang tadinya PUT/DELETE) dikirim lewat POST dengan sebuah
// "action" -- diterjemahkan otomatis oleh fungsi api() di bawah,
// supaya kode di modules/ tidak perlu diubah sama sekali.
// ============================================================
import { APPS_SCRIPT_URL } from './config.js';

const TOKEN_KEY = 'kasir_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token || '');
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Tabel rute: menerjemahkan (method, path) gaya REST yang dipakai modul
// fitur, menjadi nama "action" yang dipahami router Apps Script (Code.gs).
// Urutan penting: rute statis (mis. /search) harus di atas rute dinamis
// (mis. /:id) supaya tidak salah tertangkap.
const ROUTES = [
  ['GET', '/api/me', 'me'],
  ['POST', '/api/login', 'login'],
  ['POST', '/api/logout', 'logout'],
  ['PUT', '/api/me/password', 'changeOwnPassword'],

  ['GET', '/api/settings', 'settings.get'],
  ['PUT', '/api/settings', 'settings.update'],

  ['GET', '/api/users', 'users.index'],
  ['POST', '/api/users', 'users.store'],
  ['PUT', '/api/users/:id', 'users.update'],
  ['DELETE', '/api/users/:id', 'users.destroy'],

  ['GET', '/api/categories', 'categories.index'],
  ['POST', '/api/categories', 'categories.store'],
  ['PUT', '/api/categories/:id', 'categories.update'],
  ['DELETE', '/api/categories/:id', 'categories.destroy'],

  ['GET', '/api/customers', 'customers.index'],
  ['POST', '/api/customers', 'customers.store'],
  ['PUT', '/api/customers/:id', 'customers.update'],
  ['DELETE', '/api/customers/:id', 'customers.destroy'],

  ['GET', '/api/products', 'products.index'],
  ['POST', '/api/products', 'products.store'],
  ['PUT', '/api/products/:id', 'products.update'],
  ['DELETE', '/api/products/:id', 'products.destroy'],

  ['GET', '/api/transactions/search', 'transactions.search'],
  ['GET', '/api/transactions/lookup', 'transactions.lookup'],
  ['GET', '/api/transactions/:id/returnable', 'transactions.returnable'],
  ['GET', '/api/transactions/:id', 'transactions.show'],
  ['POST', '/api/transactions', 'transactions.store'],
  ['PUT', '/api/transactions/:id/void', 'transactions.void'],

  ['GET', '/api/stock/overview', 'stock.overview'],
  ['GET', '/api/stock/mutations', 'stock.mutations'],
  ['POST', '/api/stock/adjust', 'stock.adjust'],

  ['GET', '/api/returns', 'returns.index'],
  ['POST', '/api/returns', 'returns.store'],

  ['GET', '/api/reports/dashboard', 'reports.dashboard'],
  ['GET', '/api/reports/range', 'reports.range'],
].map(([method, pattern, action]) => ({
  method,
  action,
  regex: new RegExp('^' + pattern.replace(/:([a-zA-Z_]+)/g, '(?<$1>[^/]+)') + '$'),
}));

function matchRoute(method, pathname) {
  for (const route of ROUTES) {
    if (route.method !== method) continue;
    const m = pathname.match(route.regex);
    if (m) return { action: route.action, params: m.groups || {} };
  }
  throw new Error(`Rute tidak dikenal: ${method} ${pathname}`);
}

/**
 * @param {string} path - path gaya REST, mis. "/api/products/5?x=1"
 * @param {RequestInit} options
 */
export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const [pathname, queryString] = path.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString || ''));
  const { action, params } = matchRoute(method, pathname);
  const body = options.body ? JSON.parse(options.body) : {};

  // Content-Type "text/plain" (bukan application/json) SENGAJA dipakai --
  // supaya browser menganggap ini "simple request" dan TIDAK mengirim
  // CORS preflight (OPTIONS), yang tidak didukung dengan baik oleh Apps
  // Script Web App. Apps Script tetap membaca body ini sebagai JSON biasa
  // lewat e.postData.contents (lihat Code.gs).
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, token: getToken(), params, query, body }),
  });
  const data = await res.json().catch(() => ({}));
  // Apps Script Web App selalu balas HTTP 200, jadi status error dideteksi
  // dari isi payload (`error`), bukan dari res.ok seperti REST API biasa.
  if (data && data.error) throw new Error(data.error);
  return data;
}

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) });
export const del = (path) => api(path, { method: 'DELETE' });

// ------------------------------------------------------------
// Cache ringan in-memory + de-dupe request yang sama.
// Tujuannya: kalau 2 modul minta data yang sama nyaris
// bersamaan (mis. loadProducts dipanggil dari dashboard & kasir),
// cukup 1 request ke server -> penarikan data lebih cepat.
// Ini makin penting di mode Apps Script karena tiap request ke
// Google jauh lebih lambat (ratusan ms - 1-2 detik) dibanding PHP lokal.
// ------------------------------------------------------------
const cache = new Map(); // key -> { data, ts }
const inflight = new Map(); // key -> Promise
const DEFAULT_TTL_MS = 15_000;

export async function getCached(path, ttlMs = DEFAULT_TTL_MS) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.ts < ttlMs) return hit.data;
  if (inflight.has(path)) return inflight.get(path);

  const promise = get(path)
    .then((data) => {
      cache.set(path, { data, ts: Date.now() });
      inflight.delete(path);
      return data;
    })
    .catch((err) => {
      inflight.delete(path);
      throw err;
    });
  inflight.set(path, promise);
  return promise;
}

/** Panggil setelah create/update/delete supaya data lama tidak nyangkut. */
export function invalidateCache(pathPrefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(pathPrefix)) cache.delete(key);
  }
}
