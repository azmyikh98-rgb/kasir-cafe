/**
 * ============================================================
 * Repo_Stock.gs
 * ============================================================
 */

function stockTable_() {
  return createTable_(CONFIG.SHEET_ID_STOCK_MUTATIONS, [
    'id', 'product_id', 'product_name', 'type', 'qty', 'reason', 'stock_before', 'stock_after', 'user_id', 'user_name', 'created_at',
  ]);
}

function shapeMutation_(row) {
  return {
    id: Number(row.id), productId: row.product_id !== '' ? Number(row.product_id) : null, productName: row.product_name,
    type: row.type, qty: Number(row.qty), reason: row.reason, stockBefore: Number(row.stock_before), stockAfter: Number(row.stock_after),
    userId: row.user_id !== '' ? Number(row.user_id) : null, userName: row.user_name, createdAt: row.created_at,
  };
}

function stockMutations_() {
  var rows = stockTable_().readAll(false).map(shapeMutation_);
  rows.sort(function (a, b) { return b.createdAt < a.createdAt ? -1 : 1; });
  return rows.slice(0, 300);
}

function stockRecordMutation_(data) {
  var row = stockTable_().insert({
    product_id: data.productId, product_name: data.productName, type: data.type, qty: data.qty, reason: data.reason,
    stock_before: data.stockBefore, stock_after: data.stockAfter, user_id: data.userId, user_name: data.userName,
    created_at: nowIso_(),
  });
  return shapeMutation_(row);
}
