import {
  TILE, ROWS, JUMP_BUFFER, DEATH_PAUSE, GENERATE_AHEAD, POINTS_COIN, POINTS_STOMP,
  DOUBLEJUMP_TIME, SLOWMO_TIME, SLOWMO_FACTOR, HURT_INVUL, JUMP_SPEED,
} from './config.js';
import { POWERUP_INFO } from './entities/powerup.js';
import { createWorld, ensureGenerated, pruneBehind, updateCrumbling } from './world/world.js';
import { scrollSpeedAt, tierAt } from './world/difficulty.js';
import { randomSeed } from './core/random.js';
import { moveAxis } from './input.js';
import { updatePlayer } from './entities/player.js';
import { updateEnemy } from './entities/enemy.js';
import { updatePlatform } from './entities/platform.js';
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
    this.scrollSpeed = scrollSpeedAt(0);
    this.distance = 0;
    this.coins = 0;
    this.stomps = 0;
    this.effects = { doublejump: 0, shield: false, slowmo: 0 };
    this.popups = [];   // kurze Texte in der Welt, z. B. "SCHILD!"
    ensureGenerated(this.world, Math.ceil(this.viewWidth / TILE) + GENERATE_AHEAD);
  }

  get meters() { return Math.floor(this.distance / TILE); }
  get tier() { return tierAt(this.meters); }
  get score() { return this.meters + this.coins * POINTS_COIN + this.stomps * POINTS_STOMP; }

  jump() {
    if (this.state !== 'dead') this.world.player.jumpBuffer = JUMP_BUFFER;
  }

  // Zeitlupe verlangsamt alles außer dem Spieler
  get worldSpeed() { return this.effects.slowmo > 0 ? SLOWMO_FACTOR : 1; }

  update(dt) {
    const w = this.world;
    const p = w.player;
    this.time += dt;
    w.particles = updateParticles(w.particles, dt);
    for (const pop of this.popups) { pop.t += dt; pop.y -= 18 * dt; }
    this.popups = this.popups.filter(pop => pop.t < 1.2);

    if (this.state === 'dead') {
      this.deadTimer += dt;
      if (this.deadTimer >= DEATH_PAUSE) this.restart();
      return;
    }
    if (this.state === 'ready' && (moveAxis() !== 0 || p.jumpBuffer > 0)) this.state = 'run';
    const wdt = dt * this.worldSpeed;
    if (this.state === 'run') {
      this.scrollSpeed = scrollSpeedAt(this.meters);
      this.camX += this.scrollSpeed * wdt;
      this.effects.doublejump = Math.max(0, this.effects.doublejump - dt);
      this.effects.slowmo = Math.max(0, this.effects.slowmo - dt);
    }

    for (const pl of w.platforms) updatePlatform(pl, wdt);
    updatePlayer(p, this, dt);
    for (const e of w.enemies) updateEnemy(e, this, wdt);
    updateCrumbling(w, dt, (c, r) => puff(w.particles, c * TILE + 8, r * TILE + 8, 8, '#a0703a'));
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

    // --- Power-ups
    for (const pu of w.powerups) {
      pu.t += dt;
      if (!pu.taken && overlap(p, pu)) {
        pu.taken = true;
        this.collectPowerup(pu);
      }
    }

    this.distance = Math.max(this.distance, p.x - p.startX);

    // --- Welt rechts weiterbauen, links aufräumen
    const firstCol = Math.floor(this.camX / TILE);
    ensureGenerated(w, firstCol + Math.ceil(this.viewWidth / TILE) + GENERATE_AHEAD);
    pruneBehind(w, firstCol - 2);
  }

  stomp() { this.stomps++; }

  onJump() {}

  collectPowerup(pu) {
    const info = POWERUP_INFO[pu.type];
    if (pu.type === 'doublejump') this.effects.doublejump = DOUBLEJUMP_TIME;
    if (pu.type === 'shield') this.effects.shield = true;
    if (pu.type === 'slowmo') this.effects.slowmo = SLOWMO_TIME;
    puff(this.world.particles, pu.x + pu.w / 2, pu.y + pu.h / 2, 14, info.color);
    this.popup(info.label, pu.x + pu.w / 2, pu.y - 4, info.color);
  }

  popup(text, x, y, color = '#f4f4f4') {
    this.popups.push({ text, x, y, color, t: 0 });
  }

  // Treffer durch Gegner oder Stacheln – das Schild fängt genau einen ab
  hurt() {
    const p = this.world.player;
    if (p.invul > 0 || this.state === 'dead') return;
    if (this.effects.shield) {
      this.effects.shield = false;
      p.invul = HURT_INVUL;
      p.vy = -JUMP_SPEED * 0.7;
      puff(this.world.particles, p.x + p.w / 2, p.y + p.h / 2, 18, '#41a6f6');
      this.popup('SCHILD WEG!', p.x + p.w / 2, p.y - 6, '#41a6f6');
      return;
    }
    this.die();
  }

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
