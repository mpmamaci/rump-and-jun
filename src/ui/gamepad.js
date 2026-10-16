import { pressKey, releaseKey } from '../input.js';

// ============================================================
//  CONTROLLER – über die eingebaute Gamepad-API des Browsers.
//  Funktioniert mit Xbox-, PlayStation- und Switch-Pro-Controllern
//  (Standard-Belegung). Jede Taste drückt eine virtuelle Tastatur-Taste,
//  dadurch funktionieren Spiel und Menüs genau wie mit der Tastatur.
//
//   Stick / Steuerkreuz   laufen, in Menüs auswählen
//   A / ✕                 springen (halten = höher), bestätigen
//   B / ◯                 zurück (Namenseingabe: Buchstabe zurück)
//   Start / Options       Pause
// ============================================================
const DEADZONE = 0.4;        // so weit muss der Stick gedrückt sein
const REPEAT_DELAY = 0.35;   // in Menüs: gehaltene Richtung wiederholt sich nach …
const REPEAT_RATE = 0.12;    // … und dann alle … Sekunden

// Standard-Belegung (https://w3c.github.io/gamepad/#remapping)
const BTN = { A: 0, B: 1, X: 2, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

const held = {};          // virtuelle Taste → seit wann gehalten (Sekunden)
let connected = false;

// Welche virtuellen Tasten drückt der Controller gerade?
// mode: 'play' (Lauf aktiv) | 'menu' | 'name' (Namenseingabe)
function readPad(pad, mode) {
  const inMenu = mode !== 'play';
  const b = i => !!pad.buttons[i]?.pressed;
  const x = pad.axes[0] || 0, y = pad.axes[1] || 0;
  const down = new Set();
  if (b(BTN.LEFT) || x < -DEADZONE) down.add('ArrowLeft');
  if (b(BTN.RIGHT) || x > DEADZONE) down.add('ArrowRight');
  // Hoch/Runter nur in Menüs – im Spiel würde ein wackeliger Stick sonst springen
  if (inMenu && (b(BTN.UP) || y < -DEADZONE)) down.add('ArrowUp');
  if (inMenu && (b(BTN.DOWN) || y > DEADZONE)) down.add('ArrowDown');
  if (b(BTN.A) || b(BTN.X)) down.add('Space');
  if (b(BTN.B) && mode === 'name') down.add('Backspace');
  else if (b(BTN.B) && inMenu) down.add('Escape');
  if (b(BTN.START)) down.add('Escape');
  return down;
}

// Wird am Controller gerade irgendetwas gedrückt oder bewegt?
const padActive = pad => pad.buttons.some(b => b?.pressed) || pad.axes.some(a => Math.abs(a) > DEADZONE);

// Jeden Frame aufrufen. onActivity meldet: Der Controller wird gerade benutzt.
export function pollGamepad(dt, mode, onKeyDown, onConnect, onActivity) {
  const inMenu = mode !== 'play';
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  if (pads.length && !connected) onConnect?.(pads[0].id);
  connected = pads.length > 0;

  if (pads.some(padActive)) onActivity?.();

  const down = new Set();
  for (const pad of pads) for (const code of readPad(pad, mode)) down.add(code);

  for (const code of down) {
    if (held[code] === undefined) {
      held[code] = 0;
      onKeyDown(code, '', pressKey(code));
    } else {
      // Menüs: gehaltene Richtungen wiederholen (z. B. Buchstaben durchblättern)
      const before = held[code];
      held[code] += dt;
      const dir = code.startsWith('Arrow');
      if (inMenu && dir && held[code] >= REPEAT_DELAY) {
        const n = t => Math.floor((t - REPEAT_DELAY) / REPEAT_RATE);
        if (before < REPEAT_DELAY || n(held[code]) > n(before)) onKeyDown(code, '', false);
      }
    }
  }
  for (const code of Object.keys(held)) {
    if (!down.has(code)) { delete held[code]; releaseKey(code); }
  }
}

export const gamepadConnected = () => connected;
