import { get } from '../../shared/api.js';
import { icon } from '../../shared/icons.js';
import { rupiah, isoDate } from '../../shared/format.js';
import { showToast } from '../../shared/toast.js';

export const template = `
<section class="view" id="view-laporan">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Laporan</div>
        <div class="page-subtitle">Ringkasan performa penjualan pada rentang tanggal tertentu</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-ghost" id="reportExportBtn">Export CSV</button>
        <button class="btn btn-ghost" id="reportPrintBtn">Cetak</button>
      </div>
    </div>

    <div class="card card-pad" style="margin-bottom:16px;">
      <div class="report-filter-row">
        <div class="report-presets" id="reportPresets">
          <button class="preset-btn active" data-preset="today">Hari Ini</button>
          <button class="preset-btn" data-preset="yesterday">Kemarin</button>
          <button class="preset-btn" data-preset="week">Minggu Ini</button>
          <button class="preset-btn" data-preset="month">Bulan Ini</button>
          <button class="preset-btn" data-preset="lastmonth">Bulan Lalu</button>
        </div>
        <div class="report-daterange">
          <input type="date" id="reportFrom">
          <span>s/d</span>
          <input type="date" id="reportTo">
          <button class="btn btn-primary" id="reportApplyBtn">Terapkan</button>
        </div>
      </div>
    </div>

    <div class="stat-grid" id="reportStatGrid"></div>

    <div class="report-grid-2">
      <div class="card card-pad">
        <h3 style="font-size:14.5px; margin-bottom:12px;">Penjualan per Kategori</h3>
        <div id="reportCategoryBars"></div>
      </div>
      <div class="card card-pad">
        <h3 style="font-size:14.5px; margin-bottom:12px;">Penjualan per Metode Pembayaran</h3>
        <div id="reportPaymentBars"></div>
      </div>
    </div>

    <div class="card-title-row" style="margin-top:16px;"><h3 style="font-size:15px;">Produk Terlaris</h3></div>
    <div class="table-wrap" style="margin-bottom:20px;">
      <table class="data-table tbl-lap-top">
        <thead><tr><th>#</th><th>Produk</th><th>Qty Terjual</th><th>Total Pendapatan</th></tr></thead>
        <tbody id="reportTopProductsBody"></tbody>
      </table>
    </div>

    <div class="card-title-row"><h3 style="font-size:15px;">Performa Kasir</h3></div>
    <div class="table-wrap">
      <table class="data-table tbl-lap-kasir">
        <thead><tr><th>Kasir</th><th>Jumlah Transaksi</th><th>Total Pendapatan</th><th>Rata-rata / Transaksi</th></tr></thead>
        <tbody id="reportCashierBody"></tbody>
      </table>
    </div>
  </div>
</section>
`;

let reportState = { from: '', to: '', preset: 'today' };
let lastReportData = null;

function applyReportPreset(preset) {
  const now = new Date();
  let from = new Date(now), to = new Date(now);
  if (preset === 'today') {
    // from = to = today
  } else if (preset === 'yesterday') {
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);
  } else if (preset === 'week') {
    const day = (now.getDay() + 6) % 7; // Senin = 0
    from.setDate(now.getDate() - day);
  } else if (preset === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (preset === 'lastmonth') {
    from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    to = new Date(now.getFullYear(), now.getMonth(), 0);
  }
  reportState.from = isoDate(from);
  reportState.to = isoDate(to);
  document.getElementById('reportFrom').value = reportState.from;
  document.getElementById('reportTo').value = reportState.to;
  loadReportRange();
}

async function loadReportRange() {
  const data = await get(`/api/reports/range?from=${reportState.from}&to=${reportState.to}`);
  lastReportData = data;
  renderReportStats(data);
  renderReportCategoryBars(data);
  renderReportPaymentBars(data);
  renderReportTopProducts(data);
  renderReportCashier(data);
}

function growthBadge(pct) {
  const cls = pct > 0 ? 'green' : (pct < 0 ? 'red' : 'gray');
  const arrow = pct > 0 ? '▲' : (pct < 0 ? '▼' : '–');
  return `<span class="growth-badge ${cls}">${arrow} ${Math.abs(pct)}%</span>`;
}

function renderReportStats(data) {
  document.getElementById('reportStatGrid').innerHTML = `
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${icon('receipt')}</div></div>
      <div class="stat-label">Total Pendapatan</div>
      <div class="stat-value" style="font-size:20px;">${rupiah(data.summary.totalRevenue)}</div>
      <div class="stat-trend">${growthBadge(data.growth.revenue)} <span class="trend-note">vs periode sebelumnya</span></div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon green">${icon('cart')}</div></div>
      <div class="stat-label">Jumlah Transaksi</div>
      <div class="stat-value">${data.summary.totalTransactions}</div>
      <div class="stat-trend">${growthBadge(data.growth.transactions)} <span class="trend-note">vs periode sebelumnya</span></div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon amber">${icon('package')}</div></div>
      <div class="stat-label">Item Terjual</div>
      <div class="stat-value">${data.summary.totalItemsSold}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${icon('trendUp')}</div></div>
      <div class="stat-label">Rata-rata / Transaksi</div>
      <div class="stat-value" style="font-size:18px;">${rupiah(data.summary.avgTransactionValue)}</div>
    </div>
  `;
}

function renderReportCategoryBars(data) {
  const el = document.getElementById('reportCategoryBars');
  if (!data.byCategory.length) { el.innerHTML = `<div class="empty-state">${icon('tag', 'icon-lg')}<div class="es-title">Belum ada data</div></div>`; return; }
  const max = Math.max(...data.byCategory.map(c => c.revenue), 1);
  el.innerHTML = data.byCategory.map(c => `
    <div class="report-bar-row">
      <div class="report-bar-label"><span>${c.category}</span><span>${rupiah(c.revenue)}</span></div>
      <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round(c.revenue / max * 100)}%"></div></div>
    </div>
  `).join('');
}

function renderReportPaymentBars(data) {
  const el = document.getElementById('reportPaymentBars');
  if (!data.byPaymentMethod.length) { el.innerHTML = `<div class="empty-state">${icon('receipt', 'icon-lg')}<div class="es-title">Belum ada data</div></div>`; return; }
  const max = Math.max(...data.byPaymentMethod.map(p => p.revenue), 1);
  const labelMap = { cash: 'Tunai', qris: 'QRIS', debit: 'Kartu Debit', credit: 'Kartu Kredit' };
  el.innerHTML = data.byPaymentMethod.map(p => `
    <div class="report-bar-row">
      <div class="report-bar-label"><span>${labelMap[p.method] || p.method} (${p.count}x)</span><span>${rupiah(p.revenue)}</span></div>
      <div class="report-bar-track"><div class="report-bar-fill amber" style="width:${Math.round(p.revenue / max * 100)}%"></div></div>
    </div>
  `).join('');
}

function renderReportTopProducts(data) {
  const body = document.getElementById('reportTopProductsBody');
  if (!data.topProducts.length) {
    body.innerHTML = `<tr><td colspan="4"><div class="empty-state">${icon('package', 'icon-lg')}<div class="es-title">Belum ada penjualan pada periode ini</div></div></td></tr>`;
    return;
  }
  body.innerHTML = data.topProducts.map((p, i) => `
    <tr><td>${i + 1}</td><td>${p.name}</td><td>${p.qty}</td><td>${rupiah(p.revenue)}</td></tr>
  `).join('');
}

function renderReportCashier(data) {
  const body = document.getElementById('reportCashierBody');
  if (!data.cashierPerformance.length) {
    body.innerHTML = `<tr><td colspan="4"><div class="empty-state">${icon('users', 'icon-lg')}<div class="es-title">Belum ada data kasir</div></div></td></tr>`;
    return;
  }
  body.innerHTML = data.cashierPerformance.map(c => `
    <tr><td>${c.name}</td><td>${c.transactions}</td><td>${rupiah(c.revenue)}</td><td>${rupiah(Math.round(c.revenue / c.transactions))}</td></tr>
  `).join('');
}

function exportReportCsv() {
  if (!lastReportData) { showToast('Belum ada data laporan', 'error'); return; }
  const d = lastReportData;
  let rows = [];
  rows.push(['Laporan Penjualan', `${d.from} s/d ${d.to}`]);
  rows.push([]);
  rows.push(['Ringkasan']);
  rows.push(['Total Pendapatan', d.summary.totalRevenue]);
  rows.push(['Jumlah Transaksi', d.summary.totalTransactions]);
  rows.push(['Item Terjual', d.summary.totalItemsSold]);
  rows.push(['Rata-rata / Transaksi', d.summary.avgTransactionValue]);
  rows.push([]);
  rows.push(['Penjualan per Kategori']);
  rows.push(['Kategori', 'Qty', 'Pendapatan']);
  d.byCategory.forEach(c => rows.push([c.category, c.qty, c.revenue]));
  rows.push([]);
  rows.push(['Penjualan per Metode Pembayaran']);
  rows.push(['Metode', 'Jumlah Transaksi', 'Pendapatan']);
  d.byPaymentMethod.forEach(p => rows.push([p.method, p.count, p.revenue]));
  rows.push([]);
  rows.push(['Produk Terlaris']);
  rows.push(['Produk', 'Qty', 'Pendapatan']);
  d.topProducts.forEach(p => rows.push([p.name, p.qty, p.revenue]));
  rows.push([]);
  rows.push(['Performa Kasir']);
  rows.push(['Kasir', 'Transaksi', 'Pendapatan']);
  d.cashierPerformance.forEach(c => rows.push([c.name, c.transactions, c.revenue]));

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-${d.from}_${d.to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Laporan CSV berhasil diunduh', 'success');
}

export async function load() {
  const today = new Date();
  reportState.from = isoDate(today);
  reportState.to = isoDate(today);
  document.getElementById('reportFrom').value = reportState.from;
  document.getElementById('reportTo').value = reportState.to;
  await loadReportRange();
}

export function init() {
  document.getElementById('reportPresets').querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#reportPresets .preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyReportPreset(btn.dataset.preset);
    });
  });
  document.getElementById('reportApplyBtn').addEventListener('click', () => {
    document.querySelectorAll('#reportPresets .preset-btn').forEach(b => b.classList.remove('active'));
    reportState.from = document.getElementById('reportFrom').value || reportState.from;
    reportState.to = document.getElementById('reportTo').value || reportState.to;
    loadReportRange();
  });
  document.getElementById('reportExportBtn').addEventListener('click', exportReportCsv);
  document.getElementById('reportPrintBtn').addEventListener('click', () => window.print());
}

export default { id: 'laporan', template, init, load };
