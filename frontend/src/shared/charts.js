import { rupiah, compactRupiah } from './format.js';

export function emptyMini(text) {
  return `<div style="color:var(--text-secondary); font-size:12.5px; text-align:center; padding:14px 0;">${text}</div>`;
}

export function barChart(data, color) {
  color = color || '#2563EB';
  const max = Math.max(...data.map(d => d.value), 1);
  const vbW = 320, vbH = 150, padTop = 26, padBottom = 24, padSide = 8;
  const plotH = vbH - padTop - padBottom;
  const baseline = vbH - padBottom;
  const n = data.length || 1;
  const gap = 10;
  const barW = Math.max(8, (vbW - padSide * 2 - gap * (n - 1)) / n);
  const r = Math.min(6, barW / 2);
  const bars = data.map((d, i) => {
    const x = padSide + i * (barW + gap);
    const cx = x + barW / 2;
    const isZero = !d.value || d.value <= 0;
    if (isZero) {
      const zh = 3;
      return `
        <rect x="${x}" y="${baseline - zh}" width="${barW}" height="${zh}" rx="${zh / 2}" fill="#E2E8F0"></rect>
        <text x="${cx}" y="${vbH - 6}" font-size="10" fill="#94A3B8" text-anchor="middle">${d.label}</text>
      `;
    }
    const barH = Math.max(6, (d.value / max) * plotH);
    const y = baseline - barH;
    const isMax = d.value === max;
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="${r}" fill="${color}" opacity="${isMax ? 1 : 0.78}">
        <title>${d.label}: ${rupiah(d.value)}</title>
      </rect>
      ${isMax ? `<text x="${cx}" y="${Math.max(11, y - 7)}" font-size="10" font-weight="700" fill="${color}" text-anchor="middle">${compactRupiah(d.value)}</text>` : ''}
      <text x="${cx}" y="${vbH - 6}" font-size="10" fill="#64748B" text-anchor="middle">${d.label}</text>
    `;
  }).join('');
  return `<svg class="mini-chart" viewBox="0 0 ${vbW} ${vbH}" style="aspect-ratio:${vbW}/${vbH}" role="img" aria-label="Grafik penjualan">
    <line x1="${padSide}" y1="${baseline}" x2="${vbW - padSide}" y2="${baseline}" stroke="#E2E8F0" stroke-width="1"></line>
    ${bars}
  </svg>`;
}
