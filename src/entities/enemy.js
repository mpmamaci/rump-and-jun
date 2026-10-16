import { TILE, GRAVITY, MAX_FALL, JUMP_SPEED, ENEMY_SPEED, JUMPER_JUMP, FLYER_SPEED, SWOOPER_DIVE } from '../config.js';
import { moveAndCollide, enemySolid, overlap } from '../physics.js';
import { puff } from '../particles.js';

// Gegnertypen:
//   walker – läuft hin und her, dreht an Wänden und Kanten
//   jumper – hüpft in regelmäßigen Abständen hoch
//   flyer  – schwebt in Wellen langsam nach links, ignoriert Blöcke
//   swooper – Raubvogel: kreist oben und stürzt sich auf den Spieler, steigt danach wieder auf
const SIZES = { walker: [13, 11], jumper: [12, 12], flyer: [12, 9], swooper: [13, 9] };
export const ENEMY_COLORS = { walker: '#b06ad9', jumper: '#5fd35f', flyer: '#5f8cd3', swooper: '#ef7d57' };

export function createEnemy(type, x, y) {
  const [w, h] = SIZES[type];
  return {
    type, x, y, w, h, y0: y, vy: 0, alive: true, squish: 0, t: Math.random() * 6,
    vx: type === 'walker' ? -ENEMY_SPEED : type === 'flyer' ? -FLYER_SPEED : 0,
    jumpTimer: 0.6 + Math.random() * 0.8,
    mode: 'hover', modeTime: 0,
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
  } else if (e.type === 'swooper') {
    updateSwooper(e, p, world, dt);
  }

  if (overlap(p, e)) {
    // Mit der Rakete wird jeder Gegner einfach weggerammt
    if (game.effects.rocket) {
      e.alive = false; e.squish = 0.4;
      game.rocketHit(e);
      puff(world.particles, e.x + e.w / 2, e.y + e.h / 2, 12, ENEMY_COLORS[e.type]);
      return;
    }
    if (p.vy > 0 && p.y + p.h - e.y < 7) {   // von oben drauf gesprungen
      e.alive = false; e.squish = 0.4;
      p.vy = -JUMP_SPEED * 0.6;
      game.stomp(e);
      puff(world.particles, e.x + e.w / 2, e.y + e.h / 2, 10, ENEMY_COLORS[e.type]);
    } else game.hurt(e);
  }
}

// Sturzflieger: schwebt → sieht den Spieler vor sich unten → stürzt sich schräg herab → steigt wieder auf
function updateSwooper(e, p, world, dt) {
  e.modeTime += dt;
  if (e.mode === 'hover') {
    e.x -= 8 * dt;
    e.y = e.y0 + Math.sin(e.t * 2.5) * 4;
    const dx = p.x - e.x, dy = p.y - e.y;
    if (dx > -150 && dx < 10 && dy > 20 && e.modeTime > 0.6) {
      // Ziel: dort, wo der Spieler gleich sein wird
      const tx = p.x + p.vx * 0.35 - e.x, ty = p.y - e.y;
      const len = Math.hypot(tx, ty) || 1;
      e.vx = tx / len * SWOOPER_DIVE; e.vy = ty / len * SWOOPER_DIVE;
      e.mode = 'dive'; e.modeTime = 0;
    }
  } else if (e.mode === 'dive') {
    e.x += e.vx * dt; e.y += e.vy * dt;
    const below = world.tileAt(Math.floor((e.x + e.w / 2) / TILE), Math.floor((e.y + e.h + 2) / TILE));
    if (e.modeTime > 1.4 || below === '#' || below === '=' || below === '~' || below === '*') {
      e.mode = 'rise'; e.modeTime = 0;
    }
  } else {  // rise
    e.vx = -30; e.vy = -70;
    e.x += e.vx * dt; e.y += e.vy * dt;
    if (e.y <= e.y0) { e.y = e.y0; e.mode = 'hover'; e.modeTime = 0; }
  }
}
