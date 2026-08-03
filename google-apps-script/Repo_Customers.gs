/**
 * ============================================================
 * Repo_Customers.gs
 * ============================================================
 */

function customersTable_() {
  return createTable_(CONFIG.SHEET_ID_CUSTOMERS, ['id', 'name', 'phone', 'email', 'address', 'note', 'created_at']);
}

function shapeCustomerWithStats_(row) {
  var stats = customerStats_(Number(row.id));
  return {
    id: Number(row.id), name: row.name, phone: row.phone, email: row.email, address: row.address, note: row.note,
    createdAt: row.created_at, transactionCount: stats.count, totalSpend: stats.spend, lastVisit: stats.lastVisit,
  };
}

function customersAll_(search) {
  var rows = customersTable_().readAll(false);
  if (search) {
    var s = search.toLowerCase();
    rows = rows.filter(function (r) { return r.name.toLowerCase().indexOf(s) !== -1 || String(r.phone).indexOf(search) !== -1; });
  }
  return rows.map(shapeCustomerWithStats_);
}

function customersFind_(id) {
  var row = customersTable_().findById(id);
  return row ? shapeCustomerWithStats_(row) : null;
}

function customersCreate_(data) {
  var row = customersTable_().insert({
    name: data.name, phone: data.phone || '', email: data.email || '', address: data.address || '',
    note: data.note || '', created_at: nowIso_(),
  });
  return shapeCustomerWithStats_(row);
}

function customersUpdate_(id, data) {
  var changes = {};
  ['name', 'phone', 'email', 'address', 'note'].forEach(function (k) { if (data[k] !== undefined) changes[k] = data[k]; });
  var row = customersTable_().update(id, changes);
  return shapeCustomerWithStats_(row);
}

function customersDelete_(id) {
  customersTable_().softDelete(id);
}
