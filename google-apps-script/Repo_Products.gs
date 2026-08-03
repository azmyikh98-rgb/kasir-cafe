/**
 * ============================================================
 * Repo_Products.gs
 * ============================================================
 */

function productsTable_() {
  return createTable_(CONFIG.SHEET_ID_PRODUCTS, ['id', 'name', 'category', 'price', 'stock', 'favorite', 'image', 'created_at']);
}

function shapeProduct_(row) {
  return {
    id: Number(row.id), name: row.name, category: row.category || 'Umum', price: Number(row.price) || 0,
    stock: Number(row.stock) || 0, favorite: String(row.favorite) === '1', image: row.image || null,
  };
}

function productsAll_() {
  return productsTable_().readAll(false).map(shapeProduct_);
}

function productsFind_(id) {
  var row = productsTable_().findById(id);
  return row ? shapeProduct_(row) : null;
}

function productsCreate_(data) {
  var row = productsTable_().insert({
    name: data.name, category: data.category || 'Umum', price: data.price || 0, stock: data.stock || 0,
    favorite: data.favorite ? '1' : '0', image: data.image || '', created_at: nowIso_(),
  });
  return shapeProduct_(row);
}

function productsUpdate_(id, data) {
  var changes = {};
  ['name', 'category', 'price', 'stock'].forEach(function (k) { if (data[k] !== undefined) changes[k] = data[k]; });
  if (data.favorite !== undefined) changes.favorite = data.favorite ? '1' : '0';
  if (data.image !== undefined) changes.image = data.image || '';
  var row = productsTable_().update(id, changes);
  return shapeProduct_(row);
}

function productsDelete_(id) {
  productsTable_().softDelete(id);
}

function productsAdjustStock_(id, delta) {
  var row = productsTable_().findById(id);
  var newStock = Math.max(0, (Number(row.stock) || 0) + delta);
  var updated = productsTable_().update(id, { stock: newStock });
  return shapeProduct_(updated);
}
