export function rupiah(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

export function compactRupiah(n) {
  n = Number(n || 0);
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + 'jt';
  if (n >= 1_000) return 'Rp ' + (n / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + 'rb';
  return rupiah(n);
}

export function timeAgo(iso) {
  if (!iso) return '-';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

export function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
