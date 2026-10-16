import { Game } from './game.js';
import { initInput } from './input.js';
import { draw } from './renderer.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = new Game(canvas.width);

initInput({
  onJump: () => game.jump(),
  onRestart: () => game.restart(),
});

// Zum Debuggen in der Browser-Konsole: window.game
window.game = game;

// ============================================================
//  GAME LOOP
// ============================================================
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);  // dt begrenzen, damit nichts durch Wände fällt
  last = now;
  game.update(dt);
  draw(ctx, game);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
