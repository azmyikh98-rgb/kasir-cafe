export function showToast(msg, type) {
  const holder = document.getElementById('toastHolder');
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  holder.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
