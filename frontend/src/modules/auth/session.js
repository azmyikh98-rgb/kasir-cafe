import { get, post, clearToken } from '../../shared/api.js';
import { store } from '../../shared/state.js';

/** Memastikan user sudah login. Kalau belum, lempar ke halaman login. */
export async function requireSession() {
  const me = await get('/api/me');
  if (!me.user) { window.location.href = './login.html'; return null; }
  store.currentUser = me.user;
  return me.user;
}

export function paintUserChip(user) {
  const roleLabel = user.role === 'admin' ? 'Admin' : 'Kasir';
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userRole').textContent = roleLabel;
  document.getElementById('userNameDropdown').textContent = user.name;
  document.getElementById('userRoleDropdown').textContent = roleLabel;
  document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
}

export function setupUserDropdown() {
  const chip = document.getElementById('userChip');
  const menu = document.getElementById('userDropdownMenu');
  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.style.display !== 'none';
    menu.style.display = isOpen ? 'none' : 'block';
    chip.setAttribute('aria-expanded', String(!isOpen));
  });
  document.addEventListener('click', () => {
    menu.style.display = 'none';
    chip.setAttribute('aria-expanded', 'false');
  });
}

export function setupLogout() {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await post('/api/logout', {});
    clearToken();
    window.location.href = './login.html';
  });
}
