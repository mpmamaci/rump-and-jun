import {
  TILE, ROWS, JUMP_BUFFER, SCROLL_SPEED, DEATH_PAUSE, GENERATE_AHEAD, POINTS_COIN, POINTS_STOMP,
} from './config.js';
import { createWorld, ensureGenerated, pruneBehind } from './world.js';
import { randomSeed } from './core/random.js';
import { moveAxis } from './input.js';
import { updatePlayer } from './entities/player.js';
import { updateEnemy } from './entities/enemy.js';
import { puff, updateParticles } from './particles.js';
import { overlap } from './physics.js';
import { loadBest, saveBest } from './storage/best.js';

// Hält den kompletten Spielzustand
//   'ready' – Spieler steht am Start, Scroll wartet auf die erste Eingabe
//   'run'   – Auto-Scroll läuft
//   'dead'  – kurzer Moment nach dem Tod, dann automatisch Neustart
export class Game {
  constructor(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.best = loadBest();
    this.restart();
  }

  restart() {
    this.state = 'ready';
    this.time = 0;
    this.deadTimer = 0;
    this.newRecord = false;
    this.seed = randomSeed();
    this.world = createWorld(this.seed);
    this.camX = 0;
    this.camY = ROWS * TILE - this.viewHeight;  // Boden bündig am unteren Rand
    this.scrollSpeed = SCROLL_SPEED;
    this.distance = 0;
    this.coins = 0;
    this.stomps = 0;
    ensureGenerated(this.world, Math.ceil(this.viewWidth / TILE) + GENERATE_AHEAD);
  }

  get meters() { return Math.floor(this.distance / TILE); }
  get score() { return this.meters + this.coins * POINTS_COIN + this.stomps * POINTS_STOMP; }

  jump() {
    if (this.state !== 'dead') this.world.player.jumpBuffer = JUMP_BUFFER;
  }

  update(dt) {
    const w = this.world;
    const p = w.player;
    this.time += dt;
    w.particles = updateParticles(w.particles, dt);

    if (this.state === 'dead') {
      this.deadTimer += dt;
      if (this.deadTimer >= DEATH_PAUSE) this.restart();
      return;
    }
    if (this.state === 'ready' && (moveAxis() !== 0 || p.jumpBuffer > 0)) this.state = 'run';
    if (this.state === 'run') this.camX += this.scrollSpeed * dt;

    updatePlayer(p, this, dt);
    for (const e of w.enemies) updateEnemy(e, this, dt);
    if (this.state === 'dead') return;

    // --- Rechter Bildrand ist eine Wand, linker Bildrand ist tödlich
    const right = this.camX + this.viewWidth - p.w;
    if (p.x > right) { p.x = right; p.vx = Math.min(p.vx, 0); }
    if (p.x < this.camX) return this.die();

    // --- Münzen
    for (const c of w.coins) {
      if (!c.taken && overlap(p, c)) {
        c.taken = true; this.coins++;
        puff(w.particles, c.x + c.w / 2, c.y + c.h / 2, 8, '#ffd23f');
      }
    }

    this.distance = Math.max(this.distance, p.x - p.startX);

    // --- Welt rechts weiterbauen, links aufräumen
    const firstCol = Math.floor(this.camX / TILE);
    ensureGenerated(w, firstCol + Math.ceil(this.viewWidth / TILE) + GENERATE_AHEAD);
    pruneBehind(w, firstCol - 2);
  }

  stomp() { this.stomps++; }

  die() {
    if (this.state === 'dead') return;
    const p = this.world.player;
    puff(this.world.particles, p.x + p.w / 2, p.y + p.h / 2, 16, '#e84a5f');
    this.state = 'dead';
    this.deadTimer = 0;
    if (this.score > this.best) {
      this.best = this.score;
      this.newRecord = true;
      saveBest(this.best);
    }
  }
}
