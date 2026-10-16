import { pressKey, releaseKey } from '../input.js';

// ============================================================
//  TOUCH-STEUERUNG – Bildschirm-Buttons fürs Handy.
//  Jeder Button drückt eine virtuelle Taste (data-key), dadurch
//  funktionieren Spiel und Menüs genau wie mit der Tastatur.
// ============================================================
export function initTouch(root, onKeyDown) {
  const enable = () => {
    if (document.body.classList.contains('touch')) return;
    document.body.classList.add('touch');
    dispatchEvent(new Event('resize'));  // Layout ohne Tasten-Hinweise neu berechnen
  };
  if (matchMedia('(pointer: coarse)').matches) enable();
  // Wer einmal mit dem Finger tippt, bekommt die Buttons – auch auf Tablets mit Tastatur
  addEventListener('pointerdown', e => { if (e.pointerType === 'touch') enable(); }, { passive: true });

  for (const btn of root.querySelectorAll('[data-key]')) {
    const code = btn.dataset.key;
    const down = e => {
      e.preventDefault();
      try { btn.setPointerCapture(e.pointerId); } catch { /* manche Pointer lassen sich nicht einfangen */ }
      btn.classList.add('pressed');
      onKeyDown(code, '', pressKey(code));
    };
    const up = () => {
      btn.classList.remove('pressed');
      releaseKey(code);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('lostpointercapture', up);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }
}
