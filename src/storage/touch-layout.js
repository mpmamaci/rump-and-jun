// Anordnung der Touch-Buttons merken: 'side' (neben dem Bild), 'overlay' (darüber)
// oder 'hidden' (ausgeblendet, solange ein Controller verbunden ist)
const KEY = 'rump-and-jun.touch-layout';

export function loadTouchLayout() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'overlay' || v === 'hidden' ? v : 'side';
  } catch { return 'side'; }
}

export function saveTouchLayout(layout) {
  try { localStorage.setItem(KEY, layout); } catch { /* privates Fenster o. Ä. */ }
}
