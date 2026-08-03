import { get, post } from '../../shared/api.js';
import { icon } from '../../shared/icons.js';
import { rupiah } from '../../shared/format.js';
import { showToast } from '../../shared/toast.js';
import { invalidateAndReload } from '../../shared/catalog.js';

export const template = `
<section class="view" id="view-stok">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Stok</div>
        <div class="page-subtitle">Pantau dan sesuaikan stok produk</div>
      </div>
    </div>

    <div class="stat-grid" id="stockStatGrid"></div>

    <div class="card-title-row" style="margin-top:8px;"><h3 style="font-size:15px;">Daftar Stok Produk</h3></div>
    <div class="table-wrap" style="margin-bottom:20px;">
      <table class="data-table tbl-stok">
        <thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody id="stockTableBody"></tbody>
      </table>
    </div>

    <div class="card-title-row"><h3 style="font-size:15px;">Riwayat Mutasi Stok</h3></div>
    <div class="table-wrap">
      <table class="data-table tbl-mutasi">
        <thead><tr><th>Tanggal</th><th>Produk</th><th>Jenis</th><th>Jumlah</th><th>Stok Sebelum</th><th>Stok Sesudah</th><th>Alasan</th><th>Oleh</th></tr></thead>
        <tbody id="mutationTableBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;

let stockAdjustType = 'in';

async function loadStockOverview() {
  const res = await get('/api/stock/overview');
  document.getElementById('stockStatGrid').innerHTML = `
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${icon('boxes')}</div></div>
      <div class="stat-label">Total Produk</div>
      <div class="stat-value">${res.summary.totalProducts}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon amber">${icon('alert')}</div></div>
      <div class="stat-label">Stok Menipis</div>
      <div class="stat-value">${res.summary.lowStockCount}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon red">${icon('ban')}</div></div>
      <div class="stat-label">Stok Habis</div>
      <div class="stat-value">${res.summary.outOfStockCount}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon green">${icon('award')}</div></div>
      <div class="stat-label">Total Nilai Stok</div>
      <div class="stat-value" style="font-size:18px;">${rupiah(res.summary.totalStockValue)}</div>
    </div>
  `;
  const body = document.getElementById('stockTableBody');
  body.innerHTML = res.products.map(p => `
    <tr>
      <td><b>${p.name}</b></td>
      <td><span class="badge gray">${p.category}</span></td>
      <td>${rupiah(p.price)}</td>
      <td>${p.stock}</td>
      <td><span class="status-pill ${p.status}">${p.status === 'aman' ? 'Aman' : p.status === 'menipis' ? 'Menipis' : 'Habis'}</span></td>
      <td><span class="link-action" data-id="${p.id}">Sesuaikan Stok</span></td>
    </tr>
  `).join('');
  body.querySelectorAll('[data-id]').forEach(link => {
    link.addEventListener('click', () => {
      const p = res.products.find(x => x.id === Number(link.dataset.id));
      openStockAdjustModal(p);
    });
  });
}

async function loadStockMutations() {
  const mutations = await get('/api/stock/mutations');
  const body = document.getElementById('mutationTableBody');
  if (!mutations.length) {
    body.innerHTML = `<tr><td colspan="8"><div class="empty-state">${icon('boxes', 'icon-lg')}<div class="es-title">Belum ada mutasi stok</div></div></td></tr>`;
    return;
  }
  body.innerHTML = mutations.map(m => `
    <tr>
      <td>${new Date(m.createdAt).toLocaleString('id-ID')}</td>
      <td><b>${m.productName}</b></td>
      <td><span class="mutation-type ${m.type}">${m.type === 'in' ? icon('plus', 'icon-sm') + ' Masuk' : icon('minus', 'icon-sm') + ' Keluar'}</span></td>
      <td>${m.qty}</td>
      <td>${m.stockBefore}</td>
      <td>${m.stockAfter}</td>
      <td>${m.reason}</td>
      <td>${m.userName}</td>
    </tr>
  `).join('');
}

function openStockAdjustModal(product) {
  stockAdjustType = 'in';
  const modal = document.getElementById('stockAdjustModal');
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box wide">
        <h3>Sesuaikan Stok — ${product.name}</h3>
        <p style="font-size:12.5px; color:var(--text-secondary); margin-top:-8px; margin-bottom:14px;">Stok saat ini: <b>${product.stock}</b></p>
        <div class="radio-toggle">
          <label class="checked-in" id="typeInLabel"><input type="radio" name="stockType" value="in" checked> Stok Masuk</label>
          <label id="typeOutLabel"><input type="radio" name="stockType" value="out"> Stok Keluar</label>
        </div>
        <div class="form-field"><label>Jumlah</label><input type="number" id="adjustQty" min="1" required></div>
        <div class="form-field">
          <label>Alasan</label>
          <select id="adjustReason">
            <option value="Restock">Restock</option>
            <option value="Koreksi Stok">Koreksi Stok</option>
            <option value="Barang Rusak">Barang Rusak</option>
            <option value="Kadaluarsa">Kadaluarsa</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeAdjustBtn">Batal</button>
          <button class="btn btn-primary" id="submitAdjustBtn">Simpan</button>
        </div>
      </div>
    </div>
  `;
  modal.querySelectorAll('input[name="stockType"]').forEach(r => {
    r.addEventListener('change', (e) => {
      stockAdjustType = e.target.value;
      document.getElementById('typeInLabel').className = stockAdjustType === 'in' ? 'checked-in' : '';
      document.getElementById('typeOutLabel').className = stockAdjustType === 'out' ? 'checked-out' : '';
    });
  });
  document.getElementById('closeAdjustBtn').addEventListener('click', () => modal.innerHTML = '');
  document.getElementById('submitAdjustBtn').addEventListener('click', async () => {
    const qty = Number(document.getElementById('adjustQty').value);
    const reason = document.getElementById('adjustReason').value;
    if (!qty || qty <= 0) { showToast('Masukkan jumlah yang valid', 'error'); return; }
    try {
      await post('/api/stock/adjust', { productId: product.id, type: stockAdjustType, qty, reason });
      showToast('Stok berhasil disesuaikan', 'success');
      modal.innerHTML = '';
      await loadStockOverview();
      await loadStockMutations();
      await invalidateAndReload('products');
    } catch (err) { showToast(err.message, 'error'); }
  });
}

export async function load() {
  await loadStockOverview();
  await loadStockMutations();
}

export function init() {
  // Modal penyesuaian stok dibangun dinamis per produk; listener dipasang saat dibuka.
}

export default { id: 'stok', template, init, load };
