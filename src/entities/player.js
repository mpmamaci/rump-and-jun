import { TILE, GRAVITY, MOVE_SPEED, JUMP_SPEED, MAX_FALL, COYOTE_TIME } from '../config.js';
import { moveAndCollide, forEachTile, playerSolid } from '../physics.js';
import { moveAxis, jumpHeld } from '../input.js';
import { puff } from '../particles.js';

export function createPlayer(x, y) {
  return { x, y, startX: x, startY: y, w: 12, h: 14, vx: 0, vy: 0,
           onGround: false, coyote: 0, jumpBuffer: 0, facing: 1, scaleX: 1, scaleY: 1, invul: 0 };
}

export function updatePlayer(p, game, dt) {
  const world = game.world;
  const wasOnGround = p.onGround;

  // --- Laufen (mit sanfter Beschleunigung)
  const dir = moveAxis();
  if (dir) p.facing = dir;
  const accel = p.onGround ? 14 : 8;
  p.vx += (dir * MOVE_SPEED - p.vx) * Math.min(1, accel * dt);

  // --- Springen (Coyote Time + Jump Buffer)
  p.coyote = p.onGround ? COYOTE_TIME : p.coyote - dt;
  p.jumpBuffer -= dt;
  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = -JUMP_SPEED;
    p.jumpBuffer = 0; p.coyote = 0;
    p.scaleX = 0.7; p.scaleY = 1.3;  // Streckung beim Absprung
    puff(world.particles, p.x + p.w / 2, p.y + p.h, 6);
  }

  // --- Schwerkraft (stärker, wenn man die Sprungtaste loslässt → variable Sprunghöhe)
  let g = GRAVITY;
  if (p.vy < 0 && !jumpHeld()) g *= 2.5;
  p.vy = Math.min(p.vy + g * dt, MAX_FALL);

  moveAndCollide(p, dt, world, playerSolid);

  // --- Squash & Stretch
  if (p.onGround && !wasOnGround) {
    p.scaleX = 1.3; p.scaleY = 0.7;
    puff(world.particles, p.x + p.w / 2, p.y + p.h, 4);
  }
  p.scaleX += (1 - p.scaleX) * Math.min(1, 12 * dt);
  p.scaleY += (1 - p.scaleY) * Math.min(1, 12 * dt);
  p.invul -= dt;

  // --- Stacheln (nur untere Hälfte des Blocks ist gefährlich)
  forEachTile(p, (c, r) => {
    if (world.tileAt(c, r) === '^' && p.y + p.h > r * TILE + TILE / 2) game.die();
  });
  if (p.y > world.rows * TILE + 40) game.die();
}
