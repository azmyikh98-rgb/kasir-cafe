/**
 * ============================================================
 * Code.gs — Front controller (setara backend/api/index.php)
 * ============================================================
 * Semua request dari frontend (baik GET maupun perlu "menulis")
 * dikirim sebagai satu POST ke URL Web App ini, dengan body:
 *   { action: 'namaAction', token: '...', params: {...}, query: {...}, body: {...} }
 * Alasan semua lewat POST (bukan GET+PUT+DELETE seperti REST asli):
 * Apps Script Web App hanya resmi mendukung doGet & doPost.
 *
 * Cara deploy: lihat docs/deploy-github-pages.md
 */

function doPost(e) {
  return handleRequest_(e);
}

function doGet(e) {
  // Disediakan supaya kalau URL dibuka langsung di browser tidak error,
  // tapi aplikasi SELALU memakai doPost (lihat shared/api.js di frontend).
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'Kasir Cafe Apps Script backend aktif. Gunakan POST untuk mengakses API.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRequest_(e) {
  var response;
  try {
    var req = JSON.parse(e.postData.contents);
    var result = routeAction_(req.action, req.token, req.params || {}, req.query || {}, req.body || {});
    response = result;
  } catch (err) {
    response = { error: err.message || String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function routeAction_(action, token, params, query, body) {
  switch (action) {
    // ---------- Auth ----------
    case 'me': return { user: getSessionUser_(token) };
    case 'login': return actionLogin_(body);
    case 'logout': destroySession_(token); return { ok: true };
    case 'changeOwnPassword': return actionChangeOwnPassword_(token, body);

    // ---------- Settings ----------
    case 'settings.get': requireLogin_(token); return settingsGet_();
    case 'settings.update': requireAdmin_(token); return settingsUpdate_(body);

    // ---------- Users ----------
    case 'users.index': requireAdmin_(token); return usersAll_();
    case 'users.store': return actionUsersStore_(token, body);
    case 'users.update': return actionUsersUpdate_(token, params, body);
    case 'users.destroy': return actionUsersDestroy_(token, params);

    // ---------- Categories ----------
    case 'categories.index': requireLogin_(token); return categoriesAll_();
    case 'categories.store': requireLogin_(token); if (!body.name) throw new ApiError_('Nama kategori wajib diisi', 400); return categoriesCreate_(body);
    case 'categories.update': requireLogin_(token); return categoriesUpdate_(Number(params.id), body);
    case 'categories.destroy': requireLogin_(token); categoriesDelete_(Number(params.id)); return { ok: true };

    // ---------- Customers ----------
    case 'customers.index': requireLogin_(token); return customersAll_(query.search || '');
    case 'customers.store': requireLogin_(token); if (!body.name) throw new ApiError_('Nama pelanggan wajib diisi', 400); return customersCreate_(body);
    case 'customers.update': requireLogin_(token); return customersUpdate_(Number(params.id), body);
    case 'customers.destroy': requireLogin_(token); customersDelete_(Number(params.id)); return { ok: true };

    // ---------- Products ----------
    case 'products.index': requireLogin_(token); return productsAll_();
    case 'products.store': requireLogin_(token); if (!body.name) throw new ApiError_('Nama produk wajib diisi', 400); return productsCreate_(body);
    case 'products.update': requireLogin_(token); return productsUpdate_(Number(params.id), body);
    case 'products.destroy': requireLogin_(token); productsDelete_(Number(params.id)); return { ok: true };

    // ---------- Transactions ----------
    case 'transactions.search': {
      requireLogin_(token);
      var filters = { search: query.search || '', from: query.from || '', to: query.to || '', paymentMethod: query.paymentMethod || '', status: query.status || '' };
      return txSearch_(filters, query.sortBy || 'createdAt', query.sortDir || 'desc', Number(query.page || 1), Number(query.pageSize || 10));
    }
    case 'transactions.lookup': requireLogin_(token); return query.query ? txLookup_(query.query) : [];
    case 'transactions.returnable': requireLogin_(token); return txReturnableItems_(Number(params.id));
    case 'transactions.show': { requireLogin_(token); var tx = txFind_(Number(params.id)); if (!tx) throw new ApiError_('Transaksi tidak ditemukan', 404); return tx; }
    case 'transactions.store': { var user = requireLogin_(token); if (!body.items || !body.items.length) throw new ApiError_('Keranjang tidak boleh kosong', 400); return txCreate_(body, user); }
    case 'transactions.void': { var admin = requireAdmin_(token); return txVoid_(Number(params.id), admin); }

    // ---------- Stock ----------
    case 'stock.overview': return actionStockOverview_(token);
    case 'stock.mutations': requireLogin_(token); return stockMutations_();
    case 'stock.adjust': return actionStockAdjust_(token, body);

    // ---------- Returns ----------
    case 'returns.index': requireLogin_(token); return returnsAll_();
    case 'returns.store': { var actor = requireLogin_(token); if (!body.transactionId || !body.items) throw new ApiError_('Data retur tidak lengkap', 400); return returnsCreate_(body, actor); }

    // ---------- Reports ----------
    case 'reports.dashboard': requireLogin_(token); return reportsDashboard_();
    case 'reports.range': requireLogin_(token); return reportsRange_(query.from || new Date().toISOString().slice(0, 10), query.to || new Date().toISOString().slice(0, 10));

    default:
      throw new ApiError_('Endpoint tidak ditemukan: ' + action, 404);
  }
}

// ---------- Handler kompleks (butuh beberapa langkah / cek tambahan) ----------

function actionLogin_(body) {
  var username = (body.username || '').trim();
  var password = body.password || '';
  if (!username || !password) throw new ApiError_('Username dan password wajib diisi', 400);
  var raw = usersFindRawByUsername_(username);
  if (!raw || !verifyPassword_(password, raw.password_hash)) throw new ApiError_('Username atau password salah', 401);
  var user = shapeUser_(raw);
  var token = createSession_(user);
  return { user: user, token: token };
}

function actionChangeOwnPassword_(token, body) {
  var me = requireLogin_(token);
  var current = body.currentPassword || '';
  var newPassword = body.newPassword || '';
  if (!current || !newPassword) throw new ApiError_('Lengkapi semua kolom', 400);
  var raw = usersTable_().findById(me.id);
  if (!raw || !verifyPassword_(current, raw.password_hash)) throw new ApiError_('Password saat ini salah', 400);
  usersUpdatePassword_(me.id, hashPassword_(newPassword));
  return { ok: true };
}

function actionUsersStore_(token, body) {
  requireAdmin_(token);
  if (!body.username || !body.password || !body.name) throw new ApiError_('Username, password, dan nama wajib diisi', 400);
  if (usersFindRawByUsername_(body.username)) throw new ApiError_('Username sudah digunakan', 400);
  return usersCreate_(body);
}

function actionUsersUpdate_(token, params, body) {
  var me = requireLogin_(token);
  var id = Number(params.id);
  if (me.role !== 'admin' && me.id !== id) throw new ApiError_('Tidak diizinkan', 403);
  if (!usersFind_(id)) throw new ApiError_('Pengguna tidak ditemukan', 404);
  return usersUpdate_(id, body);
}

function actionUsersDestroy_(token, params) {
  var me = requireAdmin_(token);
  var id = Number(params.id);
  if (id === me.id) throw new ApiError_('Tidak bisa menghapus akun sendiri', 400);
  usersDelete_(id);
  return { ok: true };
}

function actionStockOverview_(token) {
  requireLogin_(token);
  var products = productsAll_();
  var threshold = settingsGet_().lowStockThreshold;
  var shaped = products.map(function (p) {
    var status = p.stock <= 0 ? 'habis' : (p.stock <= threshold ? 'menipis' : 'aman');
    return Object.assign({}, p, { status: status });
  });
  var summary = {
    totalProducts: products.length,
    lowStockCount: shaped.filter(function (p) { return p.status === 'menipis'; }).length,
    outOfStockCount: shaped.filter(function (p) { return p.status === 'habis'; }).length,
    totalStockValue: products.reduce(function (s, p) { return s + p.price * p.stock; }, 0),
  };
  return { products: shaped, summary: summary };
}

function actionStockAdjust_(token, body) {
  var user = requireLogin_(token);
  var productId = Number(body.productId || 0);
  var type = body.type || '';
  var qty = Number(body.qty || 0);
  var reason = body.reason || 'Lainnya';
  if (['in', 'out'].indexOf(type) === -1 || qty <= 0) throw new ApiError_('Data penyesuaian stok tidak valid', 400);
  var product = productsFind_(productId);
  if (!product) throw new ApiError_('Produk tidak ditemukan', 404);
  var before = product.stock;
  if (type === 'out' && qty > before) throw new ApiError_('Jumlah keluar melebihi stok saat ini', 400);
  var delta = type === 'in' ? qty : -qty;
  var updated = productsAdjustStock_(productId, delta);
  var mutation = stockRecordMutation_({ productId: productId, productName: product.name, type: type, qty: qty, reason: reason, stockBefore: before, stockAfter: updated.stock, userId: user.id, userName: user.name });
  return { product: updated, mutation: mutation };
}
