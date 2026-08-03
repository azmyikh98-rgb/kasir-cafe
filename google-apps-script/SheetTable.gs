/**
 * ============================================================
 * SheetTable.gs
 * ============================================================
 * Setara SheetsTable.php di versi PHP, tapi lebih sederhana karena
 * Apps Script bisa akses Google Sheets langsung (SpreadsheetApp),
 * tanpa perlu REST API + JWT seperti di PHP.
 *
 * Satu instance = satu file spreadsheet (1 tabel = 1 file, sama
 * seperti arsitektur PHP). Selalu pakai TAB PERTAMA di file itu,
 * apapun namanya (mis. "data").
 *
 * "Hapus" = SOFT DELETE (kolom `deleted` diisi 1), bukan hapus baris
 * fisik -- sama seperti versi PHP, alasannya sama: menghindari risiko
 * salah index kalau ada penulisan bersamaan.
 */

function createTable_(spreadsheetId, columns) {
  if (columns.indexOf('deleted') === -1) columns = columns.concat(['deleted']);
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheets()[0];

  function rowToObj(rowValues) {
    var obj = {};
    for (var i = 0; i < columns.length; i++) obj[columns[i]] = rowValues[i] === undefined ? '' : rowValues[i];
    return obj;
  }

  function objToRow(obj) {
    return columns.map(function (c) { return obj[c] !== undefined && obj[c] !== null ? obj[c] : ''; });
  }

  function readAll(includeDeleted) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    var values = sheet.getRange(2, 1, lastRow - 1, columns.length).getValues();
    var out = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var isEmpty = row.every(function (v) { return v === '' || v === null; });
      if (isEmpty) continue;
      var obj = rowToObj(row);
      obj._row = i + 2;
      if (!includeDeleted && String(obj.deleted) === '1') continue;
      out.push(obj);
    }
    return out;
  }

  function findById(id) {
    var all = readAll(false);
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) === String(id)) return all[i];
    }
    return null;
  }

  function nextId_() {
    var all = readAll(true);
    var max = 0;
    all.forEach(function (r) { max = Math.max(max, Number(r.id) || 0); });
    return max + 1;
  }

  function insert(data) {
    if (data.id === undefined || data.id === null) data.id = nextId_();
    if (data.deleted === undefined) data.deleted = '0';
    var row = objToRow(data);
    sheet.appendRow(row);
    return data;
  }

  function update(id, changes) {
    var existing = findById(id);
    if (!existing) return null;
    var merged = Object.assign({}, existing, changes);
    var row = objToRow(merged);
    sheet.getRange(existing._row, 1, 1, columns.length).setValues([row]);
    delete merged._row;
    return merged;
  }

  function softDelete(id) {
    update(id, { deleted: '1' });
  }

  return { readAll: readAll, findById: findById, insert: insert, update: update, softDelete: softDelete };
}
