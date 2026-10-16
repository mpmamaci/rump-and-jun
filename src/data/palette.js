// ============================================================
//  SPIELPALETTE – alle Sprites benutzen nur diese 24 Farben.
//  Quelle: 16 Farben (k d m s w p r o y l g t n b c a) sind die Palette
//  „Sweetie 16“ von GrafxKid – https://lospec.com/palette-list/sweetie-16
//  Die übrigen 8 (v i x q f e u h) wurden für dieses Projekt ergänzt.
//  Jede Farbe hat ein Zeichen, damit Sprites als Text gespeichert werden können.
//  '.' ist durchsichtig.
// ============================================================
export const PALETTE = {
  k: '#1a1c2c', // Kontur / fast schwarz
  d: '#333c57', // dunkelgrau
  m: '#566c86', // grau
  s: '#94b0c2', // hellgrau
  w: '#f4f4f4', // weiß
  p: '#5d275d', // dunkellila
  v: '#7a3b8f', // violett
  i: '#c27ae0', // flieder
  r: '#b13e53', // rot
  x: '#e43b44', // hellrot
  o: '#ef7d57', // orange
  y: '#ffcd75', // gelb
  q: '#ffd23f', // gold
  f: '#f2c3a0', // haut
  e: '#5c3a1e', // dunkelbraun
  u: '#8b5a2b', // braun
  h: '#c28a4a', // hellbraun
  t: '#257179', // petrol
  g: '#38b764', // grün
  l: '#a7f070', // hellgrün
  n: '#29366f', // navy
  b: '#3b5dc9', // blau
  c: '#41a6f6', // hellblau
  a: '#73eff7', // aqua
};

export const TRANSPARENT = '.';
export const PALETTE_KEYS = Object.keys(PALETTE);

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Findet die nächstgelegene Palettenfarbe (gewichteter RGB-Abstand, nah an der Wahrnehmung)
const RGB = PALETTE_KEYS.map(k => [k, hexToRgb(PALETTE[k])]);
export function nearestKey(r, g, b) {
  let best = 'k', bestD = Infinity;
  for (const [k, [pr, pg, pb]] of RGB) {
    const rm = (r + pr) / 2;
    const d = (2 + rm / 256) * (r - pr) ** 2 + 4 * (g - pg) ** 2 + (2 + (255 - rm) / 256) * (b - pb) ** 2;
    if (d < bestD) { bestD = d; best = k; }
  }
  return best;
}
