import { post, put, del } from '../../shared/api.js';
import { icon, CATEGORY_COLORS } from '../../shared/icons.js';
import { store } from '../../shared/state.js';
import { showToast } from '../../shared/toast.js';
import { refreshCategories, invalidateAndReload } from '../../shared/catalog.js';
import { importExportButtonsHtml, setupImportExport } from '../../shared/importExport.js';

export const template = `
<section class="view" id="view-kategori">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Kategori</div>
        <div class="page-subtitle">Kelola kategori produk</div>
      </div>
      <div class="page-header-actions">
        ${importExportButtonsHtml()}
        <button class="btn btn-primary" id="openAddCategoryBtn">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Tambah Kategori
        </button>
      </div>
    </div>

    <div class="category-grid" id="categoryGrid"></div>
  </div>
</section>

<div class="modal-backdrop" id="categoryModal" style="display:none;">
  <div class="modal-box">
    <h3 id="categoryFormTitle">Tambah Kategori</h3>
    <form id="categoryForm">
      <input type="hidden" id="categoryId">
      <div class="form-field"><label>Nama Kategori</label><input type="text" id="catName" required></div>
      <label style="display:block; font-size:12px; color:var(--text-secondary); margin-bottom:6px; font-weight:500;">Warna</label>
      <div class="color-picker" id="colorPicker"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cancelCategoryForm">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>
  </div>
</div>
`;

let selectedCategoryColor = CATEGORY_COLORS[0];

function renderColorPicker() {
  const wrap = document.getElementById('colorPicker');
  wrap.innerHTML = CATEGORY_COLORS.map(c => `
    <div class="color-dot ${c === selectedCategoryColor ? 'selected' : ''}" data-color="${c}" style="background:${c};">
      ${c === selectedCategoryColor ? icon('check', 'icon-sm') : ''}
    </div>
  `).join('');
  wrap.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => { selectedCategoryColor = dot.dataset.color; renderColorPicker(); });
  });
}

function openCategoryModal() { document.getElementById('categoryModal').style.display = 'flex'; }
function closeCategoryModal() { document.getElementById('categoryModal').style.display = 'none'; }

function resetCategoryForm() {
  document.getElementById('categoryId').value = '';
  document.getElementById('catName').value = '';
  selectedCategoryColor = CATEGORY_COLORS[0];
  renderColorPicker();
  document.getElementById('categoryFormTitle').textContent = 'Tambah Kategori';
}

export function renderCategoryGrid() {
  const grid = document.getElementById('categoryGrid');
  const categories = store.categories;
  if (!categories.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${icon('tag', 'icon-lg')}<div class="es-title">Belum ada kategori</div></div>`;
    return;
  }
  grid.innerHTML = categories.map(c => `
    <div class="card category-card">
      <div class="cat-top-row">
        <div class="cat-swatch" style="background:${c.color};"></div>
        <div>
          <div class="cat-name">${c.name}</div>
          <div class="cat-count">${c.productCount} produk</div>
        </div>
      </div>
      <div class="cat-actions">
        <button class="btn btn-secondary btn-sm" data-act="edit" data-id="${c.id}">Edit</button>
        ${c.name !== 'Umum' ? `<button class="btn btn-ghost btn-sm" data-act="delete" data-id="${c.id}" style="color:var(--color-danger);">Hapus</button>` : ''}
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const c = categories.find(x => x.id === id);
      if (btn.dataset.act === 'edit') {
        document.getElementById('categoryId').value = c.id;
        document.getElementById('catName').value = c.name;
        selectedCategoryColor = c.color;
        renderColorPicker();
        document.getElementById('categoryFormTitle').textContent = 'Edit Kategori';
        openCategoryModal();
      } else if (btn.dataset.act === 'delete') {
        if (!confirm(`Hapus kategori "${c.name}"? Produk di kategori ini akan dipindahkan ke "Umum".`)) return;
        try {
          await del('/api/categories/' + id);
          showToast('Kategori dihapus, produk dipindahkan ke Umum', 'success');
          await invalidateAndReload('categories');
          await invalidateAndReload('products');
          renderCategoryGrid();
        } catch (err) { showToast(err.message, 'error'); }
      }
    });
  });
}

function setupCategoryForm() {
  document.getElementById('openAddCategoryBtn').addEventListener('click', () => {
    resetCategoryForm();
    openCategoryModal();
  });
  document.getElementById('cancelCategoryForm').addEventListener('click', closeCategoryModal);
  document.getElementById('categoryModal').addEventListener('click', (e) => {
    if (e.target.id === 'categoryModal') closeCategoryModal();
  });
  document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('categoryId').value;
    const payload = { name: document.getElementById('catName').value, color: selectedCategoryColor };
    try {
      if (id) { await put('/api/categories/' + id, payload); showToast('Kategori diperbarui', 'success'); }
      else { await post('/api/categories', payload); showToast('Kategori ditambahkan', 'success'); }
      closeCategoryModal();
      await invalidateAndReload('categories');
      await invalidateAndReload('products');
      renderCategoryGrid();
    } catch (err) { showToast(err.message, 'error'); }
  });
}

function setupCategoryImportExport() {
  setupImportExport({
    filename: 'kategori',
    headers: ['Nama', 'Warna'],
    getExportRows: () => store.categories.map(c => [c.name, c.color]),
    onImport: async (rows) => {
      let success = 0, failed = 0;
      for (const row of rows) {
        const name = row['Nama'] ?? row['name'] ?? row['Name'];
        const color = row['Warna'] ?? row['color'] ?? row['Color'] ?? '#2563EB';
        if (!name) { failed++; continue; }
        try {
          await post('/api/categories', { name: String(name), color: String(color) });
          success++;
        } catch (err) { failed++; }
      }
      await invalidateAndReload('categories');
      renderCategoryGrid();
      showToast(`Import selesai: ${success} berhasil${failed ? `, ${failed} gagal` : ''}`, failed ? 'error' : 'success');
    },
  });
}

export async function load() {
  await refreshCategories();
  renderCategoryGrid();
}

export function init() {
  setupCategoryForm();
  setupCategoryImportExport();
}

export default { id: 'kategori', template, init, load };
