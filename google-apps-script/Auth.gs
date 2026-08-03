/**
 * ============================================================
 * Auth.gs
 * ============================================================
 * Apps Script Web App tidak punya session/cookie seperti PHP, jadi
 * dipakai TOKEN: login menghasilkan token acak, disimpan di
 * CacheService (maks 6 jam), lalu frontend mengirim token itu di
 * setiap request (lihat shared/api.js di frontend).
 */

function apsCache_() {
  return CacheService.getScriptCache();
}

function createSession_(user) {
  var token = Utilities.getUuid();
  var ttl = Math.min(21600, CONFIG.SESSION_HOURS * 3600); // CacheService maks 21600 detik (6 jam)
  apsCache_().put('session_' + token, JSON.stringify(user), ttl);
  return token;
}

function getSessionUser_(token) {
  if (!token) return null;
  var raw = apsCache_().get('session_' + token);
  return raw ? JSON.parse(raw) : null;
}

function destroySession_(token) {
  if (token) apsCache_().remove('session_' + token);
}

function requireLogin_(token) {
  var user = getSessionUser_(token);
  if (!user) throw new ApiError_('Belum login', 401);
  return user;
}

function requireAdmin_(token) {
  var user = requireLogin_(token);
  if (user.role !== 'admin') throw new ApiError_('Hanya admin yang bisa mengakses', 403);
  return user;
}

/** Error terkontrol -- pesan & status-nya dikirim balik ke frontend. */
function ApiError_(message, status) {
  this.message = message;
  this.status = status || 400;
}
ApiError_.prototype = Object.create(Error.prototype);
