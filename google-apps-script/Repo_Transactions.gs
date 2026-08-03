/**
 * ============================================================
 * Repo_Transactions.gs
 * ============================================================
 */

function txTable_() {
  return createTable_(CONFIG.SHEET_ID_TRANSACTIONS, [
    'id', 'user_id', 'cashier_name', 'customer_id', 'customer_name', 'subtotal', 'discount', 'tax', 'total',
    'payment_method', 'cash_given', 'change_amount', 'table_number', 'order_type', 'status', 'voided_at', 'voided_by', 'created_at',
  ]);
}

function txItemsTable_() {
  return createTable_(CONFIG.SHEET_ID_TRANSACTION_ITEMS, ['id', 'transaction_id', 'product_id', 'name', 'price', 'qty', 'subtotal']);
}

function txItemsFor_(txId) {
  return txItemsTable_().readAll(false)
    .filter(function (r) { return Number(r.transaction_id) === txId; })
    .map(function (r) {
      return { productId: r.product_id !== '' ? Number(r.product_id) : null, name: r.name, price: Number(r.price), qty: Number(r.qty), subtotal: Number(r.subtotal) };
    });
}

function shapeTx_(row) {
  return {
    id: Number(row.id), userId: row.user_id !== '' ? Number(row.user_id) : null, cashierName: row.cashier_name,
    customerId: row.customer_id !== '' ? Number(row.customer_id) : null, customerName: row.customer_name,
    items: txItemsFor_(Number(row.id)), subtotal: Number(row.subtotal), discount: Number(row.discount), tax: Number(row.tax),
    total: Number(row.total), paymentMethod: row.payment_method, cashGiven: Number(row.cash_given), change: Number(row.change_amount),
    tableNumber: row.table_number || null, orderType: row.order_type, status: row.status,
    voidedAt: row.voided_at || null, voidedBy: row.voided_by || null, createdAt: row.created_at,
  };
}

function txFind_(id) {
  var row = txTable_().findById(id);
  return row ? shapeTx_(row) : null;
}

function txSearch_(filters, sortBy, sortDir, page, pageSize) {
  var rows = txTable_().readAll(false).map(shapeTx_);

  if (filters.search) {
    var s = filters.search.toLowerCase();
    rows = rows.filter(function (t) {
      return String(t.id).indexOf(filters.search) !== -1 || t.cashierName.toLowerCase().indexOf(s) !== -1 || (t.customerName || '').toLowerCase().indexOf(s) !== -1;
    });
  }
  if (filters.from) rows = rows.filter(function (t) { return t.createdAt.slice(0, 10) >= filters.from; });
  if (filters.to) rows = rows.filter(function (t) { return t.createdAt.slice(0, 10) <= filters.to; });
  if (filters.paymentMethod) rows = rows.filter(function (t) { return t.paymentMethod === filters.paymentMethod; });
  if (filters.status) rows = rows.filter(function (t) { return t.status === filters.status; });

  var keyMap = { id: 'id', createdAt: 'createdAt', total: 'total', itemCount: 'id' };
  var key = keyMap[sortBy] || 'createdAt';
  rows.sort(function (a, b) {
    if (a[key] < b[key]) return sortDir === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  var total = rows.length;
  var offset = Math.max(0, (page - 1) * pageSize);
  var pageRows = rows.slice(offset, offset + pageSize);
  return { data: pageRows, total: total, page: page, pageSize: pageSize, totalPages: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}

function txReturnedQtyMap_(txId) {
  var map = {};
  returnsItemsForTransaction_(txId).forEach(function (it) { map[it.productId] = (map[it.productId] || 0) + it.qty; });
  return map;
}

function txWithReturnInfo_(tx) {
  var returnedMap = txReturnedQtyMap_(tx.id);
  tx.items.forEach(function (it) {
    var already = returnedMap[it.productId] || 0;
    it.returnedQty = already;
    it.remainingQty = it.qty - already;
  });
  return tx;
}

function txReturnableItems_(id) {
  var tx = txFind_(id);
  return tx ? txWithReturnInfo_(tx) : null;
}

function txLookup_(query) {
  var needle = query.replace(/^INV-0*/i, '');
  var s = query.toLowerCase();
  var matches = txTable_().readAll(false).map(shapeTx_).filter(function (t) {
    return t.status !== 'void' && (String(t.id).indexOf(needle) !== -1 || (t.customerName || '').toLowerCase().indexOf(s) !== -1 || t.cashierName.toLowerCase().indexOf(s) !== -1);
  }).slice(0, 20);
  return matches.map(txWithReturnInfo_);
}

function txCreate_(payload, cashier) {
  var subtotal = 0;
  var lineItems = [];
  payload.items.forEach(function (item) {
    var product = productsFind_(Number(item.productId));
    if (!product) throw new ApiError_('Produk tidak ditemukan: #' + item.productId, 400);
    var qty = Number(item.qty);
    if (qty <= 0) throw new ApiError_('Jumlah item tidak valid', 400);
    if (product.stock < qty) throw new ApiError_('Stok "' + product.name + '" tidak mencukupi', 400);
    var lineSubtotal = product.price * qty;
    subtotal += lineSubtotal;
    lineItems.push({ productId: product.id, name: product.name, price: product.price, qty: qty, subtotal: lineSubtotal });
  });

  var discount = Number(payload.discount || 0);
  var tax = Number(payload.tax || 0);
  var total = Math.max(0, subtotal - discount + tax);
  var cashGiven = Number(payload.cashGiven || 0);
  var change = payload.paymentMethod === 'cash' ? Math.max(0, cashGiven - total) : 0;

  var customerName = payload.customerName || null;
  if (payload.customerId) {
    var c = customersFind_(Number(payload.customerId));
    customerName = c ? c.name : 'Pelanggan Umum';
  }
  customerName = customerName || 'Pelanggan Umum';

  var txRow = txTable_().insert({
    user_id: cashier.id, cashier_name: cashier.name, customer_id: payload.customerId || '', customer_name: customerName,
    subtotal: subtotal, discount: discount, tax: tax, total: total, payment_method: payload.paymentMethod,
    cash_given: cashGiven, change_amount: change, table_number: payload.tableNumber || '', order_type: payload.orderType || 'dine-in',
    status: 'paid', voided_at: '', voided_by: '', created_at: nowIso_(),
  });
  var txId = Number(txRow.id);

  lineItems.forEach(function (li) {
    txItemsTable_().insert({ transaction_id: txId, product_id: li.productId, name: li.name, price: li.price, qty: li.qty, subtotal: li.subtotal });
    var before = productsFind_(li.productId).stock;
    productsAdjustStock_(li.productId, -li.qty);
    stockRecordMutation_({
      productId: li.productId, productName: li.name, type: 'out', qty: li.qty,
      reason: 'Penjualan ' + invoiceLabel_(txId), stockBefore: before, stockAfter: before - li.qty,
      userId: cashier.id, userName: cashier.name,
    });
  });

  return txFind_(txId);
}

function txVoid_(id, actor) {
  var tx = txFind_(id);
  if (!tx) throw new ApiError_('Transaksi tidak ditemukan', 404);
  if (tx.status === 'void') throw new ApiError_('Transaksi sudah dibatalkan sebelumnya', 400);

  txTable_().update(id, { status: 'void', voided_at: nowIso_(), voided_by: actor.name });
  tx.items.forEach(function (it) {
    if (!it.productId) return;
    var product = productsFind_(it.productId);
    if (!product) return;
    var before = product.stock;
    productsAdjustStock_(it.productId, it.qty);
    stockRecordMutation_({
      productId: it.productId, productName: it.name, type: 'in', qty: it.qty,
      reason: 'Pembatalan ' + invoiceLabel_(id), stockBefore: before, stockAfter: before + it.qty,
      userId: actor.id, userName: actor.name,
    });
  });
  return txFind_(id);
}

function txSummarizePeriod_(from, to) {
  var all = txTable_().readAll(false).map(shapeTx_);
  var txs = all.filter(function (t) { return t.status !== 'void' && t.createdAt.slice(0, 10) >= from && t.createdAt.slice(0, 10) <= to; });
  var totalRevenue = txs.reduce(function (s, t) { return s + t.total; }, 0);
  var totalItemsSold = txs.reduce(function (s, t) { return s + t.items.reduce(function (s2, it) { return s2 + it.qty; }, 0); }, 0);
  var totalTransactions = txs.length;
  var avg = totalTransactions ? Math.round(totalRevenue / totalTransactions) : 0;
  return { txs: txs, totalRevenue: totalRevenue, totalTransactions: totalTransactions, totalItemsSold: totalItemsSold, avgTransactionValue: avg };
}

function txStatsForCustomer_(customerId) {
  var all = txTable_().readAll(false).map(shapeTx_);
  var mine = all.filter(function (t) { return t.customerId === customerId && t.status !== 'void'; });
  var lastVisit = null;
  mine.forEach(function (t) { if (!lastVisit || t.createdAt > lastVisit) lastVisit = t.createdAt; });
  return { count: mine.length, spend: mine.reduce(function (s, t) { return s + t.total; }, 0), lastVisit: lastVisit };
}

function customerStats_(customerId) {
  return txStatsForCustomer_(customerId);
}
