/**
 * ============================================================
 * Repo_Settings.gs (single row, id selalu 1)
 * ============================================================
 */

function settingsTable_() {
  return createTable_(CONFIG.SHEET_ID_SETTINGS, [
    'id', 'store_name', 'store_address', 'store_phone', 'receipt_footer',
    'default_tax_percent', 'low_stock_threshold', 'menu_access',
  ]);
}

function shapeSettings_(row) {
  return {
    storeName: row.store_name || 'Kasir Cafe', storeAddress: row.store_address || '', storePhone: row.store_phone || '',
    receiptFooter: row.receipt_footer || 'Terima kasih atas kunjungan Anda!',
    defaultTaxPercent: Number(row.default_tax_percent) || 0,
    lowStockThreshold: Number(row.low_stock_threshold) || CONFIG.LOW_STOCK_THRESHOLD_DEFAULT,
    menuAccess: decodeMenuAccess_(row.menu_access),
  };
}

function settingsGet_() {
  var row = settingsTable_().findById(1);
  if (!row) {
    row = settingsTable_().insert({
      id: 1, store_name: 'Kasir Cafe', store_address: '', store_phone: '',
      receipt_footer: 'Terima kasih atas kunjungan Anda!', default_tax_percent: 0,
      low_stock_threshold: CONFIG.LOW_STOCK_THRESHOLD_DEFAULT, menu_access: JSON.stringify(defaultMenuAccess_()),
    });
  }
  return shapeSettings_(row);
}

function settingsUpdate_(data) {
  var map = { storeName: 'store_name', storeAddress: 'store_address', storePhone: 'store_phone', receiptFooter: 'receipt_footer', defaultTaxPercent: 'default_tax_percent', lowStockThreshold: 'low_stock_threshold' };
  var changes = {};
  Object.keys(map).forEach(function (k) { if (data[k] !== undefined) changes[map[k]] = data[k]; });
  if (data.menuAccess !== undefined) {
    var current = settingsGet_();
    changes.menu_access = JSON.stringify(Object.assign({}, current.menuAccess, data.menuAccess));
  }
  if (Object.keys(changes).length) settingsTable_().update(1, changes);
  return settingsGet_();
}
