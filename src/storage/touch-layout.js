// Anordnung der Touch-Buttons merken: 'side' (neben dem Bild) oder 'overlay' (darüber)
const KEY = 'jump-and-run.touch-layout';

export function loadTouchLayout() {
  try { return localStorage.getItem(KEY) === 'overlay' ? 'overlay' : 'side'; } catch { return 'side'; }
}

export function saveTouchLayout(layout) {
  try { localStorage.setItem(KEY, layout); } catch { /* privates Fenster o. Ä. */ }
}
