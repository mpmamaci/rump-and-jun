import { TILE, PLATFORM_SPEED } from '../config.js';

// Bewegte Plattform: 3 Blöcke breit, man kann von unten durchspringen und oben landen.
//   'h' fährt 6 Blöcke nach rechts und zurück
//   'v' fährt 3 Blöcke nach oben und zurück
export function createPlatform(axis, x, y) {
  return {
    axis, x, y, x0: x, y0: y, w: 3 * TILE, h: 6,
    range: (axis === 'h' ? 6 : 3) * TILE,
    pos: 0, dir: 1, dx: 0, dy: 0,
  };
}

export function updatePlatform(pl, dt) {
  pl.pos += pl.dir * PLATFORM_SPEED * dt;
  if (pl.pos >= pl.range) { pl.pos = pl.range; pl.dir = -1; }
  if (pl.pos <= 0) { pl.pos = 0; pl.dir = 1; }
  const nx = pl.axis === 'h' ? pl.x0 + pl.pos : pl.x0;
  const ny = pl.axis === 'v' ? pl.y0 - pl.pos : pl.y0;
  pl.dx = nx - pl.x; pl.dy = ny - pl.y;
  pl.x = nx; pl.y = ny;
}

// Landet o auf einer Plattform? prevBottom = Unterkante vor der Bewegung
export function landOnPlatforms(o, platforms, prevBottom) {
  if (o.vy < 0) return null;
  for (const pl of platforms) {
    const overX = o.x + o.w > pl.x && o.x < pl.x + pl.w;
    if (overX && prevBottom <= pl.y + 2 && o.y + o.h >= pl.y) {
      o.y = pl.y - o.h;
      o.vy = 0;
      o.onGround = true;
      return pl;
    }
  }
  return null;
}
