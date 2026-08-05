import './styles/base.css';
import './styles/dashboard.css';
import './styles/kasir.css';
import './styles/produk.css';
import './styles/kategori.css';
import './styles/pelanggan.css';
import './styles/transaksi.css';
import './styles/stok.css';
import './styles/retur.css';
import './styles/laporan.css';
import './styles/pengaturan.css';

import { requireSession, paintUserChip, setupLogout } from './modules/auth/session.js';
import { store, getDefaultView } from './shared/state.js';
import { registerModule, renderAllTemplates, initAllModules, switchView } from './router.js';
import { get } from './shared/api.js';
import { initSidebar } from './modules/sidebar/sidebar.js';

import dashboard from './modules/dashboard/dashboard.js';
import kasir, { renderProductGrid } from './modules/kasir/kasir.js';
import produk from './modules/produk/produk.js';
import kategori from './modules/kategori/kategori.js';
import pelanggan from './modules/pelanggan/pelanggan.js';
import transaksi from './modules/transaksi/transaksi.js';
import stok from './modules/stok/stok.js';
import retur from './modules/retur/retur.js';
import laporan from './modules/laporan/laporan.js';
import pengaturan from './modules/pengaturan/pengaturan.js';

async function bootstrap() {
  const user = await requireSession();
  if (!user) return; // sudah diarahkan ke ./login.html

  store.appSettings = await get('/api/settings');
  document.querySelector('.brand-text').textContent = store.appSettings.storeName || 'Kasir Cafe';
  document.title = store.appSettings.storeName || 'Kasir Cafe';
  paintUserChip(user);

  // Daftarkan semua modul fitur (urutan menentukan urutan render di DOM)
  [dashboard, kasir, produk, kategori, pelanggan, transaksi, stok, retur, laporan, pengaturan]
    .forEach(registerModule);

  renderAllTemplates(document.getElementById('mainViews'));

  initSidebar();
  initAllModules();
  setupLogout();

  document.getElementById('kasirFab').addEventListener('click', () => switchView('kasir'));

  document.getElementById('globalSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      switchView('kasir');
      document.getElementById('posSearch').value = e.target.value;
      renderProductGrid();
    }
  });

  switchView(getDefaultView());
}

// Kalau ada apa pun yang gagal saat memuat aplikasi (mis. Apps Script belum
// siap, koneksi ke Google Sheets bermasalah, dsb), JANGAN biarkan halaman
// jadi kosong-blank tanpa penjelasan -- tampilkan pesan yang jelas + tombol
// coba lagi, supaya masalahnya kelihatan dan gampang dilaporkan/didiagnosis.
bootstrap().catch((err) => {
  console.error('Gagal memuat aplikasi:', err);
  const stack = (err && err.stack) ? String(err.stack).replace(/</g, '&lt;') : 'Tidak ada detail teknis tambahan.';
  document.body.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; font-family:system-ui,sans-serif; background:#F8FAFC;">
      <div style="max-width:560px; text-align:center; width:100%;">
        <div style="font-size:40px; margin-bottom:12px;">⚠️</div>
        <h2 style="margin:0 0 8px; color:#0F172A;">Gagal memuat aplikasi</h2>
        <p style="color:#64748B; font-size:14px; margin:0 0 16px;">${(err && err.message) || 'Terjadi kesalahan tak terduga.'}</p>
        <p style="color:#94A3B8; font-size:12.5px; margin:0 0 20px;">Kemungkinan penyebab: URL Apps Script di <code>config.js</code> belum benar, deployment Apps Script belum di-authorize, koneksi internet bermasalah, atau ada bug di kode.</p>
        <button onclick="location.reload()" style="background:#2563EB; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-size:14px; cursor:pointer; margin-bottom:20px;">Coba Lagi</button>
        <details style="text-align:left; background:#0F172A; border-radius:8px; padding:12px 16px;">
          <summary style="color:#94A3B8; font-size:12px; cursor:pointer;">Detail teknis (untuk debugging)</summary>
          <pre style="color:#E2E8F0; font-size:11px; white-space:pre-wrap; word-break:break-word; margin-top:10px; line-height:1.6;">${stack}</pre>
        </details>
      </div>
    </div>
  `;
});
