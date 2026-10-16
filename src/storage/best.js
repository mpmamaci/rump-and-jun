// Persönlicher Rekord im Browser. Wird in M5 durch das Leaderboard ersetzt.
const KEY = 'rump-and-jun.best';

export function loadBest() {
  try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; }
}

export function saveBest(score) {
  try { localStorage.setItem(KEY, String(score)); } catch { /* privates Fenster o. Ä. */ }
}
