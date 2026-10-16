// Gewählten Skin im Browser merken ('' = Standard)
const KEY = 'jump-and-run.skin';

export function loadSkinChoice() {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
}

export function saveSkinChoice(name) {
  try { localStorage.setItem(KEY, name); } catch { /* privates Fenster o. Ä. */ }
}
