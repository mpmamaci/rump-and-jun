// Power-ups (die angezeigten Namen stehen in src/i18n.js unter powerup.*):
//   doublejump – zweiter Sprung in der Luft (für DOUBLEJUMP_TIME Sekunden)
//   shield     – fängt genau einen Treffer ab
//   slowmo     – Welt läuft kurz langsamer
//   rocket     – sehr selten (eigene !-Plätze): unverwundbar über 500 m nach vorne
export const POWERUP_TYPES = ['doublejump', 'shield', 'slowmo'];  // zufällig auf ?-Plätzen

export const POWERUP_INFO = {
  doublejump: { color: '#73eff7' },
  shield: { color: '#41a6f6' },
  slowmo: { color: '#ffcd75' },
  rocket: { color: '#ef7d57' },
};

export function createPowerup(type, x, y) {
  return { type, x: x + 2, y: y + 2, w: 12, h: 12, taken: false, t: Math.random() * 6 };
}
