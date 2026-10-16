import { TILE, GRAVITY, MAX_FALL, JUMP_SPEED, ENEMY_SPEED } from '../config.js';
import { moveAndCollide, enemySolid, overlap } from '../physics.js';
import { puff } from '../particles.js';

export function createEnemy(x, y) {
  return { x, y, w: 13, h: 11, vx: -ENEMY_SPEED, vy: 0, alive: true, squish: 0 };
}

export function updateEnemy(e, game, dt) {
  const world = game.world;
  const p = world.player;
  if (!e.alive) { e.squish -= dt; return; }

  const dirBefore = Math.sign(e.vx);
  e.vy = Math.min(e.vy + GRAVITY * dt, MAX_FALL);
  moveAndCollide(e, dt, world, enemySolid);

  // An Wänden oder Kanten umdrehen
  const aheadX = dirBefore > 0 ? e.x + e.w + 1 : e.x - 1;
  const groundAhead = enemySolid(world.tileAt(Math.floor(aheadX / TILE), Math.floor((e.y + e.h + 1) / TILE)));
  if (e.hitWall || (e.onGround && !groundAhead)) e.vx = -dirBefore * ENEMY_SPEED;

  if (overlap(p, e)) {
    if (p.vy > 0 && p.y + p.h - e.y < 7) {   // von oben drauf gesprungen
      e.alive = false; e.squish = 0.4;
      p.vy = -JUMP_SPEED * 0.6;
      game.stomp();
      puff(world.particles, e.x + e.w / 2, e.y + e.h / 2, 10, '#b06ad9');
    } else game.die();
  }
}
