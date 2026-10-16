import { TILE, START_LIVES, JUMP_BUFFER } from './config.js';
import { loadLevel } from './world.js';
import { updatePlayer } from './entities/player.js';
import { updateEnemy } from './entities/enemy.js';
import { puff, updateParticles } from './particles.js';
import { overlap } from './physics.js';
import level1 from './levels/level1.js';

// Hält den kompletten Spielzustand: Welt, Punkte, Leben, Kamera
export class Game {
  constructor(viewWidth) {
    this.viewWidth = viewWidth;
    this.restart();
  }

  restart() {
    this.score = 0;
    this.lives = START_LIVES;
    this.state = 'play';   // 'play' | 'win' | 'over'
    this.time = 0;
    this.camX = 0;
    this.world = loadLevel(level1);
  }

  jump() { this.world.player.jumpBuffer = JUMP_BUFFER; }

  update(dt) {
    const w = this.world;
    this.time += dt;
    w.particles = updateParticles(w.particles, dt);
    if (this.state !== 'play') return;

    const p = w.player;
    updatePlayer(p, this, dt);
    for (const e of w.enemies) updateEnemy(e, this, dt);

    // --- Münzen
    for (const c of w.coins) {
      if (!c.taken && overlap(p, c)) {
        c.taken = true; this.score += 10;
        puff(w.particles, c.x + c.w / 2, c.y + c.h / 2, 8, '#ffd23f');
      }
    }

    // --- Ziel
    if (w.flag && overlap(p, w.flag)) { this.state = 'win'; this.score += this.lives * 500; }

    // --- Kamera folgt dem Spieler weich
    const target = Math.max(0, Math.min(p.x + p.w / 2 - this.viewWidth / 2, w.cols * TILE - this.viewWidth));
    this.camX += (target - this.camX) * Math.min(1, 6 * dt);
  }

  die() {
    const p = this.world.player;
    if (p.invul > 0 || this.state !== 'play') return;
    puff(this.world.particles, p.x + p.w / 2, p.y + p.h / 2, 16, '#e84a5f');
    this.lives--;
    if (this.lives <= 0) { this.state = 'over'; return; }
    p.x = p.startX; p.y = p.startY;
    p.vx = p.vy = 0;
    p.invul = 1.5;
  }
}
