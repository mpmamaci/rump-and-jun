// ============================================================
//  TIC-TAC-TOE gegen den Fuchs
//  Felder 0–8 (Zeile für Zeile), 'X' = Spieler, 'O' = Fuchs, null = frei.
//  Der Fuchs spielt ordentlich, aber nicht perfekt – sonst wäre er unschlagbar.
// ============================================================
import { FOX_BLOCK_CHANCE, FOX_WIN_CHANCE } from '../config.js';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function createBoard() {
  return Array(9).fill(null);
}

// 'X' | 'O' | 'draw' | null (läuft noch)
export function result(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? 'draw' : null;
}

export const freeCells = board => board.flatMap((v, i) => (v ? [] : [i]));

// Feld, mit dem `mark` sofort eine Reihe vollmacht (oder -1)
function completingMove(board, mark) {
  for (const line of LINES) {
    const marks = line.filter(i => board[i] === mark).length;
    const free = line.filter(i => !board[i]);
    if (marks === 2 && free.length === 1) return free[0];
  }
  return -1;
}

// Zug des Fuchses. rand = Zufallsfunktion 0..1
export function foxMove(board, rand = Math.random) {
  const win = completingMove(board, 'O');
  if (win >= 0 && rand() < FOX_WIN_CHANCE) return win;
  const block = completingMove(board, 'X');
  if (block >= 0 && rand() < FOX_BLOCK_CHANCE) return block;
  if (!board[4] && rand() < 0.6) return 4;  // die Mitte mag er
  const free = freeCells(board);
  return free[Math.floor(rand() * free.length)];
}
