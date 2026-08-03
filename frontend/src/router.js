import { store, canAccessMenu } from './shared/state.js';
import { showToast } from './shared/toast.js';

// Setiap modul fitur mendaftarkan dirinya lewat registerModule().
// Kontrak modul: { id, template, init(), load() }
// - template: string HTML section-nya (dirender sekali ke DOM saat startup)
// - init(): pasang semua event listener, dipanggil sekali saat startup
// - load(): (opsional) ambil data terbaru, dipanggil setiap kali view ini dibuka
const registry = new Map();

export function registerModule(mod) {
  registry.set(mod.id, mod);
}

export function renderAllTemplates(containerEl) {
  containerEl.insertAdjacentHTML('beforeend', [...registry.values()].map(m => m.template).join('\n'));
}

export function initAllModules() {
  for (const mod of registry.values()) {
    if (typeof mod.init === 'function') mod.init();
  }
}

export function switchView(viewId) {
  if (viewId !== 'comingsoon' && !canAccessMenu(viewId)) {
    showToast('Anda tidak memiliki akses ke menu ini', 'error');
    return;
  }
  document.getElementById('sidebar')?.classList.remove('mobile-open');
  document.getElementById('sidebarBackdrop')?.classList.remove('active');
  store.activeView = viewId;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + viewId);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el2 => el2.classList.toggle('active', el2.dataset.id === viewId));

  const mod = registry.get(viewId);
  if (mod && typeof mod.load === 'function') mod.load();
}
