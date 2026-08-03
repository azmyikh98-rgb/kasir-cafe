import { post, put, del } from '../../shared/api.js';
import { icon } from '../../shared/icons.js';
import { rupiah, timeAgo } from '../../shared/format.js';
import { store } from '../../shared/state.js';
import { showToast } from '../../shared/toast.js';
import { refreshCustomers, invalidateAndReload } from '../../shared/catalog.js';

export const template = `
<section class="view" id="view-pelanggan">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Pelanggan</div>
        <div class="page-subtitle">Kelola data pelanggan dan riwayat belanja</div>
      </div>
      <button class="btn btn-primary" id="openAddCustomerBtn">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Tambah Pelanggan
      </button>
    </div>

    <div class="stat-grid stat-grid-3" id="customerStatGrid"></div>

    <div class="card card-pad" id="customerFormCard" style="display:none; margin-bottom:16px;">
      <h3 id="customerFormTitle" style="font-size:14.5px; margin-bottom:14px;">Tambah Pelanggan</h3>
      <form id="customerForm">
        <input type="hidden" id="customerId">
        <div class="form-grid-2">
          <div class="form-field"><label>Nama</label><input type="text" id="cName" required></div>
          <div class="form-field"><label>Telepon</label><input type="text" id="cPhone" placeholder="08xxxxxxxxxx"></div>
          <div class="form-field"><label>Email</label><input type="email" id="cEmail"></div>
          <div class="form-field"><label>Alamat</label><input type="text" id="cAddress"></div>
        </div>
        <div class="form-field"><label>Catatan</label><input type="text" id="cNote" placeholder="mis. preferensi, alergi, dll"></div>
        <div style="display:flex; gap:8px;">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-ghost" id="cancelCustomerForm">Batal</button>
        </div>
      </form>
    </div>

    <div class="pos-toolbar">
      <div class="search-box">
        <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="customerSearch" placeholder="Cari nama atau nomor telepon...">
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table tbl-pelanggan">
        <thead><tr><th>Pelanggan</th><th>Telepon</th><th>Total Transaksi</th><th>Total Belanja</th><th>Kunjungan Terakhir</th><th>Aksi</th></tr></thead>
        <tbody id="customerTableBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;

function resetCustomerForm() {
  document.getElementById('customerId').value = '';
  document.getElementById('cName').value = '';
  document.getElementById('cPhone').value = '';
  document.getElementById('cEmail').value = '';
  document.getElementById('cAddress').value = '';
  document.getElementById('cNote').value = '';
  document.getElementById('customerFormTitle').textContent = 'Tambah Pelanggan';
}

export function renderCustomerTable() {
  const body = document.getElementById('customerTableBody');
  const customers = store.customers;
  if (!customers.length) {
    body.innerHTML = `<tr><td colspan="6"><div class="empty-state">${icon('users', 'icon-lg')}<div class="es-title">Belum ada pelanggan</div></div></td></tr>`;
    return;
  }
  body.innerHTML = customers.map(c => `
    <tr>
      <td>
        <div class="cust-name-cell">
          <div class="customer-avatar">${c.name.charAt(0).toUpperCase()}</div>
          <div><b>${c.name}</b>${c.email ? `<div style="font-size:11px;color:var(--text-secondary);">${c.email}</div>` : ''}</div>
        </div>
      </td>
      <td>${c.phone || '-'}</td>
      <td>${c.transactionCount}</td>
      <td>${rupiah(c.totalSpend)}</td>
      <td>${timeAgo(c.lastVisit)}</td>
      <td>
        <span class="link-action" data-act="edit" data-id="${c.id}">Edit</span>
        <span class="link-action danger" data-act="delete" data-id="${c.id}">Hapus</span>
      </td>
    </tr>
  `).join('');
  body.querySelectorAll('[data-act]').forEach(link => {
    link.addEventListener('click', async () => {
      const id = Number(link.dataset.id);
      const c = customers.find(x => x.id === id);
      if (link.dataset.act === 'edit') {
        document.getElementById('customerId').value = c.id;
        document.getElementById('cName').value = c.name;
        document.getElementById('cPhone').value = c.phone;
        document.getElementById('cEmail').value = c.email;
        document.getElementById('cAddress').value = c.address;
        document.getElementById('cNote').value = c.note;
        document.getElementById('customerFormTitle').textContent = 'Edit Pelanggan';
        document.getElementById('customerFormCard').style.display = 'block';
        document.getElementById('customerFormCard').scrollIntoView({ behavior: 'smooth' });
      } else if (link.dataset.act === 'delete') {
        if (!confirm(`Hapus pelanggan "${c.name}"?`)) return;
        try {
          await del('/api/customers/' + id);
          showToast('Pelanggan dihapus', 'success');
          await invalidateAndReload('customers');
          renderCustomerView();
        } catch (err) { showToast(err.message, 'error'); }
      }
    });
  });
}

export function renderCustomerView() {
  const customers = store.customers;
  const totalCustomers = customers.length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const newThisMonth = customers.filter(c => (c.createdAt || '').slice(0, 7) === thisMonth).length;
  const mostActive = customers.slice().sort((a, b) => b.transactionCount - a.transactionCount)[0];

  document.getElementById('customerStatGrid').innerHTML = `
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${icon('users')}</div></div>
      <div class="stat-label">Total Pelanggan</div>
      <div class="stat-value">${totalCustomers}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon green">${icon('trendUp')}</div></div>
      <div class="stat-label">Pelanggan Baru Bulan Ini</div>
      <div class="stat-value">${newThisMonth}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon amber">${icon('award')}</div></div>
      <div class="stat-label">Pelanggan Teraktif</div>
      <div class="stat-value" style="font-size:16px;">${mostActive && mostActive.transactionCount ? mostActive.name : '-'}</div>
    </div>
  `;
  renderCustomerTable();
}

function setupCustomerForm() {
  document.getElementById('openAddCustomerBtn').addEventListener('click', () => {
    resetCustomerForm();
    document.getElementById('customerFormCard').style.display = 'block';
  });
  document.getElementById('cancelCustomerForm').addEventListener('click', () => {
    document.getElementById('customerFormCard').style.display = 'none';
  });
  document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('customerId').value;
    const payload = {
      name: document.getElementById('cName').value,
      phone: document.getElementById('cPhone').value,
      email: document.getElementById('cEmail').value,
      address: document.getElementById('cAddress').value,
      note: document.getElementById('cNote').value,
    };
    try {
      if (id) { await put('/api/customers/' + id, payload); showToast('Pelanggan diperbarui', 'success'); }
      else { await post('/api/customers', payload); showToast('Pelanggan ditambahkan', 'success'); }
      document.getElementById('customerFormCard').style.display = 'none';
      await refreshCustomers(document.getElementById('customerSearch').value);
      renderCustomerView();
    } catch (err) { showToast(err.message, 'error'); }
  });
  document.getElementById('customerSearch').addEventListener('input', async (e) => {
    await refreshCustomers(e.target.value);
    renderCustomerTable();
  });
}

export async function load() {
  await refreshCustomers();
  renderCustomerView();
}

export function init() {
  setupCustomerForm();
}

export default { id: 'pelanggan', template, init, load };
