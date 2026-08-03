import { get, put, post, del } from '../../shared/api.js';
import { icon } from '../../shared/icons.js';
import { store, canAccessMenu, getDefaultView, NAV_ITEMS, MENU_ACCESS_KEYS } from '../../shared/state.js';
import { showToast } from '../../shared/toast.js';
import { switchView } from '../../router.js';
import { renderSidebar } from '../sidebar/sidebar.js';

export const template = `
<section class="view" id="view-pengaturan">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Pengaturan</div>
        <div class="page-subtitle">Kelola profil toko, preferensi, pengguna, dan keamanan akun</div>
      </div>
    </div>

    <div class="settings-tabs" id="settingsTabs">
      <button class="settings-tab active" data-tab="profil">Profil Toko</button>
      <button class="settings-tab" data-tab="preferensi">Preferensi</button>
      <button class="settings-tab" data-tab="pengguna">Pengguna</button>
      <button class="settings-tab" data-tab="aksesmenu">Akses Menu</button>
      <button class="settings-tab" data-tab="keamanan">Keamanan</button>
    </div>

    <div class="settings-panel" id="panel-profil">
      <div class="card card-pad" style="max-width:560px;">
        <div class="form-field"><label>Nama Toko</label><input type="text" id="settingStoreName"></div>
        <div class="form-field"><label>Alamat Toko</label><input type="text" id="settingStoreAddress"></div>
        <div class="form-field"><label>Nomor Telepon</label><input type="text" id="settingStorePhone"></div>
        <div class="form-field"><label>Pesan Footer Struk</label><input type="text" id="settingReceiptFooter"></div>
        <button class="btn btn-primary" id="saveProfilBtn">Simpan Profil Toko</button>
      </div>
    </div>

    <div class="settings-panel" id="panel-preferensi" style="display:none;">
      <div class="card card-pad" style="max-width:560px;">
        <div class="form-field">
          <label>Pajak Default (%)</label>
          <input type="number" id="settingTaxPercent" min="0" step="0.5">
          <span class="field-hint">Nilai ini akan otomatis dipakai sebagai pajak awal pada halaman Kasir.</span>
        </div>
        <div class="form-field">
          <label>Ambang Batas Stok Menipis</label>
          <input type="number" id="settingLowStockThreshold" min="0" step="1">
          <span class="field-hint">Produk dengan stok di bawah atau sama dengan angka ini akan ditandai "Menipis".</span>
        </div>
        <button class="btn btn-primary" id="savePreferensiBtn">Simpan Preferensi</button>
      </div>
    </div>

    <div class="settings-panel" id="panel-pengguna" style="display:none;">
      <div class="card-title-row">
        <h3 style="font-size:15px;">Daftar Pengguna</h3>
        <button class="btn btn-primary" id="addUserBtn">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Tambah Pengguna
        </button>
      </div>
      <div class="table-wrap" style="margin-bottom:16px;">
        <table class="data-table tbl-users">
          <thead><tr><th>Username</th><th>Nama</th><th>Role</th><th>Aksi</th></tr></thead>
          <tbody id="userTableBody"></tbody>
        </table>
      </div>
      <div class="card card-pad" id="userFormCard" style="display:none; max-width:480px;">
        <h3 style="font-size:14.5px; margin-bottom:12px;" id="userFormTitle">Tambah Pengguna</h3>
        <input type="hidden" id="userFormId">
        <div class="form-field"><label>Username</label><input type="text" id="userFormUsername"></div>
        <div class="form-field"><label>Nama Lengkap</label><input type="text" id="userFormName"></div>
        <div class="form-field">
          <label>Role</label>
          <select id="userFormRole">
            <option value="kasir">Kasir</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-field"><label id="userFormPasswordLabel">Password</label><input type="password" id="userFormPassword"></div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-primary" id="saveUserBtn">Simpan</button>
          <button class="btn btn-ghost" id="cancelUserBtn">Batal</button>
        </div>
      </div>
    </div>

    <div class="settings-panel" id="panel-aksesmenu" style="display:none;">
      <div class="card card-pad" style="max-width:560px;">
        <div class="form-field"><label>Terapkan Pengaturan Untuk</label><select id="menuAccessTarget"></select></div>
        <p class="field-hint" id="menuAccessHint" style="margin-bottom:14px;">Atur menu yang boleh diakses oleh role Kasir. Role Admin selalu memiliki akses penuh ke semua menu, apa pun pengaturan di sini.</p>
        <div class="menu-access-row" id="menuAccessCustomRow" style="display:none;">
          <span class="ma-label">Gunakan Akses Khusus untuk User Ini</span>
          <label class="ma-switch"><input type="checkbox" id="menuAccessCustomCheckbox"><span class="ma-slider"></span></label>
        </div>
        <div id="menuAccessList"></div>
        <button class="btn btn-primary" id="saveMenuAccessBtn" style="margin-top:6px;">Simpan Akses Menu</button>
      </div>
    </div>

    <div class="settings-panel" id="panel-keamanan" style="display:none;">
      <div class="card card-pad" style="max-width:480px;">
        <h3 style="font-size:14.5px; margin-bottom:12px;">Ganti Password</h3>
        <div class="form-field"><label>Password Saat Ini</label><input type="password" id="pwCurrent"></div>
        <div class="form-field"><label>Password Baru</label><input type="password" id="pwNew"></div>
        <div class="form-field"><label>Konfirmasi Password Baru</label><input type="password" id="pwConfirm"></div>
        <button class="btn btn-primary" id="changePasswordBtn">Simpan Password Baru</button>
      </div>
    </div>
  </div>
</section>
`;

let usersCache = [];

function switchSettingsTab(tabId) {
  document.querySelectorAll('#settingsTabs .settings-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  document.querySelectorAll('.settings-panel').forEach(p => p.style.display = 'none');
  document.getElementById('panel-' + tabId).style.display = '';
}

async function loadSettingsIntoForm() {
  store.appSettings = await get('/api/settings');
  document.getElementById('settingStoreName').value = store.appSettings.storeName || '';
  document.getElementById('settingStoreAddress').value = store.appSettings.storeAddress || '';
  document.getElementById('settingStorePhone').value = store.appSettings.storePhone || '';
  document.getElementById('settingReceiptFooter').value = store.appSettings.receiptFooter || '';
  document.getElementById('settingTaxPercent').value = store.appSettings.defaultTaxPercent || 0;
  document.getElementById('settingLowStockThreshold').value = store.appSettings.lowStockThreshold || 15;

  const isAdmin = store.currentUser.role === 'admin';
  if (isAdmin) usersCache = await get('/api/users');
  populateMenuAccessTargetOptions();
  onMenuAccessTargetChange();
  const tabsEl = document.getElementById('settingsTabs');
  tabsEl.querySelectorAll('.settings-tab').forEach(tab => {
    if (tab.dataset.tab !== 'keamanan') tab.style.display = isAdmin ? '' : 'none';
  });
  if (!isAdmin) switchSettingsTab('keamanan');
}

async function saveStoreProfile() {
  try {
    store.appSettings = await put('/api/settings', {
      storeName: document.getElementById('settingStoreName').value,
      storeAddress: document.getElementById('settingStoreAddress').value,
      storePhone: document.getElementById('settingStorePhone').value,
      receiptFooter: document.getElementById('settingReceiptFooter').value,
    });
    document.querySelector('.brand-text').textContent = store.appSettings.storeName || 'Kasir Cafe';
    document.title = store.appSettings.storeName || 'Kasir Cafe';
    showToast('Profil toko berhasil disimpan', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function savePreferensi() {
  try {
    store.appSettings = await put('/api/settings', {
      defaultTaxPercent: Number(document.getElementById('settingTaxPercent').value || 0),
      lowStockThreshold: Number(document.getElementById('settingLowStockThreshold').value || 0),
    });
    showToast('Preferensi berhasil disimpan', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

function populateMenuAccessTargetOptions() {
  const sel = document.getElementById('menuAccessTarget');
  const kasirUsers = usersCache.filter(u => u.role === 'kasir');
  const prevValue = sel.value || '__general__';
  sel.innerHTML = `<option value="__general__">Semua Kasir (Umum)</option>` +
    kasirUsers.map(u => `<option value="${u.id}">${u.name} (${u.username})${u.menuAccessOverride ? ' — Khusus' : ''}</option>`).join('');
  const stillExists = Array.from(sel.options).some(o => o.value === prevValue);
  sel.value = stillExists ? prevValue : '__general__';
}

function onMenuAccessTargetChange() {
  const sel = document.getElementById('menuAccessTarget');
  const target = sel.value || '__general__';
  const customCheckbox = document.getElementById('menuAccessCustomCheckbox');
  if (target === '__general__') {
    customCheckbox.checked = false;
  } else {
    const user = usersCache.find(u => u.id === Number(target));
    customCheckbox.checked = !!(user && user.menuAccessOverride);
  }
  renderMenuAccessList();
}

function renderMenuAccessList() {
  const sel = document.getElementById('menuAccessTarget');
  const target = sel.value || '__general__';
  const holder = document.getElementById('menuAccessList');
  const customRow = document.getElementById('menuAccessCustomRow');
  const customCheckbox = document.getElementById('menuAccessCustomCheckbox');
  const hint = document.getElementById('menuAccessHint');
  const items = NAV_ITEMS.filter(item => MENU_ACCESS_KEYS.includes(item.id));
  const general = store.appSettings.menuAccess || {};

  let effective, disabled;

  if (target === '__general__') {
    effective = general;
    disabled = false;
    customRow.style.display = 'none';
    hint.textContent = 'Atur menu yang boleh diakses oleh semua role Kasir (berlaku sebagai pengaturan umum). Role Admin selalu memiliki akses penuh ke semua menu.';
  } else {
    const user = usersCache.find(u => u.id === Number(target));
    customRow.style.display = '';
    disabled = !customCheckbox.checked;
    hint.textContent = `Atur akses menu khusus untuk ${user ? user.name : 'user ini'}. Jika "Akses Khusus" dimatikan, user ini mengikuti pengaturan umum di atas.`;
    if (customCheckbox.checked) {
      effective = { ...general };
      if (user && user.menuAccessOverride) {
        MENU_ACCESS_KEYS.forEach(k => { if (user.menuAccessOverride[k] != null) effective[k] = !!user.menuAccessOverride[k]; });
      }
    } else {
      effective = general;
    }
  }

  holder.innerHTML = items.map(item => `
    <div class="menu-access-row">
      <span class="ma-label">${icon(item.icon)} ${item.label}</span>
      <label class="ma-switch">
        <input type="checkbox" data-menu-id="${item.id}" ${effective[item.id] !== false ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
        <span class="ma-slider"></span>
      </label>
    </div>
  `).join('');
}

async function saveMenuAccess() {
  const sel = document.getElementById('menuAccessTarget');
  const target = sel.value || '__general__';
  const holder = document.getElementById('menuAccessList');
  const values = {};
  holder.querySelectorAll('input[data-menu-id]').forEach(input => { values[input.dataset.menuId] = input.checked; });
  try {
    if (target === '__general__') {
      store.appSettings = await put('/api/settings', { menuAccess: values });
    } else {
      const customCheckbox = document.getElementById('menuAccessCustomCheckbox');
      const userId = Number(target);
      const menuAccessOverride = customCheckbox.checked ? values : null;
      const updated = await put('/api/users/' + userId, { menuAccessOverride });
      const idx = usersCache.findIndex(u => u.id === userId);
      if (idx !== -1) usersCache[idx] = { ...usersCache[idx], ...updated };
      populateMenuAccessTargetOptions();
      sel.value = String(userId);
      renderMenuAccessList();
    }
    renderSidebar();
    if (!canAccessMenu(store.activeView)) switchView(getDefaultView());
    showToast('Akses menu berhasil disimpan', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function changeOwnPassword() {
  const currentPassword = document.getElementById('pwCurrent').value;
  const newPassword = document.getElementById('pwNew').value;
  const confirmPw = document.getElementById('pwConfirm').value;
  if (!currentPassword || !newPassword) { showToast('Lengkapi semua kolom', 'error'); return; }
  if (newPassword !== confirmPw) { showToast('Konfirmasi password baru tidak cocok', 'error'); return; }
  try {
    await put('/api/me/password', { currentPassword, newPassword });
    document.getElementById('pwCurrent').value = '';
    document.getElementById('pwNew').value = '';
    document.getElementById('pwConfirm').value = '';
    showToast('Password berhasil diubah', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function loadUserList() {
  if (store.currentUser.role !== 'admin') { document.getElementById('userTableBody').innerHTML = ''; return; }
  const users = await get('/api/users');
  usersCache = users;
  populateMenuAccessTargetOptions();
  const body = document.getElementById('userTableBody');
  body.innerHTML = users.map(u => `
    <tr>
      <td>${u.username}</td>
      <td>${u.name}</td>
      <td><span class="badge ${u.role === 'admin' ? 'blue' : 'green'}">${u.role === 'admin' ? 'Admin' : 'Kasir'}</span></td>
      <td class="row-actions">
        <button class="btn-icon-sm" data-act="edit" data-id="${u.id}" title="Edit">${icon('tag', 'icon-sm')}</button>
        <button class="btn-icon-sm danger" data-act="delete" data-id="${u.id}" title="Hapus">${icon('ban', 'icon-sm')}</button>
      </td>
    </tr>
  `).join('');
  body.querySelectorAll('[data-act="edit"]').forEach(btn => {
    btn.addEventListener('click', () => openUserForm(users.find(x => x.id === Number(btn.dataset.id))));
  });
  body.querySelectorAll('[data-act="delete"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Hapus pengguna ini?')) return;
      try {
        await del('/api/users/' + btn.dataset.id);
        showToast('Pengguna dihapus', 'success');
        loadUserList();
      } catch (err) { showToast(err.message, 'error'); }
    });
  });
}

function openUserForm(user) {
  document.getElementById('userFormCard').style.display = '';
  document.getElementById('userFormTitle').textContent = user ? 'Edit Pengguna' : 'Tambah Pengguna';
  document.getElementById('userFormId').value = user ? user.id : '';
  document.getElementById('userFormUsername').value = user ? user.username : '';
  document.getElementById('userFormUsername').disabled = !!user;
  document.getElementById('userFormName').value = user ? user.name : '';
  document.getElementById('userFormRole').value = user ? user.role : 'kasir';
  document.getElementById('userFormPassword').value = '';
  document.getElementById('userFormPasswordLabel').textContent = user ? 'Password Baru (opsional)' : 'Password';
}

async function saveUser() {
  const id = document.getElementById('userFormId').value;
  const username = document.getElementById('userFormUsername').value.trim();
  const name = document.getElementById('userFormName').value.trim();
  const role = document.getElementById('userFormRole').value;
  const password = document.getElementById('userFormPassword').value;
  if (!name) { showToast('Nama wajib diisi', 'error'); return; }
  try {
    if (id) {
      await put('/api/users/' + id, { name, role, password: password || undefined });
      showToast('Pengguna berhasil diperbarui', 'success');
    } else {
      if (!username || !password) { showToast('Username dan password wajib diisi', 'error'); return; }
      await post('/api/users', { username, password, name, role });
      showToast('Pengguna berhasil ditambahkan', 'success');
    }
    document.getElementById('userFormCard').style.display = 'none';
    loadUserList();
  } catch (err) { showToast(err.message, 'error'); }
}

export async function load() {
  await loadSettingsIntoForm();
  await loadUserList();
}

export function init() {
  document.getElementById('settingsTabs').querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => switchSettingsTab(tab.dataset.tab));
  });
  document.getElementById('saveProfilBtn').addEventListener('click', saveStoreProfile);
  document.getElementById('savePreferensiBtn').addEventListener('click', savePreferensi);
  document.getElementById('changePasswordBtn').addEventListener('click', changeOwnPassword);
  document.getElementById('addUserBtn').addEventListener('click', () => openUserForm());
  document.getElementById('cancelUserBtn').addEventListener('click', () => { document.getElementById('userFormCard').style.display = 'none'; });
  document.getElementById('saveUserBtn').addEventListener('click', saveUser);
  document.getElementById('saveMenuAccessBtn').addEventListener('click', saveMenuAccess);
  document.getElementById('menuAccessTarget').addEventListener('change', onMenuAccessTargetChange);
  document.getElementById('menuAccessCustomCheckbox').addEventListener('change', renderMenuAccessList);
}

export default { id: 'pengaturan', template, init, load };
