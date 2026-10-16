// Tastatur-Eingabe
const keys = {};
export const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
const BLOCKED_KEYS = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'];

// onKeyDown(code, key, repeat) bekommt jede gedrückte Taste – das Spiel entscheidet,
// ob sie gerade fürs Laufen, Springen oder für ein Menü gedacht ist.
export function initInput({ onKeyDown }) {
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (BLOCKED_KEYS.includes(e.code)) e.preventDefault();  // Seite soll nicht scrollen
    const repeat = e.repeat || !!keys[e.code];
    keys[e.code] = true;
    onKeyDown(e.code, e.key, repeat);
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  // Fenster verliert Fokus → alle Tasten loslassen, sonst läuft die Figur weiter
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
}

// Für Touch-Buttons: virtuelle Tasten drücken und loslassen
export function pressKey(code) {
  const repeat = !!keys[code];
  keys[code] = true;
  return repeat;
}
export function releaseKey(code) { keys[code] = false; }

export const jumpHeld = () => JUMP_KEYS.some(k => keys[k]);
export const moveAxis = () =>
  (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
