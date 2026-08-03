// ============================================================
// Event bus super ringan. Dipakai supaya modul (mis. sidebar,
// keyboard shortcut global) bisa "memberi tahu" modul lain
// (mis. kasir) tanpa saling import langsung -> modul tetap
// independen/terpisah sesuai fiturnya.
// ============================================================
const target = new EventTarget();

export function on(eventName, handler) {
  target.addEventListener(eventName, handler);
}

export function emit(eventName, detail) {
  target.dispatchEvent(new CustomEvent(eventName, { detail }));
}
