// ============================================================
// Util bersama untuk fitur Import & Export (CSV + Excel) di
// menu Produk, Kategori, dan Pelanggan. Dipisah ke sini supaya
// ke-3 modul itu tidak duplikasi logika baca/tulis file.
// ============================================================
import * as XLSX from 'xlsx';
import { showToast } from './toast.js';

/**
 * @param {string} filename - tanpa ekstensi
 * @param {string[]} headers - label kolom (baris pertama file)
 * @param {Array<Array<string|number>>} rows - data, urutan harus sama dengan headers
 */
export function exportToCsv(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

export function exportToExcel(filename, headers, rows) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Baca file .csv atau .xlsx pilihan user, kembalikan array of object
 * dengan key sesuai baris header (baris pertama file).
 * @returns {Promise<Array<Object>>}
 */
export function readImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(rows);
      } catch (err) {
        reject(new Error('Gagal membaca file. Pastikan formatnya .csv atau .xlsx yang valid.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Render tombol Import + Export (dropdown CSV/Excel) yang sejajar dengan
 * tombol "Tambah" (tombol Tambah tetap paling kanan -- caller menaruh
 * markup ini SEBELUM tombol Tambah).
 */
export function importExportButtonsHtml() {
  return `
    <input type="file" id="importFileInput" accept=".csv,.xlsx,.xls" style="display:none;">
    <button type="button" class="btn btn-secondary" id="importBtn">
      <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      Import
    </button>
    <div class="export-dropdown-wrap">
      <button type="button" class="btn btn-secondary" id="exportBtn">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </button>
      <div class="export-dropdown-menu" id="exportDropdownMenu" style="display:none;">
        <div class="export-dropdown-item" data-format="csv">Export sebagai CSV</div>
        <div class="export-dropdown-item" data-format="excel">Export sebagai Excel (.xlsx)</div>
      </div>
    </div>
  `;
}

/**
 * Pasang event listener untuk tombol import/export hasil importExportButtonsHtml().
 * @param {Object} opts
 * @param {string} opts.filename - nama file dasar untuk export
 * @param {string[]} opts.headers - label kolom
 * @param {() => Array<Array<string|number>>} opts.getExportRows - data terkini untuk export
 * @param {(rows: Array<Object>) => Promise<void>} opts.onImport - proses baris hasil import (mis. loop create ke API)
 */
export function setupImportExport({ filename, headers, getExportRows, onImport }) {
  const importBtn = document.getElementById('importBtn');
  const importInput = document.getElementById('importFileInput');
  const exportBtn = document.getElementById('exportBtn');
  const exportMenu = document.getElementById('exportDropdownMenu');

  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const rows = await readImportFile(file);
      if (!rows.length) { showToast('File tidak berisi data', 'error'); return; }
      await onImport(rows);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.style.display = exportMenu.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => { exportMenu.style.display = 'none'; });

  exportMenu.querySelectorAll('.export-dropdown-item').forEach((item) => {
    item.addEventListener('click', () => {
      const rows = getExportRows();
      if (!rows.length) { showToast('Tidak ada data untuk diekspor', 'error'); return; }
      if (item.dataset.format === 'csv') exportToCsv(filename, headers, rows);
      else exportToExcel(filename, headers, rows);
      exportMenu.style.display = 'none';
      showToast('Data berhasil diekspor', 'success');
    });
  });
}
