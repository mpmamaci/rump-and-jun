import { TILE, GRAVITY, MOVE_SPEED, JUMP_SPEED, MAX_FALL, COYOTE_TIME } from '../config.js';
import { moveAndCollide, forEachTile, playerSolid } from '../physics.js';
import { moveAxis, jumpHeld } from '../input.js';
import { puff } from '../particles.js';
import { landOnPlatforms } from './platform.js';
import { touchCrumble } from '../world/world.js';

export function createPlayer(x, y) {
  return { x, y, startX: x, startY: y, w: 12, h: 14, vx: 0, vy: 0,
           onGround: false, coyote: 0, jumpBuffer: 0, facing: 1, scaleX: 1, scaleY: 1, riding: null,
           airJumpUsed: false, invul: 0, dust: 0 };
}

export function updatePlayer(p, game, dt) {
  const world = game.world;
  const wasOnGround = p.onGround;

  // --- Auf einer bewegten Plattform? Dann fährt man mit
  if (p.riding) { p.x += p.riding.dx; p.y += p.riding.dy; }
  const prevBottom = p.y + p.h;

  // --- Laufen (mit sanfter Beschleunigung)
  const dir = moveAxis();
  if (dir) p.facing = dir;
  const accel = p.onGround ? 14 : 8;
  p.vx += (dir * MOVE_SPEED - p.vx) * Math.min(1, accel * dt);

  // --- Springen (Coyote Time + Jump Buffer)
  p.coyote = p.onGround ? COYOTE_TIME : p.coyote - dt;
  p.jumpBuffer -= dt;
  if (p.onGround) p.airJumpUsed = false;
  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = -JUMP_SPEED;
    p.jumpBuffer = 0; p.coyote = 0;
    p.scaleX = 0.7; p.scaleY = 1.3;  // Streckung beim Absprung
    puff(world.particles, p.x + p.w / 2, p.y + p.h, 6);
    game.onJump(false);
  } else if (p.jumpBuffer > 0 && game.effects.doublejump > 0 && !p.airJumpUsed) {
    // Doppelsprung-Power-up: einmal in der Luft nachspringen
    p.vy = -JUMP_SPEED * 0.9;
    p.jumpBuffer = 0; p.airJumpUsed = true;
    p.scaleX = 0.7; p.scaleY = 1.3;
    puff(world.particles, p.x + p.w / 2, p.y + p.h, 8, '#73eff7');
    game.onJump(true);
  }

  // --- Schwerkraft (stärker, wenn man die Sprungtaste loslässt → variable Sprunghöhe)
  let g = GRAVITY;
  if (p.vy < 0 && !jumpHeld()) g *= 2.5;
  p.vy = Math.min(p.vy + g * dt, MAX_FALL);

  moveAndCollide(p, dt, world, playerSolid);
  p.riding = landOnPlatforms(p, world.platforms, prevBottom);

  // --- Bröckel-Plattformen unter den Füßen anstoßen
  if (p.onGround && !p.riding) {
    const r = Math.floor((p.y + p.h + 1) / TILE);
    touchCrumble(world, Math.floor(p.x / TILE), r);
    touchCrumble(world, Math.floor((p.x + p.w - 0.01) / TILE), r);
  }

  // --- Squash & Stretch
  if (p.onGround && !wasOnGround) {
    p.scaleX = 1.3; p.scaleY = 0.7;
    puff(world.particles, p.x + p.w / 2, p.y + p.h, 4);
  }
  p.scaleX += (1 - p.scaleX) * Math.min(1, 12 * dt);
  p.scaleY += (1 - p.scaleY) * Math.min(1, 12 * dt);
  p.invul -= dt;

  // --- Laufstaub
  if (p.onGround && Math.abs(p.vx) > 60) {
    p.dust -= dt;
    if (p.dust <= 0) { puff(world.particles, p.x + p.w / 2 - Math.sign(p.vx) * 5, p.y + p.h - 1, 1, '#94b0c2'); p.dust = 0.09; }
  }

  // --- Stacheln (nur untere Hälfte des Blocks ist gefährlich)
  forEachTile(p, (c, r) => {
    if (world.tileAt(c, r) === '^' && p.y + p.h > r * TILE + TILE / 2) game.hurt();
  });
  if (p.y > world.rows * TILE + 40) game.die();
}
