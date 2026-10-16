import { VIEW_WIDTH, VIEW_HEIGHT, STEP } from './config.js';
import { Game } from './game.js';
import { initInput } from './input.js';
import { draw } from './renderer.js';

const canvas = document.getElementById('game');
const frame = document.getElementById('game-frame');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const game = new Game(VIEW_WIDTH, VIEW_HEIGHT);

initInput({
  onJump: () => game.jump(),
  onRestart: () => game.restart(),
});

// Zum Debuggen in der Browser-Konsole: window.game
window.game = game;

// ============================================================
//  SKALIERUNG – immer ein ganzzahliges Vielfaches, damit Pixel scharf bleiben
// ============================================================
function resize() {
  const framePad = 16;  // Innenabstand des Rahmens (2 × 8px)
  const availW = window.innerWidth - 32 - framePad;
  const availH = window.innerHeight * 0.75 - framePad;
  const fit = Math.min(availW / VIEW_WIDTH, availH / VIEW_HEIGHT);
  // Ganzzahlig, wenn möglich; auf sehr kleinen Bildschirmen notfalls kleiner als 1×
  const scale = fit >= 1 ? Math.floor(fit) : fit;
  canvas.style.width = VIEW_WIDTH * scale + 'px';
  canvas.style.height = VIEW_HEIGHT * scale + 'px';
  frame.style.setProperty('--scale', scale);
}
addEventListener('resize', resize);
resize();

// ============================================================
//  GAME LOOP – feste Physik-Schritte, Zeichnen so oft der Bildschirm kann
// ============================================================
const MAX_STEPS = 5;  // falls der Tab hängt: nicht hunderte Schritte nachholen
let last = performance.now();
let acc = 0;
function loop(now) {
  acc += Math.min((now - last) / 1000, MAX_STEPS * STEP);
  last = now;
  while (acc >= STEP) {
    game.update(STEP);
    acc -= STEP;
  }
  draw(ctx, game);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
