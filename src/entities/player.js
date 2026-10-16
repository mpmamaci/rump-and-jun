import {
  TILE, GRAVITY, MOVE_SPEED, JUMP_SPEED, MAX_FALL, COYOTE_TIME,
  WALL_SLIDE_SPEED, WALL_KICK, WALL_JUMP_LOCK, WALL_COYOTE, SPRING_SPEED,
} from '../config.js';
import { moveAndCollide, forEachTile, playerSolid } from '../physics.js';
import { moveAxis, jumpHeld } from '../input.js';
import { puff } from '../particles.js';
import { landOnPlatforms } from './platform.js';
import { touchCrumble, touchSpring } from '../world/world.js';

export function createPlayer(x, y) {
  return { x, y, startX: x, startY: y, w: 12, h: 14, vx: 0, vy: 0,
           onGround: false, coyote: 0, jumpBuffer: 0, facing: 1, scaleX: 1, scaleY: 1, riding: null,
           airJumpUsed: false, invul: 0, dust: 0,
           wall: 0, lastWall: 0, wallCoyote: 0, wallJumpLock: 0, springBoost: false };
}

export function updatePlayer(p, game, dt) {
  const world = game.world;
  const wasOnGround = p.onGround;

  // --- Auf einer bewegten Plattform? Dann fährt man mit
  if (p.riding) { p.x += p.riding.dx; p.y += p.riding.dy; }
  const prevBottom = p.y + p.h;

  // --- Wand neben dem Spieler? (für Wandrutschen und Wandsprung)
  p.wall = p.onGround ? 0 : wallSide(p, world);
  if (p.wall) { p.lastWall = p.wall; p.wallCoyote = WALL_COYOTE; game.onWallTouch(); } else p.wallCoyote -= dt;
  p.wallJumpLock -= dt;

  // --- Laufen (mit sanfter Beschleunigung; direkt nach dem Wandsprung zählt der Schwung)
  const dir = p.wallJumpLock > 0 ? Math.sign(p.vx) : moveAxis();
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
  } else if (p.jumpBuffer > 0 && p.wallCoyote > 0) {
    // Wandsprung: von der Wand weg und nach oben abstoßen
    p.vy = -JUMP_SPEED * 1.05;
    p.vx = -p.lastWall * WALL_KICK;
    p.facing = -p.lastWall;
    p.jumpBuffer = 0; p.wallCoyote = 0; p.wallJumpLock = WALL_JUMP_LOCK;
    p.airJumpUsed = false;  // Doppelsprung danach wieder möglich
    p.scaleX = 0.7; p.scaleY = 1.3;
    puff(world.particles, p.lastWall < 0 ? p.x : p.x + p.w, p.y + p.h / 2, 6);
    game.onJump('wall');
  } else if (p.jumpBuffer > 0 && game.effects.doublejump > 0 && !p.airJumpUsed) {
    // Doppelsprung-Power-up: einmal in der Luft nachspringen
    p.vy = -JUMP_SPEED * 0.9;
    p.jumpBuffer = 0; p.airJumpUsed = true;
    p.scaleX = 0.7; p.scaleY = 1.3;
    puff(world.particles, p.x + p.w / 2, p.y + p.h, 8, '#73eff7');
    game.onJump(true);
  }

  // --- Schwerkraft (stärker, wenn man die Sprungtaste loslässt → variable Sprunghöhe)
  // (Nach einer Sprungfeder gilt das nicht – sonst wäre der Schwung sofort weg.)
  let g = GRAVITY;
  if (p.vy >= 0) p.springBoost = false;
  if (p.vy < 0 && !jumpHeld() && !p.springBoost) g *= 2.5;
  p.vy = Math.min(p.vy + g * dt, MAX_FALL);

  // --- Wandrutschen: wer gegen die Wand drückt, fällt langsam
  if (p.wall && dir === p.wall && p.vy > WALL_SLIDE_SPEED) {
    p.vy = WALL_SLIDE_SPEED;
    p.facing = p.wall;
    if (Math.random() < 0.3) puff(world.particles, p.wall < 0 ? p.x : p.x + p.w, p.y + p.h, 1, '#94b0c2');
  }

  moveAndCollide(p, dt, world, playerSolid);
  p.riding = landOnPlatforms(p, world.platforms, prevBottom);

  // --- Bröckel-Plattformen und Sprungfedern unter den Füßen
  if (p.onGround && !p.riding) {
    const r = Math.floor((p.y + p.h + 1) / TILE);
    const c0 = Math.floor(p.x / TILE), c1 = Math.floor((p.x + p.w - 0.01) / TILE);
    touchCrumble(world, c0, r);
    touchCrumble(world, c1, r);
    if (touchSpring(world, c0, r) || touchSpring(world, c1, r)) {
      p.vy = -SPRING_SPEED;
      p.onGround = false; p.coyote = 0; p.springBoost = true;
      p.scaleX = 0.6; p.scaleY = 1.4;
      game.onSpring();
    }
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

// -1 = Wand links, 1 = Wand rechts, 0 = keine
function wallSide(p, world) {
  const r0 = Math.floor((p.y + 2) / TILE), r1 = Math.floor((p.y + p.h - 2) / TILE);
  const solidAt = x => {
    const c = Math.floor(x / TILE);
    for (let r = r0; r <= r1; r++) if (playerSolid(world.tileAt(c, r))) return true;
    return false;
  };
  if (solidAt(p.x - 1)) return -1;
  if (solidAt(p.x + p.w + 1)) return 1;
  return 0;
}
