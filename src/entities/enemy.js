import { TILE, GRAVITY, MAX_FALL, JUMP_SPEED, ENEMY_SPEED, JUMPER_JUMP, FLYER_SPEED } from '../config.js';
import { moveAndCollide, enemySolid, overlap } from '../physics.js';
import { puff } from '../particles.js';

// Gegnertypen:
//   walker – läuft hin und her, dreht an Wänden und Kanten
//   jumper – hüpft in regelmäßigen Abständen hoch
//   flyer  – schwebt in Wellen langsam nach links, ignoriert Blöcke
const SIZES = { walker: [13, 11], jumper: [12, 12], flyer: [12, 9] };
export const ENEMY_COLORS = { walker: '#b06ad9', jumper: '#5fd35f', flyer: '#5f8cd3' };

export function createEnemy(type, x, y) {
  const [w, h] = SIZES[type];
  return {
    type, x, y, w, h, y0: y, vy: 0, alive: true, squish: 0, t: Math.random() * 6,
    vx: type === 'walker' ? -ENEMY_SPEED : type === 'flyer' ? -FLYER_SPEED : 0,
    jumpTimer: 0.6 + Math.random() * 0.8,
  };
}

export function updateEnemy(e, game, dt) {
  const world = game.world;
  const p = world.player;
  if (!e.alive) { e.squish -= dt; return; }
  e.t += dt;

  if (e.type === 'walker') {
    const dirBefore = Math.sign(e.vx);
    e.vy = Math.min(e.vy + GRAVITY * dt, MAX_FALL);
    moveAndCollide(e, dt, world, enemySolid);
    // An Wänden oder Kanten umdrehen
    const aheadX = dirBefore > 0 ? e.x + e.w + 1 : e.x - 1;
    const groundAhead = enemySolid(world.tileAt(Math.floor(aheadX / TILE), Math.floor((e.y + e.h + 1) / TILE)));
    if (e.hitWall || (e.onGround && !groundAhead)) e.vx = -dirBefore * ENEMY_SPEED;
  } else if (e.type === 'jumper') {
    e.vy = Math.min(e.vy + GRAVITY * dt, MAX_FALL);
    moveAndCollide(e, dt, world, enemySolid);
    if (e.onGround) {
      e.jumpTimer -= dt;
      if (e.jumpTimer <= 0) { e.vy = -JUMPER_JUMP; e.jumpTimer = 1.1 + Math.random() * 0.6; }
    }
  } else if (e.type === 'flyer') {
    e.x += e.vx * dt;
    e.y = e.y0 + Math.sin(e.t * 3) * 8;
  }

  if (overlap(p, e)) {
    if (p.vy > 0 && p.y + p.h - e.y < 7) {   // von oben drauf gesprungen
      e.alive = false; e.squish = 0.4;
      p.vy = -JUMP_SPEED * 0.6;
      game.stomp(e);
      puff(world.particles, e.x + e.w / 2, e.y + e.h / 2, 10, ENEMY_COLORS[e.type]);
    } else game.hurt(e);
  }
}
