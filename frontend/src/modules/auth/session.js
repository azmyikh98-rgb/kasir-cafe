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
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Admin' : 'Kasir';
  document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
}

export function setupLogout() {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await post('/api/logout', {});
    clearToken();
    window.location.href = './login.html';
  });
}
