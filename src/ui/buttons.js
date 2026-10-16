import { gamepadConnected } from './gamepad.js';

// ============================================================
//  TOUCH-BUTTONS EIN-/AUSBLENDEN
//  Anordnung: 'side' (neben dem Bild), 'overlay' (darüber), 'hidden' (ausgeblendet).
//  Mit Controller verschwinden die Buttons:
//   - automatisch, sobald der Controller benutzt wird – ein Tipp auf den Bildschirm holt sie zurück
//   - dauerhaft mit 'hidden' – aber nur, solange ein Controller verbunden ist,
//     damit man sich auf dem Handy nie ohne Steuerung aussperrt
// ============================================================
let layout = 'side';
let gamepadInUse = false;
let hidden = null;
let onResize = () => {};

export function initButtons(initialLayout, resize) {
  layout = initialLayout;
  onResize = resize;
  addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && gamepadInUse) { gamepadInUse = false; applyButtons(); }
  });
  applyButtons();
}

export function setButtonLayout(next) {
  layout = next;
  applyButtons();
  onResize();
}

// Vom Controller-Modul gemeldet: Es wird gerade mit dem Controller gespielt
export function markGamepadUse() {
  if (!gamepadInUse) { gamepadInUse = true; applyButtons(); }
}

// Klassen am <body> setzen; das Layout wird nur neu berechnet, wenn sich etwas ändert
export function applyButtons() {
  const hide = gamepadConnected() && (layout === 'hidden' || gamepadInUse);
  document.body.classList.toggle('touch-overlay', layout === 'overlay' && !hide);
  if (hide === hidden) return;
  hidden = hide;
  document.body.classList.toggle('buttons-hidden', hide);
  onResize();
}

export const buttonsHidden = () => !!hidden;
export const buttonLayout = () => layout;
