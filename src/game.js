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
import { LocalStore, qualifies } from './storage/leaderboard.js';
import { JUMP_KEYS } from './input.js';

const NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Hält den kompletten Spielzustand
//   'ready' – Spieler steht am Start, Scroll wartet auf die erste Eingabe
//   'run'   – Auto-Scroll läuft
//   'dead'  – kurzer Moment nach dem Tod
//   'name'  – Top-10-Platz geschafft: drei Buchstaben eingeben
//   'board' – Rangliste anzeigen
// Ohne Top-10-Platz geht es nach 'dead' sofort wieder zu 'ready'.
export class Game {
  constructor(viewWidth, viewHeight, store = new LocalStore()) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.best = loadBest();
    this.store = store;
    this.leaderboard = [];
    this.lastName = 'AAA';
    this.store.load().then(list => { this.leaderboard = list; });
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
    this.stompPoints = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.effects = { doublejump: 0, shield: false, slowmo: 0 };
    this.popups = [];   // kurze Texte in der Welt, z. B. "SCHILD!"
    ensureGenerated(this.world, Math.ceil(this.viewWidth / TILE) + GENERATE_AHEAD);
  }

  get meters() { return Math.floor(this.distance / TILE); }
  get tier() { return tierAt(this.meters); }
  get score() { return this.meters + this.coins * POINTS_COIN + this.stompPoints; }

  jump() {
    if (this.state === 'ready' || this.state === 'run') this.world.player.jumpBuffer = JUMP_BUFFER;
  }

  // Tasten für Menüs; gibt true zurück, wenn die Taste verbraucht wurde
  handleKey(code, key, repeat) {
    if (this.state === 'name') return this.handleNameKey(code, key, repeat);
    if (this.state === 'board') {
      if (!repeat && (JUMP_KEYS.includes(code) || code === 'Enter' || code === 'KeyR') && this.boardTimer > 0.4) this.restart();
      return true;
    }
    if (code === 'KeyR' && !repeat) { this.restart(); return true; }
    if (JUMP_KEYS.includes(code)) { if (!repeat) this.jump(); return true; }
    return false;
  }

  handleNameKey(code, key, repeat) {
    const n = this.nameEntry;
    const cycle = d => {
      const i = NAME_CHARS.indexOf(n.chars[n.slot]);
      n.chars[n.slot] = NAME_CHARS[(i + d + NAME_CHARS.length) % NAME_CHARS.length];
    };
    if (key.length === 1 && NAME_CHARS.includes(key.toUpperCase())) {
      // Buchstaben direkt tippen (hat Vorrang – sonst wäre "A" gleichzeitig "links")
      n.chars[n.slot] = key.toUpperCase();
      if (n.slot < 2) n.slot++;
    } else if (code === 'ArrowUp' || code === 'ArrowRight') cycle(1);
    else if (code === 'ArrowDown' || code === 'ArrowLeft') cycle(-1);
    else if (code === 'Backspace') n.slot = Math.max(0, n.slot - 1);
    else if (!repeat && (code === 'Space' || code === 'Enter')) {
      if (n.slot < 2) n.slot++;
      else this.submitName();
    }
    return true;
  }

  async submitName() {
    const name = this.nameEntry.chars.join('');
    this.lastName = name;
    const entry = {
      name, score: this.score, meters: this.meters, coins: this.coins,
      combo: this.bestCombo, seed: this.seed, date: new Date().toISOString(),
    };
    this.state = 'board';
    this.boardTimer = 0;
    const { entries, rank } = await this.store.submit(entry);
    this.leaderboard = entries;
    this.boardRank = rank;
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

    if (this.state === 'name') return;
    if (this.state === 'board') { this.boardTimer += dt; return; }
    if (this.state === 'dead') {
      this.deadTimer += dt;
      if (this.deadTimer >= DEATH_PAUSE) {
        if (qualifies(this.leaderboard, this.score)) {
          this.state = 'name';
          this.nameEntry = { chars: [...this.lastName], slot: 0 };
        } else this.restart();
      }
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
    if (p.onGround) this.combo = 0;  // Kombo endet, sobald man wieder Boden berührt
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

  // Gegner besiegt: jeder weitere Gegner ohne Bodenkontakt zählt mehr
  stomp(e) {
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const pts = POINTS_STOMP * this.combo;
    this.stompPoints += pts;
    this.popup(this.combo > 1 ? `+${pts} ×${this.combo}` : `+${pts}`, e.x + e.w / 2, e.y - 6,
      this.combo > 1 ? '#ffcd75' : '#f4f4f4');
  }

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
