// ============================================================
// Pengelola koneksi printer struk thermal, lewat 2 jalur:
// - Web Bluetooth API (navigator.bluetooth) -> printer Bluetooth/BLE
// - WebUSB API (navigator.usb)              -> printer USB
//
// CATATAN PENTING (baca sebelum pakai/kembangkan lebih lanjut):
// - Kedua API ini HANYA didukung Chrome/Edge/Opera (desktop & Android).
//   TIDAK berfungsi di Firefox maupun Safari/iOS -- itu batasan browser,
//   bukan bug aplikasi ini.
// - Wajib diakses lewat HTTPS (GitHub Pages sudah HTTPS, aman) atau
//   localhost saat development.
// - Karena alasan keamanan browser, memilih perangkat (requestDevice)
//   HARUS dipicu langsung oleh klik pengguna (tidak bisa otomatis saat
//   halaman dimuat), dan browser TIDAK mengingat perangkat lintas
//   refresh halaman -- jadi setelah reload, kasir perlu klik "Hubungkan"
//   lagi. Nama perangkat terakhir tetap disimpan (localStorage) supaya
//   tetap terlihat familiar di UI.
// - Protokol printing (ESC/POS) sedikit berbeda-beda antar merek
//   printer. printRawText() di bawah adalah implementasi umum/best-effort
//   (kirim teks polos + perintah potong kertas ESC/POS standar) -- kalau
//   printer Anda tidak merespons, mungkin perlu penyesuaian UUID service
//   Bluetooth atau endpoint USB sesuai spesifikasi printernya.
// ============================================================
import { emit } from './bus.js';

const META_KEY = 'kasir_printer_meta';

// UUID service/characteristic yang umum dipakai printer thermal Bluetooth
// (mis. seri Goojprt/Zjiang/EPPOS). Kalau printer Anda pakai UUID lain,
// ganti di sini.
const BLE_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
const BLE_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

const state = {
  type: null,        // 'bluetooth' | 'usb' | null
  connected: false,
  deviceName: null,
  device: null,       // objek device asli (BluetoothDevice / USBDevice)
  characteristic: null, // khusus bluetooth, buat kirim data
};

function persistMeta() {
  localStorage.setItem(META_KEY, JSON.stringify({ type: state.type, deviceName: state.deviceName }));
}

export function getLastKnownMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY) || 'null'); } catch (e) { return null; }
}

export function getStatus() {
  return { type: state.type, connected: state.connected, deviceName: state.deviceName };
}

export function isBluetoothSupported() { return 'bluetooth' in navigator; }
export function isUsbSupported() { return 'usb' in navigator; }

function setState(patch) {
  Object.assign(state, patch);
  persistMeta();
  emit('printer:status-changed', getStatus());
}

export async function connectBluetooth() {
  if (!isBluetoothSupported()) throw new Error('Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome/Edge terbaru.');
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [BLE_SERVICE_UUID],
  });
  const server = await device.gatt.connect();
  let characteristic = null;
  try {
    const service = await server.getPrimaryService(BLE_SERVICE_UUID);
    characteristic = await service.getCharacteristic(BLE_CHARACTERISTIC_UUID);
  } catch (e) {
    // Printer tetap tersambung walau service/characteristic standar tidak ketemu --
    // status koneksi tetap valid, tapi printRawText() mungkin perlu penyesuaian UUID.
  }
  device.addEventListener('gattserverdisconnected', () => {
    setState({ connected: false, device: null, characteristic: null });
  });
  setState({ type: 'bluetooth', connected: true, deviceName: device.name || 'Printer Bluetooth', device, characteristic });
  return getStatus();
}

export async function connectUsb() {
  if (!isUsbSupported()) throw new Error('Browser ini tidak mendukung WebUSB. Gunakan Chrome/Edge terbaru.');
  const device = await navigator.usb.requestDevice({ filters: [] });
  await device.open();
  if (device.configuration === null) await device.selectConfiguration(1);
  await device.claimInterface(0);
  setState({ type: 'usb', connected: true, deviceName: device.productName || 'Printer USB', device, characteristic: null });
  return getStatus();
}

export async function disconnect() {
  try {
    if (state.type === 'bluetooth' && state.device?.gatt?.connected) state.device.gatt.disconnect();
    if (state.type === 'usb' && state.device) await state.device.close();
  } catch (e) { /* abaikan error saat menutup koneksi */ }
  setState({ connected: false, device: null, characteristic: null });
}

/** Kirim teks polos ke printer (best-effort, lihat catatan protokol di atas). */
export async function printRawText(text) {
  if (!state.connected) throw new Error('Printer belum terhubung');
  const bytes = new TextEncoder().encode(text + '\n\n\n\x1D\x56\x00'); // + perintah potong kertas ESC/POS
  if (state.type === 'bluetooth') {
    if (!state.characteristic) throw new Error('Characteristic Bluetooth printer tidak ditemukan');
    const CHUNK = 180; // beberapa printer BLE butuh data dikirim per-potong kecil
    for (let i = 0; i < bytes.length; i += CHUNK) {
      await state.characteristic.writeValue(bytes.slice(i, i + CHUNK));
    }
  } else if (state.type === 'usb') {
    const endpoint = state.device.configuration.interfaces[0].alternate.endpoints.find(e => e.direction === 'out');
    await state.device.transferOut(endpoint ? endpoint.endpointNumber : 1, bytes);
  } else {
    throw new Error('Tidak ada printer terhubung');
  }
}
