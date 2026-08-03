import { get, put } from '../../shared/api.js';
import { icon } from '../../shared/icons.js';
import { rupiah, debounce } from '../../shared/format.js';
import { store, canAccessMenu } from '../../shared/state.js';
import { showToast } from '../../shared/toast.js';
import { invalidateAndReload } from '../../shared/catalog.js';
import { showReceipt } from '../kasir/kasir.js';
import { emit, on } from '../../shared/bus.js';

export const template = `
<section class="view" id="view-transaksi">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Transaksi</div>
        <div class="page-subtitle">Riwayat seluruh transaksi penjualan</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" id="exportCsvBtn">
          <svg class="icon-sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
        <button class="btn btn-secondary" id="printTxBtn">
          <svg class="icon-sm" viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Cetak / Simpan PDF
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="txSearch" placeholder="Cari invoice, kasir, atau pelanggan...">
      </div>
      <div class="form-field"><label>Dari Tanggal</label><input type="date" id="txFrom"></div>
      <div class="form-field"><label>Sampai Tanggal</label><input type="date" id="txTo"></div>
      <div class="form-field">
        <label>Metode Bayar</label>
        <select id="txPaymentFilter">
          <option value="">Semua</option>
          <option value="cash">Tunai</option>
          <option value="qris">QRIS</option>
          <option value="debit">Kartu Debit</option>
        </select>
      </div>
      <div class="form-field">
        <label>Status</label>
        <select id="txStatusFilter">
          <option value="">Semua</option>
          <option value="paid">Lunas</option>
          <option value="void">Dibatalkan</option>
        </select>
      </div>
      <button class="btn btn-ghost" id="txResetFilterBtn">Reset</button>
    </div>

    <div class="table-wrap" id="txTableWrap">
      <table class="data-table" id="txTable">
        <thead>
          <tr>
            <th>No</th>
            <th class="th-sort" data-sort="id">Invoice</th>
            <th class="th-sort" data-sort="createdAt">Tanggal</th>
            <th>Kasir</th>
            <th>Pelanggan</th>
            <th class="th-sort" data-sort="itemCount">Jumlah Item</th>
            <th class="th-sort" data-sort="total">Grand Total</th>
            <th>Metode Bayar</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="txTableBody"></tbody>
      </table>
    </div>
    <div class="pagination-bar">
      <div class="pagination-info" id="txPaginationInfo"></div>
      <div class="pagination-controls" id="txPaginationControls"></div>
    </div>
  </div>
</section>
`;

let txState = { search: '', from: '', to: '', paymentMethod: '', status: '', sortBy: 'createdAt', sortDir: 'desc', page: 1, pageSize: 10 };
let txCache = [];
const PAYMENT_LABEL = { cash: 'Tunai', qris: 'QRIS', debit: 'Kartu Debit' };

export async function loadTransactions() {
  const params = new URLSearchParams();
  if (txState.search) params.set('search', txState.search);
  if (txState.from) params.set('from', txState.from);
  if (txState.to) params.set('to', txState.to);
  if (txState.paymentMethod) params.set('paymentMethod', txState.paymentMethod);
  if (txState.status) params.set('status', txState.status);
  params.set('sortBy', txState.sortBy);
  params.set('sortDir', txState.sortDir);
  params.set('page', txState.page);
  params.set('pageSize', txState.pageSize);

  const res = await get('/api/transactions/search?' + params.toString());
  txCache = res.data;
  renderTxTable(res);
  renderTxPagination(res);
}

function renderTxTable(res) {
  const body = document.getElementById('txTableBody');
  if (!res.data.length) {
    body.innerHTML = `<tr><td colspan="10"><div class="empty-state">${icon('receipt', 'icon-lg')}<div class="es-title">Tidak ada transaksi ditemukan</div></div></td></tr>`;
    return;
  }
  body.innerHTML = res.data.map((t, i) => {
    const itemCount = t.items.reduce((s, it) => s + it.qty, 0);
    const isVoid = t.status === 'void';
    return `
    <tr>
      <td>${(res.page - 1) * res.pageSize + i + 1}</td>
      <td><b>#INV-${String(t.id).padStart(4, '0')}</b></td>
      <td>${new Date(t.createdAt).toLocaleString('id-ID')}</td>
      <td>${t.cashierName}</td>
      <td>${t.customerName || 'Pelanggan Umum'}</td>
      <td>${itemCount}</td>
      <td>${rupiah(t.total)}</td>
      <td><span class="badge gray">${PAYMENT_LABEL[t.paymentMethod] || t.paymentMethod}</span></td>
      <td>${isVoid ? '<span class="badge red">Dibatalkan</span>' : '<span class="badge green">Lunas</span>'}</td>
      <td>
        <span class="link-action" data-act="view" data-id="${t.id}">Lihat</span>
        ${(!isVoid && canAccessMenu('retur')) ? `<span class="link-action" data-act="retur" data-id="${t.id}">Retur</span>` : ''}
        ${(!isVoid && store.currentUser.role === 'admin') ? `<span class="link-action danger" data-act="void" data-id="${t.id}">Batalkan</span>` : ''}
      </td>
    </tr>
  `;
  }).join('');
  body.querySelectorAll('[data-act]').forEach(link => {
    link.addEventListener('click', async () => {
      const id = Number(link.dataset.id);
      const t = txCache.find(x => x.id === id);
      if (link.dataset.act === 'view') { showReceipt(t); }
      else if (link.dataset.act === 'retur') { emit('transaksi:go-return', id); }
      else if (link.dataset.act === 'void') {
        if (!confirm(`Batalkan transaksi #INV-${String(id).padStart(4, '0')}? Stok produk akan dikembalikan.`)) return;
        try {
          await put(`/api/transactions/${id}/void`);
          showToast('Transaksi dibatalkan, stok dikembalikan', 'success');
          await loadTransactions();
          await invalidateAndReload('products');
        } catch (err) { showToast(err.message, 'error'); }
      }
    });
  });

  document.querySelectorAll('#txTable .th-sort').forEach(th => {
    th.textContent = th.textContent.replace(/ ▲| ▼/, '');
    if (th.dataset.sort === txState.sortBy) th.textContent += txState.sortDir === 'asc' ? ' ▲' : ' ▼';
  });
}

function renderTxPagination(res) {
  document.getElementById('txPaginationInfo').textContent =
    `Menampilkan ${res.data.length ? (res.page - 1) * res.pageSize + 1 : 0}–${Math.min(res.page * res.pageSize, res.total)} dari ${res.total} transaksi`;

  const controls = document.getElementById('txPaginationControls');
  let html = `<button class="page-btn" id="txPrevBtn" ${res.page <= 1 ? 'disabled' : ''}>${icon('chevronLeft', 'icon-sm')}</button>`;
  for (let p = 1; p <= res.totalPages; p++) {
    if (res.totalPages > 7 && Math.abs(p - res.page) > 2 && p !== 1 && p !== res.totalPages) {
      if (p === 2 || p === res.totalPages - 1) html += `<span style="padding:0 4px;">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${p === res.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
  }
  html += `<button class="page-btn" id="txNextBtn" ${res.page >= res.totalPages ? 'disabled' : ''}>${icon('chevronRight', 'icon-sm')}</button>`;
  controls.innerHTML = html;

  controls.querySelectorAll('[data-page]').forEach(btn => btn.addEventListener('click', () => { txState.page = Number(btn.dataset.page); loadTransactions(); }));
  const prevBtn = document.getElementById('txPrevBtn'); if (prevBtn) prevBtn.addEventListener('click', () => { if (txState.page > 1) { txState.page--; loadTransactions(); } });
  const nextBtn = document.getElementById('txNextBtn'); if (nextBtn) nextBtn.addEventListener('click', () => { if (txState.page < res.totalPages) { txState.page++; loadTransactions(); } });
}

async function exportTransactionsCsv() {
  const params = new URLSearchParams();
  if (txState.search) params.set('search', txState.search);
  if (txState.from) params.set('from', txState.from);
  if (txState.to) params.set('to', txState.to);
  if (txState.paymentMethod) params.set('paymentMethod', txState.paymentMethod);
  if (txState.status) params.set('status', txState.status);
  params.set('sortBy', txState.sortBy);
  params.set('sortDir', txState.sortDir);
  params.set('pageSize', 100000);
  params.set('page', 1);

  const res = await get('/api/transactions/search?' + params.toString());
  const header = ['No', 'Invoice', 'Tanggal', 'Kasir', 'Pelanggan', 'Jumlah Item', 'Subtotal', 'Diskon', 'Pajak', 'Grand Total', 'Metode Bayar', 'Status'];
  const rows = res.data.map((t, i) => [
    i + 1, `INV-${String(t.id).padStart(4, '0')}`, new Date(t.createdAt).toLocaleString('id-ID'),
    t.cashierName, t.customerName || 'Pelanggan Umum', t.items.reduce((s, it) => s + it.qty, 0),
    t.subtotal, t.discount, t.tax, t.total, PAYMENT_LABEL[t.paymentMethod] || t.paymentMethod, t.status === 'void' ? 'Dibatalkan' : 'Lunas',
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`${res.data.length} transaksi diekspor ke CSV`, 'success');
}

function printTransactions() {
  document.body.classList.add('print-table-mode');
  window.print();
  setTimeout(() => document.body.classList.remove('print-table-mode'), 500);
}

function setupTransaksiPage() {
  document.getElementById('txSearch').addEventListener('input', debounce((e) => {
    txState.search = e.target.value; txState.page = 1; loadTransactions();
  }, 300));
  document.getElementById('txFrom').addEventListener('change', (e) => { txState.from = e.target.value; txState.page = 1; loadTransactions(); });
  document.getElementById('txTo').addEventListener('change', (e) => { txState.to = e.target.value; txState.page = 1; loadTransactions(); });
  document.getElementById('txPaymentFilter').addEventListener('change', (e) => { txState.paymentMethod = e.target.value; txState.page = 1; loadTransactions(); });
  document.getElementById('txStatusFilter').addEventListener('change', (e) => { txState.status = e.target.value; txState.page = 1; loadTransactions(); });
  document.getElementById('txResetFilterBtn').addEventListener('click', () => {
    txState = { search: '', from: '', to: '', paymentMethod: '', status: '', sortBy: 'createdAt', sortDir: 'desc', page: 1, pageSize: 10 };
    document.getElementById('txSearch').value = '';
    document.getElementById('txFrom').value = '';
    document.getElementById('txTo').value = '';
    document.getElementById('txPaymentFilter').value = '';
    document.getElementById('txStatusFilter').value = '';
    loadTransactions();
  });
  document.querySelectorAll('#txTable .th-sort').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (txState.sortBy === key) txState.sortDir = txState.sortDir === 'asc' ? 'desc' : 'asc';
      else { txState.sortBy = key; txState.sortDir = 'desc'; }
      loadTransactions();
    });
  });
  document.getElementById('exportCsvBtn').addEventListener('click', exportTransactionsCsv);
  document.getElementById('printTxBtn').addEventListener('click', printTransactions);

  // retur.js akan `on('transaksi:go-return', ...)` untuk membuka form retur
  on('retur:transaction-voided-or-returned', () => loadTransactions());
}

export async function load() {
  await loadTransactions();
}

export function init() {
  setupTransaksiPage();
}

export default { id: 'transaksi', template, init, load };
