// ============================================================
// State bersama antar modul. Di app.js lama, semua ini adalah
// `let` global yang tersebar di seluruh file 2000+ baris.
// Di sini dikumpulkan satu tempat supaya jelas datanya apa saja,
// tapi tiap modul FITUR tetap simpan state khusus miliknya sendiri
// di file modul masing-masing (mis. cart, txState ada di modul
// kasir/transaksi, bukan di sini) — supaya modul tetap independen.
// ============================================================

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', mvp: true },
  { id: 'kasir', label: 'Kasir', icon: 'cart', mvp: true },
  { id: 'produk', label: 'Produk', icon: 'package', mvp: true },
  { id: 'kategori', label: 'Kategori', icon: 'tag', mvp: true },
  { id: 'pelanggan', label: 'Pelanggan', icon: 'users', mvp: true },
  { id: 'transaksi', label: 'Transaksi', icon: 'receipt', mvp: true },
  { id: 'retur', label: 'Retur', icon: 'undo', mvp: true },
  { id: 'stok', label: 'Stok', icon: 'boxes', mvp: true },
  { id: 'laporan', label: 'Laporan', icon: 'chart', mvp: true },
  { id: 'pengaturan', label: 'Pengaturan', icon: 'settings', mvp: true },
];

export const MENU_ACCESS_KEYS = [
  'dashboard', 'kasir', 'produk', 'kategori', 'pelanggan',
  'transaksi', 'retur', 'stok', 'laporan',
];

// Data acuan yang dipakai lintas modul (produk dipakai di kasir & laporan,
// customers dipakai di kasir & pelanggan, dst).
export const store = {
  currentUser: null,
  appSettings: {
    storeName: 'Kasir Cafe',
    storeAddress: '',
    storePhone: '',
    receiptFooter: 'Terima kasih atas kunjungan Anda!',
    defaultTaxPercent: 0,
    lowStockThreshold: 15,
    menuAccess: Object.fromEntries(MENU_ACCESS_KEYS.map(k => [k, true])),
  },
  products: [],
  categories: [],
  customers: [],
  activeView: 'dashboard',
};

export function getEffectiveMenuAccess(user) {
  const general = store.appSettings.menuAccess || {};
  if (user && user.menuAccessOverride) {
    const merged = { ...general };
    MENU_ACCESS_KEYS.forEach(k => {
      if (user.menuAccessOverride[k] != null) merged[k] = !!user.menuAccessOverride[k];
    });
    return merged;
  }
  return general;
}

export function canAccessMenu(id) {
  const user = store.currentUser;
  if (!user) return true;
  if (user.role === 'admin') return true;
  if (id === 'pengaturan') return true;
  const ma = getEffectiveMenuAccess(user);
  return ma[id] !== false;
}

export function getDefaultView() {
  const found = NAV_ITEMS.find(item => canAccessMenu(item.id));
  return found ? found.id : 'pengaturan';
}
