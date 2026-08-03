import { get, post } from '../../shared/api.js';
import { icon } from '../../shared/icons.js';
import { rupiah } from '../../shared/format.js';
import { showToast } from '../../shared/toast.js';
import { invalidateAndReload } from '../../shared/catalog.js';
import { on, emit } from '../../shared/bus.js';

export const template = `
<section class="view" id="view-retur">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Retur</div>
        <div class="page-subtitle">Proses pengembalian barang dari transaksi yang sudah selesai</div>
      </div>
      <button class="btn btn-primary" id="openReturnSearchBtn">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Retur Baru
      </button>
    </div>

    <div class="stat-grid" id="returnStatGrid"></div>

    <div class="card-title-row"><h3 style="font-size:15px;">Riwayat Retur</h3></div>
    <div class="table-wrap">
      <table class="data-table tbl-retur">
        <thead><tr><th>Tanggal</th><th>Invoice Asal</th><th>Pelanggan</th><th>Item Diretur</th><th>Nilai Refund</th><th>Alasan</th><th>Diproses Oleh</th></tr></thead>
        <tbody id="returnTableBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;

// "Retur Baru": satu modal berisi pencarian transaksi + form retur.
// Form dinonaktifkan sampai sebuah transaksi dipilih dari hasil pencarian.
let currentSearchModalTx = null;

function openReturnSearchModal() {
  currentSearchModalTx = null;
  const modal = document.getElementById('returnModal');
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box wide">
        <h3>Retur Transaksi</h3>
        <div class="return-search-row">
          <input type="text" id="returnModalSearchInput" placeholder="Cari nomor invoice (mis. INV-0001) atau nama pelanggan...">
          <button class="btn btn-primary" id="returnModalSearchBtn">Cari</button>
        </div>
        <div id="returnModalMatches"></div>
        <div id="returnFormSection" class="return-form-section" style="opacity:0.45; pointer-events:none;">
          <p id="returnFormHint" style="font-size:12.5px; color:var(--text-secondary); margin:0 0 10px;">Pilih transaksi di atas untuk mengisi form retur.</p>
          <div id="returnModalItemsList"></div>
          <div class="form-field" style="margin-top:14px;">
            <label>Alasan Retur</label>
            <select id="returnModalReason" disabled>
              <option value="Barang Rusak">Barang Rusak</option>
              <option value="Salah Pesan">Salah Pesan</option>
              <option value="Tidak Sesuai">Tidak Sesuai Pesanan</option>
              <option value="Pelanggan Berubah Pikiran">Pelanggan Berubah Pikiran</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div class="return-summary-box">
            <div class="sum-row grand"><span>Total Refund</span><span id="returnModalRefundTotal">Rp 0</span></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeReturnModalBtn">Tutup</button>
          <button class="btn btn-primary" id="submitReturnModalBtn" disabled>Proses Retur</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('returnModalSearchBtn').addEventListener('click', () => doReturnSearchInModal(modal));
  document.getElementById('returnModalSearchInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') doReturnSearchInModal(modal); });
  document.getElementById('closeReturnModalBtn').addEventListener('click', () => modal.innerHTML = '');
  document.getElementById('submitReturnModalBtn').addEventListener('click', () => {
    if (!currentSearchModalTx) return;
    submitReturnModal(currentSearchModalTx.id, modal);
  });
  document.getElementById('returnModalSearchInput').focus();
}

async function doReturnSearchInModal(modal) {
  const q = document.getElementById('returnModalSearchInput').value.trim();
  const matchesEl = document.getElementById('returnModalMatches');
  if (!q) { matchesEl.innerHTML = ''; return; }
  try {
    const matches = await get('/api/transactions/lookup?query=' + encodeURIComponent(q));
    if (!matches.length) {
      matchesEl.innerHTML = `<div class="empty-state">${icon('receipt', 'icon-lg')}<div class="es-title">Tidak ditemukan transaksi yang bisa diretur</div></div>`;
      return;
    }
    matchesEl.innerHTML = matches.map(t => `
      <div class="return-match-card" data-id="${t.id}">
        <div class="return-match-top">
          <b>#INV-${String(t.id).padStart(4, '0')}</b>
          <span class="badge gray">${new Date(t.createdAt).toLocaleDateString('id-ID')}</span>
        </div>
        <div style="font-size:12.5px; color:var(--text-secondary);">${t.customerName || 'Pelanggan Umum'} · ${t.items.length} jenis item · ${rupiah(t.total)}</div>
      </div>
    `).join('');
    matchesEl.querySelectorAll('.return-match-card').forEach(card => {
      card.addEventListener('click', () => {
        const tx = matches.find(t => t.id === Number(card.dataset.id));
        selectSearchModalTx(tx, modal);
      });
    });
  } catch (err) { showToast(err.message, 'error'); }
}

function selectSearchModalTx(tx, modal) {
  currentSearchModalTx = tx;
  modal.querySelectorAll('.return-match-card').forEach(c => {
    c.classList.toggle('selected', Number(c.dataset.id) === tx.id);
  });

  const itemsHtml = tx.items.filter(it => it.remainingQty > 0).map(it => `
    <div class="return-item-row" data-product-id="${it.productId}" data-price="${it.price}" data-max="${it.remainingQty}">
      <div class="ri-name"><b>${it.name}</b><div class="ri-remaining">Sisa bisa diretur: ${it.remainingQty} dari ${it.qty} dibeli</div></div>
      <input type="number" class="returnQtyInput" min="0" max="${it.remainingQty}" value="0">
    </div>
  `).join('');
  document.getElementById('returnFormHint').textContent = `#INV-${String(tx.id).padStart(4, '0')} · ${tx.customerName || 'Pelanggan Umum'} · ${new Date(tx.createdAt).toLocaleString('id-ID')} · Kasir: ${tx.cashierName}`;
  document.getElementById('returnModalItemsList').innerHTML = itemsHtml;

  const formSection = document.getElementById('returnFormSection');
  formSection.style.opacity = '1';
  formSection.style.pointerEvents = 'auto';
  document.getElementById('returnModalReason').disabled = false;
  document.getElementById('submitReturnModalBtn').disabled = false;

  modal.querySelectorAll('#returnModalItemsList .returnQtyInput').forEach(inp => inp.addEventListener('input', () => updateReturnModalTotal(modal)));
  updateReturnModalTotal(modal);
}

// Modal retur cepat untuk transaksi tertentu (dipicu dari tombol "Retur" di
// halaman Transaksi lewat event bus, tanpa perlu berpindah halaman).
async function returnFromTransaction(id) {
  try {
    const tx = await get(`/api/transactions/${id}/returnable`);
    if (!tx.items.some(it => it.remainingQty > 0)) {
      showToast('Semua item pada transaksi ini sudah diretur', 'error');
      return;
    }
    openReturnModal(tx);
  } catch (err) { showToast(err.message, 'error'); }
}

function openReturnModal(tx) {
  const modal = document.getElementById('returnModal');
  const itemsHtml = tx.items.filter(it => it.remainingQty > 0).map(it => `
    <div class="return-item-row" data-product-id="${it.productId}" data-price="${it.price}" data-max="${it.remainingQty}">
      <div class="ri-name"><b>${it.name}</b><div class="ri-remaining">Sisa bisa diretur: ${it.remainingQty} dari ${it.qty} dibeli</div></div>
      <input type="number" class="returnQtyInput" min="0" max="${it.remainingQty}" value="0">
    </div>
  `).join('');
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box wide">
        <h3>Retur — #INV-${String(tx.id).padStart(4, '0')}</h3>
        <p style="font-size:12px; color:var(--text-secondary); margin-top:-8px; margin-bottom:14px;">${tx.customerName || 'Pelanggan Umum'} · ${new Date(tx.createdAt).toLocaleString('id-ID')} · Kasir: ${tx.cashierName}</p>
        <div id="returnModalItemsList">${itemsHtml}</div>
        <div class="form-field" style="margin-top:14px;">
          <label>Alasan Retur</label>
          <select id="returnModalReason">
            <option value="Barang Rusak">Barang Rusak</option>
            <option value="Salah Pesan">Salah Pesan</option>
            <option value="Tidak Sesuai">Tidak Sesuai Pesanan</option>
            <option value="Pelanggan Berubah Pikiran">Pelanggan Berubah Pikiran</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div class="return-summary-box">
          <div class="sum-row grand"><span>Total Refund</span><span id="returnModalRefundTotal">Rp 0</span></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeReturnModalBtn">Batal</button>
          <button class="btn btn-primary" id="submitReturnModalBtn">Proses Retur</button>
        </div>
      </div>
    </div>
  `;
  modal.querySelectorAll('.returnQtyInput').forEach(inp => inp.addEventListener('input', () => updateReturnModalTotal(modal)));
  updateReturnModalTotal(modal);
  document.getElementById('closeReturnModalBtn').addEventListener('click', () => modal.innerHTML = '');
  document.getElementById('submitReturnModalBtn').addEventListener('click', () => submitReturnModal(tx.id, modal));
}

function updateReturnModalTotal(modal) {
  let total = 0;
  modal.querySelectorAll('.return-item-row').forEach(row => {
    const max = Number(row.dataset.max);
    const price = Number(row.dataset.price);
    const input = row.querySelector('.returnQtyInput');
    let qty = Number(input.value || 0);
    if (qty > max) { qty = max; input.value = max; }
    if (qty < 0) { qty = 0; input.value = 0; }
    total += price * qty;
  });
  document.getElementById('returnModalRefundTotal').textContent = rupiah(total);
}

async function submitReturnModal(txId, modal) {
  const items = [];
  modal.querySelectorAll('.return-item-row').forEach(row => {
    const qty = Number(row.querySelector('.returnQtyInput').value || 0);
    if (qty > 0) items.push({ productId: Number(row.dataset.productId), qty });
  });
  if (!items.length) { showToast('Pilih minimal 1 item untuk diretur', 'error'); return; }
  const reason = document.getElementById('returnModalReason').value;
  try {
    await post('/api/returns', { transactionId: txId, items, reason });
    showToast('Retur berhasil diproses, stok dikembalikan', 'success');
    modal.innerHTML = '';
    await invalidateAndReload('products');
    await renderReturnStats();
    await renderReturnTable();
    emit('retur:transaction-voided-or-returned'); // modul transaksi.js akan refresh tabelnya
  } catch (err) { showToast(err.message, 'error'); }
}

async function renderReturnStats() {
  const returns = await get('/api/returns');
  const thisMonth = new Date().toISOString().slice(0, 7);
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthReturns = returns.filter(r => r.createdAt.slice(0, 7) === thisMonth);
  const todayReturns = returns.filter(r => r.createdAt.slice(0, 10) === todayStr);
  document.getElementById('returnStatGrid').innerHTML = `
    <div class="card stat-card"><div class="stat-top"><div class="stat-icon blue">${icon('undo')}</div></div><div class="stat-label">Retur Bulan Ini</div><div class="stat-value">${monthReturns.length}</div></div>
    <div class="card stat-card"><div class="stat-top"><div class="stat-icon amber">${icon('receipt')}</div></div><div class="stat-label">Nilai Retur Bulan Ini</div><div class="stat-value" style="font-size:18px;">${rupiah(monthReturns.reduce((s, r) => s + r.refundAmount, 0))}</div></div>
    <div class="card stat-card"><div class="stat-top"><div class="stat-icon green">${icon('clock')}</div></div><div class="stat-label">Retur Hari Ini</div><div class="stat-value">${todayReturns.length}</div></div>
  `;
}

async function renderReturnTable() {
  const returns = await get('/api/returns');
  const body = document.getElementById('returnTableBody');
  if (!returns.length) {
    body.innerHTML = `<tr><td colspan="7"><div class="empty-state">${icon('undo', 'icon-lg')}<div class="es-title">Belum ada retur</div></div></td></tr>`;
    return;
  }
  body.innerHTML = returns.map(r => `
    <tr>
      <td>${new Date(r.createdAt).toLocaleString('id-ID')}</td>
      <td><b>${r.invoiceLabel}</b></td>
      <td>${r.customerName}</td>
      <td>${r.items.map(it => it.name + ' x' + it.qty).join(', ')}</td>
      <td>${rupiah(r.refundAmount)}</td>
      <td><span class="badge amber">${r.reason}</span></td>
      <td>${r.userName}</td>
    </tr>
  `).join('');
}

export async function load() {
  await renderReturnStats();
  await renderReturnTable();
}

export function init() {
  document.getElementById('openReturnSearchBtn').addEventListener('click', openReturnSearchModal);
  // tombol "Retur" di halaman Transaksi memicu event ini lewat bus
  on('transaksi:go-return', (e) => returnFromTransaction(e.detail));
}

export default { id: 'retur', template, init, load };
