import { icon } from '../../shared/icons.js';
import { NAV_ITEMS, store, canAccessMenu } from '../../shared/state.js';
import { switchView } from '../../router.js';
import { showToast } from '../../shared/toast.js';
import { emit } from '../../shared/bus.js';

export function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  const visibleItems = NAV_ITEMS.filter(item => canAccessMenu(item.id));
  nav.innerHTML = visibleItems.map(item => `
    <div class="nav-item" data-id="${item.id}">
      ${icon(item.icon)}
      <span class="nav-label">${item.label}</span>
      ${item.mvp ? '' : '<span class="soon-badge">SOON</span>'}
    </div>
  `).join('');
  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = NAV_ITEMS.find(n => n.id === el.dataset.id);
      if (item.mvp) {
        switchView(item.id);
      } else {
        document.getElementById('comingSoonTitle').textContent = item.label + ' — Segera Hadir';
        switchView('comingsoon');
        showToast(`Fitur "${item.label}" akan hadir di iterasi berikutnya`);
      }
    });
  });
}

export function setupCollapse() {
  const sidebar = document.getElementById('sidebar');
  const label = document.getElementById('collapseLabel');
  const savedState = localStorage.getItem('sidebarCollapsed') === '1';
  if (savedState) { sidebar.classList.add('collapsed'); label.textContent = ''; }
  document.getElementById('collapseBtn').addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
    label.textContent = collapsed ? '' : 'Ciutkan Menu';
  });
}

export function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('mobile-open');
  document.getElementById('sidebarBackdrop').classList.add('active');
}

export function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebarBackdrop').classList.remove('active');
}

export function setupMobileSidebar() {
  document.getElementById('mobileMenuBtn').addEventListener('click', openMobileSidebar);
  document.getElementById('sidebarBackdrop').addEventListener('click', closeMobileSidebar);
}

export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      switchView('kasir');
      emit('shortcut:focus-search');
    } else if (e.key === 'F2') {
      e.preventDefault();
      if (store.activeView === 'kasir') emit('shortcut:checkout');
    } else if (e.key === 'F3') {
      e.preventDefault();
      if (store.activeView === 'kasir') emit('shortcut:hold-order');
    } else if (e.key === 'Escape') {
      if (document.getElementById('receiptModal').innerHTML) {
        document.getElementById('receiptModal').innerHTML = '';
      } else if (document.getElementById('stockAdjustModal').innerHTML) {
        document.getElementById('stockAdjustModal').innerHTML = '';
      } else if (document.getElementById('heldOrdersModal').innerHTML) {
        document.getElementById('heldOrdersModal').innerHTML = '';
      } else if (document.getElementById('cartModal') && document.getElementById('cartModal').style.display !== 'none') {
        emit('shortcut:close-cart-modal');
      } else if (document.getElementById('sidebar').classList.contains('mobile-open')) {
        closeMobileSidebar();
      } else if (store.activeView === 'kasir') {
        emit('shortcut:cancel-order');
      }
    }
  });
}

export function initSidebar() {
  renderSidebar();
  setupCollapse();
  setupMobileSidebar();
  setupKeyboardShortcuts();
}
