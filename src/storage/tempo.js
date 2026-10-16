// Gewählte Tempo-Stufe im Browser merken
const KEY = 'rump-and-jun.tempo';

export function loadTempo(max) {
  try {
    const i = Number(localStorage.getItem(KEY));
    return Number.isInteger(i) && i >= 0 && i < max ? i : 0;
  } catch { return 0; }
}

export function saveTempo(i) {
  try { localStorage.setItem(KEY, String(i)); } catch { /* privates Fenster o. Ä. */ }
}
