import './styles/base.css';
import './styles/login.css';
import { get, post, setToken } from './shared/api.js';

(async function checkSession() {
  try {
    const data = await get('/api/me');
    if (data.user) window.location.href = './index.html';
  } catch (err) {
    // Kalau pengecekan sesi gagal (mis. Apps Script belum siap / jaringan
    // bermasalah), biarkan saja halaman login tetap tampil apa adanya --
    // jangan sampai macet diam-diam.
    console.warn('Gagal memeriksa sesi:', err.message);
  }
})();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  try {
    const data = await post('/api/login', { username, password });
    setToken(data.token);
    window.location.href = './index.html';
  } catch (err) {
    errEl.textContent = err.message || 'Login gagal';
  }
});
