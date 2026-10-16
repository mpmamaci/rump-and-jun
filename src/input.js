// Tastatur-Eingabe
const keys = {};
const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
const BLOCKED_KEYS = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

export function initInput({ onJump, onRestart }) {
  addEventListener('keydown', e => {
    if (BLOCKED_KEYS.includes(e.code)) e.preventDefault();  // Seite soll nicht scrollen
    if (JUMP_KEYS.includes(e.code) && !keys[e.code]) onJump();
    if (e.code === 'KeyR') onRestart();
    keys[e.code] = true;
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  // Fenster verliert Fokus → alle Tasten loslassen, sonst läuft die Figur weiter
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
}

export const jumpHeld = () => JUMP_KEYS.some(k => keys[k]);
export const moveAxis = () =>
  (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
