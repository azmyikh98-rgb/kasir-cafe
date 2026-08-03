// ============================================================
// Data referensi (produk, kategori, pelanggan) dipakai oleh
// BANYAK modul fitur (kasir, produk, kategori, pelanggan,
// laporan, dst). Supaya tidak duplikat fetch & supaya konsisten,
// data ini disimpan di satu tempat (shared/state.js -> store)
// dan di-refresh lewat fungsi di sini. Modul fitur cukup
// `import { store } from '../../shared/state.js'` untuk baca,
// dan panggil refreshX() setelah melakukan perubahan (create/
// update/delete), lalu emit event supaya modul lain ikut update
// tampilannya masing-masing.
// ============================================================
import { get, invalidateCache } from './api.js';
import { store } from './state.js';
import { emit } from './bus.js';

export async function refreshProducts() {
  store.products = await get('/api/products');
  emit('catalog:products-changed');
  return store.products;
}

export async function refreshCategories() {
  store.categories = await get('/api/categories');
  emit('catalog:categories-changed');
  return store.categories;
}

export async function refreshCustomers(search) {
  const qs = search ? '?search=' + encodeURIComponent(search) : '';
  store.customers = await get('/api/customers' + qs);
  emit('catalog:customers-changed');
  return store.customers;
}

/** Panggil setelah produk/kategori/pelanggan berubah lewat form di modul manapun. */
export async function invalidateAndReload(kind) {
  invalidateCache('/api/' + kind);
  if (kind === 'products') return refreshProducts();
  if (kind === 'categories') return refreshCategories();
  if (kind === 'customers') return refreshCustomers();
}
