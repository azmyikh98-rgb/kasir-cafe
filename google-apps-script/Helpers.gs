/**
 * ============================================================
 * Helpers.gs — setara Format.php
 * ============================================================
 */

var MENU_ACCESS_KEYS = ['dashboard', 'kasir', 'produk', 'kategori', 'pelanggan', 'transaksi', 'retur', 'stok', 'laporan'];

function nowIso_() {
  return Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}

function invoiceLabel_(txId) {
  var s = String(txId);
  while (s.length < 4) s = '0' + s;
  return 'INV-' + s;
}

function defaultMenuAccess_() {
  var out = {};
  MENU_ACCESS_KEYS.forEach(function (k) { out[k] = true; });
  return out;
}

function decodeMenuAccess_(raw) {
  var out = defaultMenuAccess_();
  if (!raw) return out;
  try {
    var decoded = JSON.parse(raw);
    MENU_ACCESS_KEYS.forEach(function (k) { if (decoded[k] !== undefined) out[k] = !!decoded[k]; });
  } catch (e) { /* raw bukan JSON valid -> pakai default */ }
  return out;
}

function decodeMenuAccessOverride_(raw) {
  if (!raw) return null;
  try {
    var decoded = JSON.parse(raw);
    var out = {};
    MENU_ACCESS_KEYS.forEach(function (k) { out[k] = decoded[k] !== undefined ? !!decoded[k] : true; });
    return out;
  } catch (e) { return null; }
}

function encodeMenuAccessOverride_(value) {
  if (value === null || value === undefined) return '';
  var normalized = {};
  MENU_ACCESS_KEYS.forEach(function (k) { normalized[k] = value[k] !== undefined ? !!value[k] : true; });
  return JSON.stringify(normalized);
}

function pctChange_(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Hash password pakai SHA-256 + salt acak (Apps Script tidak punya
 * bcrypt bawaan). Disimpan sebagai "salt:hexHash" di kolom password_hash.
 * INI FORMAT BERBEDA dari versi PHP (bcrypt) -- kalau pindah dari Sheets
 * (dipakai Apps Script) ke MySQL (dipakai PHP), password harus di-set ulang.
 */
function hashPassword_(password) {
  var salt = Utilities.getUuid().replace(/-/g, '');
  return salt + ':' + sha256Hex_(salt + password);
}

function verifyPassword_(password, stored) {
  if (!stored || stored.indexOf(':') === -1) return false;
  var parts = stored.split(':');
  var salt = parts[0], hash = parts[1];
  return sha256Hex_(salt + password) === hash;
}

function sha256Hex_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}
