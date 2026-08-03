/**
 * ============================================================
 * Repo_Returns.gs
 * ============================================================
 */

function returnsTable_() {
  return createTable_(CONFIG.SHEET_ID_RETURNS, ['id', 'transaction_id', 'invoice_label', 'customer_name', 'refund_amount', 'reason', 'user_id', 'user_name', 'created_at']);
}

function returnItemsTable_() {
  return createTable_(CONFIG.SHEET_ID_RETURN_ITEMS, ['id', 'return_id', 'product_id', 'name', 'price', 'qty', 'subtotal']);
}

/** Dipakai oleh Repo_Transactions untuk menghitung sisa qty yang bisa diretur. */
function returnsItemsForTransaction_(txId) {
  var returnIds = returnsTable_().readAll(false).filter(function (r) { return Number(r.transaction_id) === txId; }).map(function (r) { return Number(r.id); });
  return returnItemsTable_().readAll(false)
    .filter(function (r) { return returnIds.indexOf(Number(r.return_id)) !== -1; })
    .map(function (r) { return { productId: Number(r.product_id), qty: Number(r.qty) }; });
}

function shapeReturn_(row) {
  var items = returnItemsTable_().readAll(false)
    .filter(function (r) { return Number(r.return_id) === Number(row.id); })
    .map(function (r) { return { productId: r.product_id !== '' ? Number(r.product_id) : null, name: r.name, price: Number(r.price), qty: Number(r.qty), subtotal: Number(r.subtotal) }; });
  return {
    id: Number(row.id), transactionId: Number(row.transaction_id), invoiceLabel: row.invoice_label, customerName: row.customer_name,
    refundAmount: Number(row.refund_amount), reason: row.reason, userId: row.user_id !== '' ? Number(row.user_id) : null,
    userName: row.user_name, items: items, createdAt: row.created_at,
  };
}

function returnsAll_() {
  var rows = returnsTable_().readAll(false).map(shapeReturn_);
  rows.sort(function (a, b) { return b.createdAt < a.createdAt ? -1 : 1; });
  return rows;
}

function returnsCreate_(data, actor) {
  var tx = txFind_(Number(data.transactionId));
  if (!tx) throw new ApiError_('Transaksi tidak ditemukan', 404);
  var returnable = txReturnableItems_(tx.id);
  var returnableMap = {};
  returnable.items.forEach(function (it) { returnableMap[it.productId] = it; });

  var refundAmount = 0;
  var lineItems = [];
  data.items.forEach(function (reqItem) {
    var pid = Number(reqItem.productId);
    var qty = Number(reqItem.qty);
    if (qty <= 0) return;
    var ref = returnableMap[pid];
    if (!ref || qty > ref.remainingQty) throw new ApiError_('Jumlah retur melebihi sisa item yang bisa diretur', 400);
    var subtotal = ref.price * qty;
    refundAmount += subtotal;
    lineItems.push({ productId: pid, name: ref.name, price: ref.price, qty: qty, subtotal: subtotal });
  });
  if (!lineItems.length) throw new ApiError_('Tidak ada item yang diretur', 400);

  var returnRow = returnsTable_().insert({
    transaction_id: tx.id, invoice_label: invoiceLabel_(tx.id), customer_name: tx.customerName, refund_amount: refundAmount,
    reason: data.reason || 'Tidak disebutkan', user_id: actor.id, user_name: actor.name, created_at: nowIso_(),
  });
  var returnId = Number(returnRow.id);

  lineItems.forEach(function (li) {
    returnItemsTable_().insert({ return_id: returnId, product_id: li.productId, name: li.name, price: li.price, qty: li.qty, subtotal: li.subtotal });
    var product = productsFind_(li.productId);
    var before = product ? product.stock : 0;
    productsAdjustStock_(li.productId, li.qty);
    stockRecordMutation_({
      productId: li.productId, productName: li.name, type: 'in', qty: li.qty,
      reason: 'Retur ' + invoiceLabel_(tx.id), stockBefore: before, stockAfter: before + li.qty,
      userId: actor.id, userName: actor.name,
    });
  });

  return shapeReturn_(returnsTable_().findById(returnId));
}
