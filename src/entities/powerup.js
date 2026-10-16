// Power-ups:
//   doublejump – zweiter Sprung in der Luft (für DOUBLEJUMP_TIME Sekunden)
//   shield     – fängt genau einen Treffer ab
//   slowmo     – Welt läuft kurz langsamer
export const POWERUP_TYPES = ['doublejump', 'shield', 'slowmo'];

export const POWERUP_INFO = {
  doublejump: { label: 'DOPPELSPRUNG!', color: '#73eff7' },
  shield: { label: 'SCHILD!', color: '#41a6f6' },
  slowmo: { label: 'ZEITLUPE!', color: '#ffcd75' },
};

export function createPowerup(type, x, y) {
  return { type, x: x + 2, y: y + 2, w: 12, h: 12, taken: false, t: Math.random() * 6 };
}
