import { post, put, del } from '../../shared/api.js';
import { icon } from '../../shared/icons.js';
import { rupiah } from '../../shared/format.js';
import { store } from '../../shared/state.js';
import { showToast } from '../../shared/toast.js';
import { invalidateAndReload } from '../../shared/catalog.js';
import { on } from '../../shared/bus.js';
import { importExportButtonsHtml, setupImportExport } from '../../shared/importExport.js';

export const template = `
<section class="view" id="view-produk">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Produk</div>
        <div class="page-subtitle">Kelola daftar produk dan stok</div>
      </div>
      <div class="page-header-actions">
        ${importExportButtonsHtml()}
        <button class="btn btn-primary" id="openAddProductBtn">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Tambah Produk
        </button>
      </div>
    </div>

    <div class="pos-toolbar">
      <div class="search-box">
        <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="productSearch" placeholder="Cari produk...">
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table tbl-produk">
        <thead><tr><th>Gambar</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Favorit</th><th>Aksi</th></tr></thead>
        <tbody id="productTableBody"></tbody>
      </table>
    </div>
  </div>
</section>

<div class="modal-backdrop" id="productModal" style="display:none;">
  <div class="modal-box xwide">
    <h3 id="productFormTitle">Tambah Produk</h3>
    <form id="productForm">
      <input type="hidden" id="productId">
      <div class="form-field" style="margin-bottom:14px;">
        <label>Gambar Produk</label>
        <div class="image-upload-row">
          <div class="image-preview-box" id="pImagePreviewBox">
            <img id="pImagePreview" style="display:none;" alt="Preview produk">
            <span id="pImagePlaceholder"><svg class="icon-lg" viewBox="0 0 24 24" style="color:#cbd5e1;"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg></span>
          </div>
          <div class="image-upload-actions">
            <input type="file" id="pImageInput" accept="image/*" style="display:none;">
            <button type="button" class="btn btn-ghost btn-sm" id="pImageUploadBtn">Pilih Gambar</button>
            <button type="button" class="btn btn-ghost btn-sm" id="pImageRemoveBtn" style="display:none;">Hapus Gambar</button>
            <span class="field-hint">Format JPG/PNG, otomatis dikompres agar hemat penyimpanan.</span>
          </div>
        </div>
        <input type="hidden" id="pImageData">
      </div>
      <div class="form-grid-4">
        <div class="form-field"><label>Nama Produk</label><input type="text" id="pName" required></div>
        <div class="form-field"><label>Kategori</label><select id="pCategory"></select></div>
        <div class="form-field"><label>Harga (Rp)</label><input type="number" id="pPrice" required></div>
        <div class="form-field"><label>Stok</label><input type="number" id="pStock" required></div>
      </div>
      <label style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:14px;">
        <input type="checkbox" id="pFavorite" style="width:16px;height:16px;"> Tandai sebagai produk favorit (tampil di atas halaman Kasir)
      </label>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cancelProductForm">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>
  </div>
</div>
`;

function renderCategoryOptions() {
  const sel = document.getElementById('pCategory');
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = store.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  if (currentVal && store.categories.some(c => c.name === currentVal)) sel.value = currentVal;
}

function openProductModal() { document.getElementById('productModal').style.display = 'flex'; }
function closeProductModal() { document.getElementById('productModal').style.display = 'none'; }

function setProductImagePreview(dataUrl) {
  document.getElementById('pImageData').value = dataUrl || '';
  const img = document.getElementById('pImagePreview');
  const placeholder = document.getElementById('pImagePlaceholder');
  const removeBtn = document.getElementById('pImageRemoveBtn');
  if (dataUrl) {
    img.src = dataUrl;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = '';
  } else {
    img.src = '';
    img.style.display = 'none';
    placeholder.style.display = '';
    removeBtn.style.display = 'none';
  }
}

// Kompresi gambar di sisi browser SEBELUM dikirim ke server -> upload
// lebih cepat & hemat kuota penyimpanan (penting kalau backend Sheets).
function compressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width, height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
            else { width = Math.round(width * maxDim / height); height = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(rawDataUrl); return; }
          ctx.drawImage(img, 0, 0, width, height);
          const out = canvas.toDataURL('image/jpeg', quality);
          resolve(out && out.length > 20 ? out : rawDataUrl);
        } catch (err) {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resetProductForm() {
  document.getElementById('productId').value = '';
  document.getElementById('pName').value = '';
  renderCategoryOptions();
  document.getElementById('pPrice').value = '';
  document.getElementById('pStock').value = '';
  document.getElementById('pFavorite').checked = false;
  setProductImagePreview('');
  document.getElementById('productFormTitle').textContent = 'Tambah Produk';
}

export function renderProductTable() {
  const search = (document.getElementById('productSearch').value || '').toLowerCase();
  const filtered = store.products.filter(p => p.name.toLowerCase().includes(search));
  const body = document.getElementById('productTableBody');
  if (!filtered.length) {
    body.innerHTML = `<tr><td colspan="7"><div class="empty-state">${icon('package', 'icon-lg')}<div class="es-title">Belum ada produk</div></div></td></tr>`;
    return;
  }
  body.innerHTML = filtered.map(p => `
    <tr>
      <td>${p.image ? `<img class="table-thumb" src="${p.image}" alt="${p.name}">` : `<div class="table-thumb-placeholder">${icon('package', 'icon-sm')}</div>`}</td>
      <td><b>${p.name}</b></td>
      <td><span class="badge gray">${p.category}</span></td>
      <td>${rupiah(p.price)}</td>
      <td>${p.stock <= 15 ? `<span class="badge amber">${p.stock}</span>` : p.stock}</td>
      <td>${p.favorite ? `<span class="badge blue">${icon('star', 'icon-sm')} Favorit</span>` : '-'}</td>
      <td>
        <span class="link-action" data-act="edit" data-id="${p.id}">Edit</span>
        <span class="link-action danger" data-act="delete" data-id="${p.id}">Hapus</span>
      </td>
    </tr>
  `).join('');
  body.querySelectorAll('[data-act]').forEach(link => {
    link.addEventListener('click', async () => {
      const id = Number(link.dataset.id);
      const p = store.products.find(x => x.id === id);
      if (link.dataset.act === 'edit') {
        document.getElementById('productId').value = p.id;
        document.getElementById('pName').value = p.name;
        renderCategoryOptions();
        document.getElementById('pCategory').value = p.category;
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pStock').value = p.stock;
        document.getElementById('pFavorite').checked = !!p.favorite;
        setProductImagePreview(p.image || '');
        document.getElementById('productFormTitle').textContent = 'Edit Produk';
        openProductModal();
      } else if (link.dataset.act === 'delete') {
        if (!confirm(`Hapus produk "${p.name}"?`)) return;
        await del('/api/products/' + id);
        showToast('Produk dihapus', 'success');
        await invalidateAndReload('products');
        renderProductTable();
      }
    });
  });
}

function setupProductForm() {
  document.getElementById('openAddProductBtn').addEventListener('click', () => {
    resetProductForm();
    openProductModal();
  });
  document.getElementById('cancelProductForm').addEventListener('click', closeProductModal);
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') closeProductModal();
  });
  document.getElementById('pImageUploadBtn').addEventListener('click', () => document.getElementById('pImageInput').click());
  document.getElementById('pImageRemoveBtn').addEventListener('click', () => setProductImagePreview(''));
  document.getElementById('pImageInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar', 'error'); return; }
    try {
      const dataUrl = await compressImage(file, 480, 0.8);
      setProductImagePreview(dataUrl);
    } catch (err) { showToast('Gagal memproses gambar', 'error'); }
    e.target.value = '';
  });
  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const payload = {
      name: document.getElementById('pName').value,
      category: document.getElementById('pCategory').value,
      price: Number(document.getElementById('pPrice').value),
      stock: Number(document.getElementById('pStock').value),
      favorite: document.getElementById('pFavorite').checked,
      image: document.getElementById('pImageData').value,
    };
    try {
      if (id) { await put('/api/products/' + id, payload); showToast('Produk diperbarui', 'success'); }
      else { await post('/api/products', payload); showToast('Produk ditambahkan', 'success'); }
      closeProductModal();
      await invalidateAndReload('products');
      renderProductTable();
    } catch (err) { showToast(err.message, 'error'); }
  });
  document.getElementById('productSearch').addEventListener('input', renderProductTable);

  // kategori bisa berubah dari modul lain (kategori.js) -> refresh dropdown
  on('catalog:categories-changed', renderCategoryOptions);
}

function setupProductImportExport() {
  setupImportExport({
    filename: 'produk',
    headers: ['Nama', 'Kategori', 'Harga', 'Stok', 'Favorit'],
    getExportRows: () => store.products.map(p => [p.name, p.category, p.price, p.stock, p.favorite ? 'Ya' : 'Tidak']),
    onImport: async (rows) => {
      let success = 0, failed = 0;
      for (const row of rows) {
        const name = row['Nama'] ?? row['name'] ?? row['Name'];
        if (!name) { failed++; continue; }
        const favoriteRaw = String(row['Favorit'] ?? row['favorite'] ?? '').toLowerCase();
        try {
          await post('/api/products', {
            name: String(name),
            category: String(row['Kategori'] ?? row['category'] ?? 'Umum'),
            price: Number(row['Harga'] ?? row['price'] ?? 0),
            stock: Number(row['Stok'] ?? row['stock'] ?? 0),
            favorite: favoriteRaw === 'ya' || favoriteRaw === 'yes' || favoriteRaw === 'true' || favoriteRaw === '1',
          });
          success++;
        } catch (err) { failed++; }
      }
      await invalidateAndReload('products');
      renderProductTable();
      showToast(`Import selesai: ${success} berhasil${failed ? `, ${failed} gagal` : ''}`, failed ? 'error' : 'success');
    },
  });
}

export async function load() {
  renderProductTable();
}

export function init() {
  setupProductForm();
  setupProductImportExport();
}

export default { id: 'produk', template, init, load };
