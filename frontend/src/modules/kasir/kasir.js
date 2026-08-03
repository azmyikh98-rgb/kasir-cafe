import { post } from '../../shared/api.js';
import { icon, ICONS } from '../../shared/icons.js';
import { rupiah, timeAgo } from '../../shared/format.js';
import { store } from '../../shared/state.js';
import { showToast } from '../../shared/toast.js';
import { refreshProducts, invalidateAndReload } from '../../shared/catalog.js';
import { switchView } from '../../router.js';
import { on } from '../../shared/bus.js';

export const template = `
<section class="view" id="view-kasir">
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Kasir</div>
        <div class="page-subtitle">Pilih produk, atur keranjang, lalu proses pembayaran</div>
      </div>
    </div>

    <div class="pos-grid">
      <div class="pos-products">
        <div class="pos-toolbar">
          <div class="search-box">
            <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            <input type="text" id="posSearch" placeholder="Cari produk atau scan barcode... (Enter untuk tambah)">
          </div>
        </div>
        <div class="category-pills" id="categoryTabs"></div>

        <button class="held-orders-banner" id="heldOrdersBtn" style="display:none;">
          <span class="hob-left">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>Ada <span id="heldCountNum">0</span> pesanan tertahan</span>
          </span>
          <span class="hob-right">
            Lihat
            <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </button>

        <button class="cart-bar" id="cartBarBtn">
          <span class="cart-bar-left">
            <span class="cart-bar-icon">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </span>
            <span class="cart-bar-customer" id="cartBarCustomer">Pelanggan Umum</span>
            <span class="badge blue" id="cartBarCount">0 item</span>
          </span>
          <span class="cart-bar-right">
            <span class="cart-bar-total" id="cartBarTotal">Rp 0</span>
            <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          </span>
        </button>

        <div class="product-grid" id="productGrid"></div>
      </div>
    </div>

    <div class="modal-backdrop" id="cartModal" style="display:none;">
      <div class="card cart-panel">
        <div class="cart-head">
          <h3>Keranjang</h3>
          <div class="cart-head-right">
            <span class="badge blue" id="cartCountBadge">0 item</span>
            <button class="btn-icon-sm" id="closeCartModalBtn" title="Tutup">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <div class="cart-body" id="cartItems">
          <div class="cart-empty">
            <svg class="icon-lg" viewBox="0 0 24 24" style="color:#cbd5e1;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <div>Keranjang masih kosong</div>
            <div style="font-size:11.5px;">Klik produk di sebelah kiri untuk mulai</div>
          </div>
        </div>
        <div class="cart-summary">
          <div class="form-field customer-select-wrap">
            <label>Pelanggan</label>
            <div class="customer-select-box" id="customerSelectBox">
              <svg class="icon-sm" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span id="customerSelectLabel">Pelanggan Umum</span>
            </div>
            <div class="customer-dropdown" id="customerDropdown" style="display:none;"></div>
          </div>
          <div class="form-field" id="ordererNameRow">
            <label>Nama Pemesan <span style="color:var(--color-danger);">*</span></label>
            <input type="text" id="ordererName" placeholder="mis. Budi" maxlength="60">
          </div>
          <div class="form-row-2">
            <div class="form-field">
              <label>Tipe Pesanan</label>
              <select id="orderType">
                <option value="dine-in">Dine-in</option>
                <option value="takeaway">Takeaway</option>
              </select>
            </div>
            <div class="form-field" id="tableNumberRow">
              <label>Nomor Meja</label>
              <input type="text" id="tableNumber" placeholder="mis. 5">
            </div>
          </div>
          <div class="sum-row"><span>Subtotal</span><span id="sumSubtotal">Rp 0</span></div>
          <div class="form-row-2">
            <div class="form-field">
              <label>Diskon (Rp)</label>
              <input type="number" id="discountInput" placeholder="0" value="0">
            </div>
            <div class="form-field">
              <label>Pajak (%)</label>
              <input type="number" id="taxPercentInput" placeholder="0" value="0">
            </div>
          </div>
          <div class="sum-row grand"><span>Grand Total</span><span id="sumTotal">Rp 0</span></div>

          <div class="form-row-2">
            <div class="form-field">
              <label>Metode Pembayaran</label>
              <select id="paymentMethod">
                <option value="cash">Tunai</option>
                <option value="qris">QRIS</option>
                <option value="debit">Kartu Debit</option>
              </select>
            </div>
            <div class="form-field" id="cashGivenRow">
              <label>Uang Diterima</label>
              <input type="number" id="cashGiven" placeholder="0">
            </div>
          </div>
          <div class="sum-row" id="changeRow" style="display:none;"><span>Kembalian</span><span id="changeAmount" style="font-weight:800;color:var(--color-success);">Rp 0</span></div>

          <div class="cart-actions">
            <button class="btn btn-warning" id="holdBtn" title="F3">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              Hold
            </button>
            <button class="btn btn-danger" id="cancelBtn" title="Esc">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              Batal
            </button>
            <button class="btn btn-primary btn-cta" id="checkoutBtn" title="F2">Bayar Sekarang</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;

// ---- state khusus kasir (tidak perlu dipakai modul lain) ----
let activeCategory = '';
let selectedCustomer = null; // {id, name} atau null = walk-in
let cart = [];
let heldOrders = [];

// ============================================================
// GRID PRODUK & KATEGORI
// ============================================================
function renderCategoryTabs() {
  const cats = store.categories.length ? store.categories.map(c => c.name) : [...new Set(store.products.map(p => p.category))];
  if (activeCategory && !cats.includes(activeCategory)) activeCategory = '';
  const wrap = document.getElementById('categoryTabs');
  wrap.innerHTML = `<span class="pill ${activeCategory === '' ? 'active' : ''}" data-cat="">Semua</span>` +
    cats.map(c => `<span class="pill ${activeCategory === c ? 'active' : ''}" data-cat="${c}">${c}</span>`).join('');
  wrap.querySelectorAll('.pill').forEach(p => p.addEventListener('click', () => {
    activeCategory = p.dataset.cat;
    renderCategoryTabs();
    renderProductGrid();
  }));
}

export function renderProductGrid() {
  const search = document.getElementById('posSearch').value.toLowerCase();
  const grid = document.getElementById('productGrid');
  let filtered = store.products.filter(p => p.name.toLowerCase().includes(search) && (!activeCategory || p.category === activeCategory));
  filtered = filtered.slice().sort((a, b) => (b.favorite === true) - (a.favorite === true));

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${icon('package', 'icon-lg')}<div class="es-title">Produk tidak ditemukan</div><div>Coba kata kunci atau kategori lain</div></div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card ${p.stock <= 0 ? 'out' : ''}" data-id="${p.id}">
      ${p.favorite ? `<span class="fav-star">${icon('star', 'icon-sm')}</span>` : ''}
      <div class="product-thumb">${p.image ? `<img src="${p.image}" alt="${p.name}">` : icon('package', 'icon-lg')}</div>
      <div class="p-name">${p.name}</div>
      <div class="p-cat">${p.category}</div>
      <div class="p-price">${rupiah(p.price)}</div>
      <div class="p-stock ${p.stock <= 15 ? 'low' : ''}">Stok: ${p.stock}</div>
    </div>
  `).join('');
  grid.querySelectorAll('.product-card').forEach(card => card.addEventListener('click', () => addToCart(Number(card.dataset.id))));
}

// ============================================================
// CUSTOMER SELECT (dropdown di dalam panel keranjang)
// ============================================================
function setupCustomerSelect() {
  const box = document.getElementById('customerSelectBox');
  const dropdown = document.getElementById('customerDropdown');
  box.addEventListener('click', async () => {
    const isOpen = dropdown.style.display !== 'none';
    if (isOpen) { dropdown.style.display = 'none'; return; }
    await invalidateAndReload('customers');
    renderCustomerDropdown('');
    dropdown.style.display = 'block';
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.customer-select-wrap')) dropdown.style.display = 'none';
  });
}

function renderCustomerDropdown(search) {
  const dropdown = document.getElementById('customerDropdown');
  dropdown.innerHTML = `
    <input type="text" id="customerSearchInline" placeholder="Cari pelanggan..." value="${search || ''}">
    <div id="customerOptionsList"></div>
    <div class="customer-option add-new" data-act="new">${icon('plus', 'icon-sm')}&nbsp; Tambah Pelanggan Baru</div>
  `;
  const input = dropdown.querySelector('#customerSearchInline');
  input.addEventListener('input', (e) => renderCustomerOptions(e.target.value));
  input.addEventListener('click', (e) => e.stopPropagation());
  const addNew = dropdown.querySelector('[data-act="new"]');
  if (addNew) addNew.addEventListener('click', () => {
    dropdown.style.display = 'none';
    switchView('pelanggan');
    document.getElementById('openAddCustomerBtn').click();
    showToast('Tambahkan pelanggan baru, lalu kembali ke Kasir untuk memilihnya');
  });
  renderCustomerOptions(search);
}

function renderCustomerOptions(search) {
  const dropdown = document.getElementById('customerDropdown');
  const s = (search || '').toLowerCase();
  const filtered = store.customers.filter(c => c.name.toLowerCase().includes(s) || (c.phone || '').includes(s));
  const list = document.getElementById('customerOptionsList');
  list.innerHTML = `
    <div class="customer-option" data-id="">${icon('users', 'icon-sm')}&nbsp; Pelanggan Umum (walk-in)</div>
    ${filtered.map(c => `<div class="customer-option" data-id="${c.id}"><span>${c.name}</span><span class="cust-phone">${c.phone || ''}</span></div>`).join('')}
  `;
  list.querySelectorAll('.customer-option[data-id]').forEach(opt => {
    opt.addEventListener('click', () => {
      const id = opt.dataset.id;
      if (!id) { selectedCustomer = null; }
      else { const c = store.customers.find(x => x.id === Number(id)); selectedCustomer = c ? { id: c.id, name: c.name } : null; }
      document.getElementById('customerSelectLabel').textContent = selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum';
      if (selectedCustomer) document.getElementById('ordererName').value = '';
      updateOrdererNameVisibility();
      updateCartBar();
      dropdown.style.display = 'none';
    });
  });
}

// ============================================================
// KERANJANG / CART
// ============================================================
function updateOrdererNameVisibility() {
  const row = document.getElementById('ordererNameRow');
  if (!row) return;
  row.style.display = selectedCustomer ? 'none' : '';
}

function addToCart(productId) {
  const product = store.products.find(p => p.id === productId);
  if (!product || product.stock <= 0) { showToast('Stok produk habis', 'error'); return; }
  const existing = cart.find(c => c.productId === productId);
  if (existing) {
    if (existing.qty >= product.stock) { showToast('Stok tidak cukup', 'error'); return; }
    existing.qty++;
  } else {
    cart.push({ productId, name: product.name, price: product.price, qty: 1, stock: product.stock });
  }
  renderCart();
}

function renderCart() {
  const el = document.getElementById('cartItems');
  document.getElementById('cartCountBadge').textContent = cart.reduce((s, c) => s + c.qty, 0) + ' item';
  if (cart.length === 0) {
    el.innerHTML = `<div class="cart-empty"><svg class="icon-lg" viewBox="0 0 24 24" style="color:#cbd5e1;">${ICONS.cart}</svg><div>Keranjang masih kosong</div><div style="font-size:11.5px;">Klik produk di sebelah kiri untuk mulai</div></div>`;
  } else {
    el.innerHTML = cart.map((c, i) => `
      <div class="cart-row" data-i="${i}">
        <div class="ci-info">
          <div class="ci-name">${c.name}</div>
          <div class="ci-price">${rupiah(c.price)}</div>
        </div>
        <div class="qty-stepper">
          <button data-act="dec" data-i="${i}">−</button>
          <span class="qv">${c.qty}</span>
          <button data-act="inc" data-i="${i}">+</button>
        </div>
        <div class="ci-subtotal">${rupiah(c.price * c.qty)}</div>
        <div class="ci-remove" data-act="remove" data-i="${i}">${icon('trash', 'icon-sm')}</div>
      </div>
    `).join('');
    el.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        const act = btn.dataset.act;
        if (act === 'inc') { if (cart[i].qty < cart[i].stock) cart[i].qty++; else showToast('Stok tidak cukup', 'error'); renderCart(); }
        else if (act === 'dec') { cart[i].qty--; if (cart[i].qty <= 0) cart.splice(i, 1); renderCart(); }
        else if (act === 'remove') {
          const row = el.querySelector(`.cart-row[data-i="${i}"]`);
          if (row) row.classList.add('removing');
          const removed = cart[i];
          setTimeout(() => { cart.splice(i, 1); renderCart(); }, 180);
          showToast(`${removed.name} dihapus`);
        }
      });
    });
  }
  updateSummary();
}

function updateSummary() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = Number(document.getElementById('discountInput').value || 0);
  const taxPercent = Number(document.getElementById('taxPercentInput').value || 0);
  const taxAmount = Math.max(0, subtotal - discount) * (taxPercent / 100);
  const total = Math.max(0, subtotal - discount + taxAmount);

  document.getElementById('sumSubtotal').textContent = rupiah(subtotal);
  document.getElementById('sumTotal').textContent = rupiah(total);

  const method = document.getElementById('paymentMethod').value;
  const changeRow = document.getElementById('changeRow');
  if (method === 'cash' && cart.length) {
    const given = Number(document.getElementById('cashGiven').value || 0);
    changeRow.style.display = '';
    document.getElementById('changeAmount').textContent = rupiah(Math.max(0, given - total));
  } else {
    changeRow.style.display = 'none';
  }
  updateCartBar();
  return { subtotal, discount, taxAmount, total };
}

function updateCartBar() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = Number(document.getElementById('discountInput').value || 0);
  const taxPercent = Number(document.getElementById('taxPercentInput').value || 0);
  const taxAmount = Math.max(0, subtotal - discount) * (taxPercent / 100);
  const total = Math.max(0, subtotal - discount + taxAmount);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartBarCount').textContent = count + ' item';
  const ordererName = document.getElementById('ordererName').value.trim();
  document.getElementById('cartBarCustomer').textContent = selectedCustomer ? selectedCustomer.name : (ordererName || 'Pelanggan Umum');
  document.getElementById('cartBarTotal').textContent = rupiah(total);
}

function openCartModal() { document.getElementById('cartModal').style.display = ''; }
function closeCartModal() { document.getElementById('cartModal').style.display = 'none'; }

function cancelOrder() {
  if (!cart.length) return;
  if (!confirm('Batalkan pesanan ini? Keranjang akan dikosongkan.')) return;
  cart = [];
  document.getElementById('discountInput').value = 0;
  document.getElementById('taxPercentInput').value = store.appSettings.defaultTaxPercent || 0;
  document.getElementById('cashGiven').value = '';
  document.getElementById('ordererName').value = '';
  renderCart();
  closeCartModal();
  showToast('Pesanan dibatalkan');
}

// ============================================================
// PESANAN TERTAHAN (HOLD)
// ============================================================
function holdOrder() {
  if (!cart.length) { showToast('Keranjang masih kosong', 'error'); return; }
  heldOrders.push({
    id: Date.now(),
    cart: [...cart],
    customer: selectedCustomer ? { ...selectedCustomer } : null,
    ordererName: document.getElementById('ordererName').value.trim(),
    discount: Number(document.getElementById('discountInput').value || 0),
    taxPercent: Number(document.getElementById('taxPercentInput').value || 0),
    orderType: document.getElementById('orderType').value,
    tableNumber: document.getElementById('tableNumber').value,
    time: new Date().toISOString(),
  });
  cart = [];
  selectedCustomer = null;
  document.getElementById('customerSelectLabel').textContent = 'Pelanggan Umum';
  document.getElementById('ordererName').value = '';
  updateOrdererNameVisibility();
  document.getElementById('discountInput').value = 0;
  document.getElementById('taxPercentInput').value = store.appSettings.defaultTaxPercent || 0;
  document.getElementById('tableNumber').value = '';
  renderCart();
  renderHeldBadge();
  closeCartModal();
  showToast(`Pesanan ditahan (${heldOrders.length} pesanan ditahan)`);
}

function renderHeldBadge() {
  const btn = document.getElementById('heldOrdersBtn');
  if (!btn) return;
  if (heldOrders.length) {
    btn.style.display = '';
    document.getElementById('heldCountNum').textContent = heldOrders.length;
  } else {
    btn.style.display = 'none';
  }
}

function openHeldOrdersModal() {
  const modal = document.getElementById('heldOrdersModal');
  if (!heldOrders.length) { modal.innerHTML = ''; return; }
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box wide">
        <h3>Pesanan Tertahan</h3>
        <div class="held-order-list">
          ${heldOrders.map(h => {
            const subtotal = h.cart.reduce((s, c) => s + c.price * c.qty, 0);
            const taxAmount = Math.max(0, subtotal - h.discount) * (h.taxPercent / 100);
            const total = Math.max(0, subtotal - h.discount + taxAmount);
            const itemCount = h.cart.reduce((s, c) => s + c.qty, 0);
            return `
              <div class="held-order-row">
                <div class="ho-info">
                  <div class="ho-title">${h.customer ? h.customer.name : (h.ordererName || 'Pelanggan Umum')} · ${itemCount} item</div>
                  <div class="ho-sub">${h.orderType === 'dine-in' ? 'Dine-in' + (h.tableNumber ? ' · Meja ' + h.tableNumber : '') : 'Takeaway'} · ${timeAgo(h.time)}</div>
                </div>
                <div class="ho-total">${rupiah(total)}</div>
                <div class="ho-actions">
                  <button class="btn btn-primary btn-sm" data-act="resume" data-id="${h.id}">Lanjutkan</button>
                  <button class="btn-icon-sm danger" data-act="delete" data-id="${h.id}" title="Hapus">${icon('ban', 'icon-sm')}</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeHeldOrdersBtn">Tutup</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('closeHeldOrdersBtn').addEventListener('click', () => { modal.innerHTML = ''; });
  modal.querySelectorAll('[data-act="resume"]').forEach(btn => {
    btn.addEventListener('click', () => resumeHeldOrder(Number(btn.dataset.id)));
  });
  modal.querySelectorAll('[data-act="delete"]').forEach(btn => {
    btn.addEventListener('click', () => deleteHeldOrder(Number(btn.dataset.id)));
  });
}

function resumeHeldOrder(id) {
  const idx = heldOrders.findIndex(h => h.id === id);
  if (idx === -1) return;
  if (cart.length && !confirm('Keranjang saat ini akan diganti dengan pesanan tertahan ini. Lanjutkan?')) return;
  const h = heldOrders[idx];
  cart = [...h.cart];
  selectedCustomer = h.customer ? { ...h.customer } : null;
  document.getElementById('customerSelectLabel').textContent = selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum';
  document.getElementById('ordererName').value = h.ordererName || '';
  updateOrdererNameVisibility();
  document.getElementById('discountInput').value = h.discount;
  document.getElementById('taxPercentInput').value = h.taxPercent;
  document.getElementById('orderType').value = h.orderType;
  document.getElementById('tableNumberRow').style.display = h.orderType === 'dine-in' ? '' : 'none';
  document.getElementById('tableNumber').value = h.tableNumber || '';
  heldOrders.splice(idx, 1);
  document.getElementById('heldOrdersModal').innerHTML = '';
  switchView('kasir');
  renderCart();
  renderHeldBadge();
  openCartModal();
  showToast('Pesanan tertahan dilanjutkan', 'success');
}

function deleteHeldOrder(id) {
  if (!confirm('Hapus pesanan tertahan ini secara permanen?')) return;
  heldOrders = heldOrders.filter(h => h.id !== id);
  renderHeldBadge();
  openHeldOrdersModal();
}

// ============================================================
// CHECKOUT & STRUK
// ============================================================
async function checkout() {
  if (cart.length === 0) { showToast('Keranjang masih kosong', 'error'); return; }
  const ordererName = document.getElementById('ordererName').value.trim();
  if (!selectedCustomer && !ordererName) {
    showToast('Nama pemesan wajib diisi untuk pelanggan umum', 'error');
    document.getElementById('ordererName').focus();
    return;
  }
  const { discount, taxAmount, total } = updateSummary();
  const paymentMethod = document.getElementById('paymentMethod').value;
  const cashGiven = Number(document.getElementById('cashGiven').value || 0);
  if (paymentMethod === 'cash' && cashGiven < total) { showToast('Uang diterima kurang dari total', 'error'); return; }

  const orderType = document.getElementById('orderType').value;
  const tableNumber = document.getElementById('tableNumber').value;
  const btn = document.getElementById('checkoutBtn');
  btn.disabled = true; btn.textContent = 'Memproses...';
  try {
    const tx = await post('/api/transactions', {
      items: cart.map(c => ({ productId: c.productId, qty: c.qty })),
      paymentMethod, cashGiven, orderType, tableNumber, discount, tax: taxAmount,
      customerId: selectedCustomer ? selectedCustomer.id : null,
      customerName: selectedCustomer ? null : ordererName,
    });
    cart = [];
    selectedCustomer = null;
    document.getElementById('customerSelectLabel').textContent = 'Pelanggan Umum';
    document.getElementById('ordererName').value = '';
    updateOrdererNameVisibility();
    document.getElementById('cashGiven').value = '';
    document.getElementById('tableNumber').value = '';
    document.getElementById('discountInput').value = 0;
    document.getElementById('taxPercentInput').value = store.appSettings.defaultTaxPercent || 0;
    renderCart();
    await invalidateAndReload('products');
    closeCartModal();
    showReceipt(tx);
    showToast('Transaksi berhasil', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Bayar Sekarang';
  }
}

export function showReceipt(tx) {
  const modal = document.getElementById('receiptModal');
  const settings = store.appSettings;
  const itemsHtml = tx.items.map(it => `<div class="r-line"><span>${it.name} x${it.qty}</span><span>${rupiah(it.subtotal)}</span></div>`).join('');
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box">
        <div class="receipt">
          <h2>${settings.storeName || 'Kasir Cafe'}</h2>
          ${settings.storeAddress ? `<div class="r-sub">${settings.storeAddress}</div>` : ''}
          ${settings.storePhone ? `<div class="r-sub">${settings.storePhone}</div>` : ''}
          <div class="r-sub">Struk Transaksi #${tx.id}${tx.status === 'void' ? ' (DIBATALKAN)' : ''}</div>
          <div class="r-sub">${new Date(tx.createdAt).toLocaleString('id-ID')}</div>
          <div class="r-sub">Kasir: ${tx.cashierName} | ${tx.orderType}${tx.tableNumber ? ' | Meja ' + tx.tableNumber : ''}</div>
          <div class="r-sub">Pelanggan: ${tx.customerName || 'Pelanggan Umum'}</div>
          <hr>${itemsHtml}<hr>
          <div class="r-line"><span>Subtotal</span><span>${rupiah(tx.subtotal)}</span></div>
          ${tx.discount ? `<div class="r-line"><span>Diskon</span><span>-${rupiah(tx.discount)}</span></div>` : ''}
          ${tx.tax ? `<div class="r-line"><span>Pajak</span><span>${rupiah(tx.tax)}</span></div>` : ''}
          <div class="r-line"><b>Total</b><b>${rupiah(tx.total)}</b></div>
          <div class="r-line"><span>Bayar (${tx.paymentMethod})</span><span>${rupiah(tx.cashGiven || tx.total)}</span></div>
          ${tx.paymentMethod === 'cash' ? `<div class="r-line"><span>Kembalian</span><span>${rupiah(tx.change)}</span></div>` : ''}
          <hr><div class="r-sub">${settings.receiptFooter || 'Terima kasih atas kunjungan Anda!'}</div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeReceiptBtn">Tutup</button>
          <button class="btn btn-primary" id="printReceiptBtn">${icon('receipt', 'icon-sm')} Cetak</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('closeReceiptBtn').addEventListener('click', () => modal.innerHTML = '');
  document.getElementById('printReceiptBtn').addEventListener('click', () => window.print());
}

// ============================================================
// SETUP & LIFECYCLE
// ============================================================
function setupPos() {
  document.getElementById('posSearch').addEventListener('input', renderProductGrid);
  document.getElementById('posSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const search = e.target.value.toLowerCase();
      const match = store.products.find(p => p.name.toLowerCase().includes(search) && p.stock > 0);
      if (match) { addToCart(match.id); e.target.value = ''; renderProductGrid(); }
    }
  });
  document.getElementById('orderType').addEventListener('change', (e) => {
    document.getElementById('tableNumberRow').style.display = e.target.value === 'dine-in' ? '' : 'none';
  });
  document.getElementById('paymentMethod').addEventListener('change', (e) => {
    document.getElementById('cashGivenRow').style.display = e.target.value === 'cash' ? '' : 'none';
    updateSummary();
  });
  document.getElementById('cashGiven').addEventListener('input', updateSummary);
  document.getElementById('discountInput').addEventListener('input', updateSummary);
  document.getElementById('taxPercentInput').addEventListener('input', updateSummary);
  document.getElementById('checkoutBtn').addEventListener('click', checkout);
  document.getElementById('holdBtn').addEventListener('click', holdOrder);
  document.getElementById('cancelBtn').addEventListener('click', cancelOrder);
  document.getElementById('heldOrdersBtn').addEventListener('click', openHeldOrdersModal);
  document.getElementById('ordererName').addEventListener('input', updateCartBar);
  document.getElementById('cartBarBtn').addEventListener('click', openCartModal);
  document.getElementById('closeCartModalBtn').addEventListener('click', closeCartModal);
  document.getElementById('cartModal').addEventListener('click', (e) => {
    if (e.target.id === 'cartModal') closeCartModal();
  });
  updateOrdererNameVisibility();
  updateCartBar();

  // shortcut global (Ctrl+F, F2, F3, Esc) dikirim dari modul sidebar lewat event bus
  on('shortcut:focus-search', () => document.getElementById('posSearch').focus());
  on('shortcut:checkout', () => checkout());
  on('shortcut:hold-order', () => holdOrder());
  on('shortcut:close-cart-modal', () => closeCartModal());
  on('shortcut:cancel-order', () => cancelOrder());

  // saat modul produk/kategori mengubah data, refresh grid & tab kasir juga
  on('catalog:products-changed', () => { renderCategoryTabs(); renderProductGrid(); });
  on('catalog:categories-changed', () => renderCategoryTabs());
}

export async function load() {
  await refreshProducts();
  document.getElementById('taxPercentInput').value = store.appSettings.defaultTaxPercent || 0;
}

export function init() {
  setupPos();
  setupCustomerSelect();
}

export default { id: 'kasir', template, init, load };
