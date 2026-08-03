/**
 * ============================================================
 * Repo_Categories.gs
 * ============================================================
 */

function categoriesTable_() {
  return createTable_(CONFIG.SHEET_ID_CATEGORIES, ['id', 'name', 'color']);
}

function categoriesProductCounts_() {
  var counts = {};
  productsAll_().forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
  return counts;
}

function shapeCategory_(row, counts) {
  return { id: Number(row.id), name: row.name, color: row.color, productCount: counts[row.name] || 0 };
}

function categoriesAll_() {
  var counts = categoriesProductCounts_();
  return categoriesTable_().readAll(false).map(function (r) { return shapeCategory_(r, counts); });
}

function categoriesFind_(id) {
  var row = categoriesTable_().findById(id);
  if (!row) return null;
  return shapeCategory_(row, categoriesProductCounts_());
}

function categoriesCreate_(data) {
  var row = categoriesTable_().insert({ name: data.name, color: data.color || '#2563EB' });
  return shapeCategory_(row, categoriesProductCounts_());
}

function categoriesUpdate_(id, data) {
  var existing = categoriesTable_().findById(id);
  var newName = data.name || existing.name;
  categoriesTable_().update(id, { name: newName, color: data.color || existing.color });
  if (newName !== existing.name) {
    productsAll_().forEach(function (p) {
      if (p.category === existing.name) productsUpdate_(p.id, { category: newName });
    });
  }
  return categoriesFind_(id);
}

function categoriesDelete_(id) {
  var cat = categoriesTable_().findById(id);
  if (!cat || cat.name === 'Umum') return;
  productsAll_().forEach(function (p) {
    if (p.category === cat.name) productsUpdate_(p.id, { category: 'Umum' });
  });
  categoriesTable_().softDelete(id);
}
