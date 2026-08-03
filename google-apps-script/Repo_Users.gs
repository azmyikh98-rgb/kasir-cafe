/**
 * ============================================================
 * Repo_Users.gs
 * ============================================================
 */

function usersTable_() {
  return createTable_(CONFIG.SHEET_ID_USERS, ['id', 'username', 'password_hash', 'name', 'role', 'menu_access_override', 'created_at']);
}

function shapeUser_(row) {
  return {
    id: Number(row.id), username: row.username, name: row.name, role: row.role,
    menuAccessOverride: decodeMenuAccessOverride_(row.menu_access_override),
  };
}

function usersAll_() {
  return usersTable_().readAll(false).map(shapeUser_);
}

function usersFind_(id) {
  var row = usersTable_().findById(id);
  return row ? shapeUser_(row) : null;
}

function usersFindRawByUsername_(username) {
  var all = usersTable_().readAll(false);
  for (var i = 0; i < all.length; i++) if (all[i].username === username) return all[i];
  return null;
}

function usersCreate_(data) {
  var row = usersTable_().insert({
    username: data.username, password_hash: hashPassword_(data.password),
    name: data.name, role: data.role || 'kasir', menu_access_override: '', created_at: nowIso_(),
  });
  return shapeUser_(row);
}

function usersUpdate_(id, data) {
  var changes = {};
  if (data.name !== undefined) changes.name = data.name;
  if (data.role !== undefined) changes.role = data.role;
  if (data.password) changes.password_hash = hashPassword_(data.password);
  if (data.menuAccessOverride !== undefined) changes.menu_access_override = encodeMenuAccessOverride_(data.menuAccessOverride);
  var row = usersTable_().update(id, changes);
  return shapeUser_(row);
}

function usersDelete_(id) {
  usersTable_().softDelete(id);
}

function usersUpdatePassword_(id, newPasswordHash) {
  usersTable_().update(id, { password_hash: newPasswordHash });
}
