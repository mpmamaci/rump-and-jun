// ============================================================
//  FUCHS-RETTUNG
//  Beim Tod taucht manchmal ein Fuchs auf und fordert dich zu Tic-Tac-Toe heraus.
//  Gewinnst du, rettet er dich. Remis, Niederlage oder Aufgeben = Game Over.
// ============================================================
import { createBoard, result } from './tictactoe.js';

export const GIVE_UP = 9;  // Cursor-Position des „Aufgeben“-Buttons (nach den Feldern 0–8)

// Position von Brett und Button – Renderer und Antippen nutzen dieselben Werte
export const FOX_LAYOUT = {
  x0: 220, y0: 58, cell: 40,
  giveUp: { x: 220, y: 186, w: 120, h: 15 },
  fox: { x: 56, y: 76, scale: 6 },
};

export function createDuel() {
  return {
    board: createBoard(),
    cursor: 4,          // Mitte vorausgewählt
    turn: 'X',          // du fängst an
    timer: 0,           // Bedenkzeit des Fuchses
    outcome: null,      // 'win' | 'lose' | 'draw' | 'gaveup'
    outcomeTimer: 0,
  };
}

// Ergebnis nach einem Zug prüfen; gibt true zurück, wenn das Spiel vorbei ist
export function settle(duel) {
  const r = result(duel.board);
  if (!r) return false;
  duel.outcome = r === 'X' ? 'win' : r === 'O' ? 'lose' : 'draw';
  return true;
}

// Welches Feld (0–8) oder der Aufgeben-Button (9) liegt unter dem Punkt?
export function hitTest(x, y) {
  const { x0, y0, cell, giveUp: g } = FOX_LAYOUT;
  if (x >= g.x && x < g.x + g.w && y >= g.y && y < g.y + g.h) return GIVE_UP;
  const c = Math.floor((x - x0) / cell), r = Math.floor((y - y0) / cell);
  return c >= 0 && c < 3 && r >= 0 && r < 3 ? r * 3 + c : -1;
}

// Cursor bewegen: ← → laufen der Reihe nach durch alle Felder und den Button
// (so kommt man auch mit den Touch-Pfeilen zum „Aufgeben“), ↑ ↓ springen um eine Zeile.
export function moveCursor(cur, dir) {
  if (dir === 'left') return (cur + 9) % 10;
  if (dir === 'right') return (cur + 1) % 10;
  if (dir === 'up') return cur === GIVE_UP ? 7 : cur < 3 ? cur : cur - 3;
  if (dir === 'down') return cur === GIVE_UP ? GIVE_UP : cur > 5 ? GIVE_UP : cur + 3;
  return cur;
}
