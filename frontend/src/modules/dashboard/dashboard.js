import { getCached } from '../../shared/api.js';
import { icon } from '../../shared/icons.js';
import { rupiah } from '../../shared/format.js';
import { barChart, emptyMini } from '../../shared/charts.js';

export const template = `
<section class="view active" id="view-dashboard">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle" id="todayDateLabel">Ringkasan operasional hari ini</div>
      </div>
    </div>

    <div class="stat-grid" id="statGrid">
      <div class="card stat-card"><div class="skeleton skeleton-card"></div></div>
      <div class="card stat-card"><div class="skeleton skeleton-card"></div></div>
      <div class="card stat-card"><div class="skeleton skeleton-card"></div></div>
      <div class="card stat-card"><div class="skeleton skeleton-card"></div></div>
    </div>

    <div class="dash-grid">
      <div class="card card-pad">
        <div class="card-title-row"><h3>Penjualan 7 Hari Terakhir</h3></div>
        <div class="chart-wrap" id="dailyChart"></div>
      </div>
      <div class="card card-pad">
        <div class="card-title-row"><h3>Penjualan Mingguan</h3></div>
        <div class="chart-wrap" id="weeklyChart"></div>
      </div>
    </div>

    <div class="widget-grid">
      <div class="card card-pad">
        <div class="card-title-row"><h3>Produk Terlaris</h3></div>
        <div class="mini-list" id="topProductsList"></div>
      </div>
      <div class="card card-pad">
        <div class="card-title-row"><h3>Kasir Teraktif Hari Ini</h3></div>
        <div class="mini-list" id="cashierActivityList"></div>
      </div>
      <div class="card card-pad">
        <div class="card-title-row"><h3>Produk Hampir Habis</h3></div>
        <div class="mini-list" id="lowStockList"></div>
      </div>
      <div class="card card-pad">
        <div class="card-title-row"><h3>Aktivitas Terbaru</h3></div>
        <div class="mini-list" id="recentActivityList"></div>
      </div>
    </div>
  </div>
</section>
`;

export async function load() {
  document.getElementById('todayDateLabel').textContent =
    'Ringkasan operasional ' + new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // TTL pendek (10s): dashboard sering dibuka berulang, tapi datanya
  // berubah tiap ada transaksi baru -> cache singkat = tetap cepat
  // tanpa menampilkan data yang terlalu basi.
  const d = await getCached('/api/reports/dashboard', 10_000);

  document.getElementById('statGrid').innerHTML = `
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon blue">${icon('receipt')}</div></div>
      <div class="stat-label">Total Penjualan</div>
      <div class="stat-value">${rupiah(d.today.revenue)}</div>
      <span class="stat-trend up">${icon('trendUp', 'icon-sm')} Hari ini</span>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon green">${icon('cart')}</div></div>
      <div class="stat-label">Total Transaksi</div>
      <div class="stat-value">${d.today.transactions}</div>
      <span class="stat-trend up">Hari ini</span>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon amber">${icon('package')}</div></div>
      <div class="stat-label">Produk Terjual</div>
      <div class="stat-value">${d.today.itemsSold}</div>
      <span class="stat-trend up">Hari ini</span>
    </div>
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon red">${icon('award')}</div></div>
      <div class="stat-label">Pendapatan Rata-rata/Transaksi</div>
      <div class="stat-value">${rupiah(d.today.transactions ? d.today.revenue / d.today.transactions : 0)}</div>
      <span class="stat-trend up">Hari ini</span>
    </div>
  `;

  document.getElementById('dailyChart').innerHTML = barChart(d.dailySales.map(x => ({ label: x.label, value: x.revenue })));
  document.getElementById('weeklyChart').innerHTML = barChart(d.weeklySales.map(x => ({ label: x.label, value: x.revenue })), '#22C55E');

  document.getElementById('topProductsList').innerHTML = d.topProducts.length ? d.topProducts.map((p, i) => {
    const max = d.topProducts[0].qty || 1;
    return `<div class="mini-row-wrap"><div class="mini-row"><div class="rank">${i + 1}</div><div class="name">${p.name}</div><div class="val">${p.qty} terjual</div></div><div class="progress-track"><div class="progress-fill" style="width:${(p.qty / max) * 100}%;"></div></div></div>`;
  }).join('') : emptyMini('Belum ada data penjualan');

  document.getElementById('cashierActivityList').innerHTML = d.cashierActivity.length ? d.cashierActivity.map((c, i) => `
    <div class="mini-row"><div class="rank">${i + 1}</div><div class="name">${c.name}</div><div class="val">${rupiah(c.revenue)}</div></div>
  `).join('') : emptyMini('Belum ada transaksi hari ini');

  document.getElementById('lowStockList').innerHTML = d.lowStock.length ? d.lowStock.map(p => `
    <div class="mini-row">${icon('alert', 'icon-sm')} <div class="name">${p.name}</div><span class="badge amber">${p.stock} tersisa</span></div>
  `).join('') : emptyMini('Semua stok aman');

  document.getElementById('recentActivityList').innerHTML = d.recentActivity.length ? d.recentActivity.map(t => `
    <div class="mini-row">${icon('clock', 'icon-sm')} <div class="name">#${t.id} oleh ${t.cashierName} (${t.itemCount} item)</div><span class="val">${rupiah(t.total)}</span></div>
  `).join('') : emptyMini('Belum ada aktivitas');
}

export default { id: 'dashboard', template, load };
