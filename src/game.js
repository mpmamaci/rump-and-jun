import {
  TILE, ROWS, JUMP_BUFFER, DEATH_PAUSE, GENERATE_AHEAD, POINTS_COIN, POINTS_STOMP,
  DOUBLEJUMP_TIME, SLOWMO_TIME, SLOWMO_FACTOR, HURT_INVUL, JUMP_SPEED, ZONE_METERS,
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
import { createMenu, menuKey, menuTap, labelOf } from './ui/menu.js';
import { biomeForZone } from './data/biomes.js';

const NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Hält den kompletten Spielzustand
//   'title'    – Titelbild mit Menü
//   'settings' – Einstellungen (vom Titel oder aus der Pause)
//   'paused'   – Pause-Menü
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
    this.sound = () => {};   // wird in main.js mit dem Audio-System verbunden
    // Ton-Schalter – main.js verbindet sie mit dem Audio-System
    this.options = { sound: () => true, setSound() {}, music: () => true, setMusic() {} };
    this.openTitle();
  }

  // ---------------- Menüs ----------------
  openTitle() {
    this.restart();
    this.state = 'title';
    this.menu = createMenu('title', 150, [
      { label: 'SPIELEN', action: () => this.restart() },
      { label: 'RANGLISTE', action: () => this.openBoard(true) },
      { label: 'EINSTELLUNGEN', action: () => this.openSettings('title') },
    ]);
  }

  openSettings(returnTo) {
    const back = () => (returnTo === 'title' ? this.openTitleMenuOnly() : this.openPause());
    const o = this.options;
    this.state = 'settings';
    this.menu = createMenu('settings', 100, [
      { label: () => 'SOUNDEFFEKTE: ' + (o.sound() ? 'AN' : 'AUS'), action: () => o.setSound(!o.sound()) },
      { label: () => 'MUSIK: ' + (o.music() ? 'AN' : 'AUS'), action: () => o.setMusic(!o.music()) },
      { label: 'ZURÜCK', action: back },
    ], back);
  }

  // zurück zum Titelmenü, ohne die Hintergrund-Welt neu zu bauen
  openTitleMenuOnly() {
    this.state = 'title';
    this.menu = createMenu('title', 150, [
      { label: 'SPIELEN', action: () => this.restart() },
      { label: 'RANGLISTE', action: () => this.openBoard(true) },
      { label: 'EINSTELLUNGEN', action: () => this.openSettings('title') },
    ]);
    this.menu.index = 2;
  }

  openPause() {
    if (this.state === 'run' || this.state === 'ready') this.pausedFrom = this.state;
    this.state = 'paused';
    const resume = () => { this.state = this.pausedFrom || 'run'; };
    this.menu = createMenu('paused', 110, [
      { label: 'WEITER', action: resume },
      { label: 'NEUSTART', action: () => this.restart() },
      { label: 'EINSTELLUNGEN', action: () => this.openSettings('pause') },
      { label: 'HAUPTMENÜ', action: () => this.openTitle() },
    ], resume);
  }

  pause() {
    if (this.state === 'run' || this.state === 'ready') { this.sound('blip'); this.openPause(); }
  }

  openBoard(fromTitle) {
    this.state = 'board';
    this.boardFromTitle = fromTitle;
    this.boardRank = -1;
    this.boardTimer = 0;
  }

  menuLabel(item) { return labelOf(item); }

  // Im Titel (und den Menüs davor) fährt nur die Kamera, der Spieler ist unsichtbar
  get inTitle() {
    return this.state === 'title' || (this.state === 'settings' && !this.pausedFrom) || (this.state === 'board' && this.boardFromTitle);
  }

  restart() {
    this.state = 'ready';
    this.pausedFrom = null;
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
    this.shake = 0;      // Bildschirmwackeln in Pixeln
    this.lastZone = 0;
    this.banner = null;  // großer Text beim Zonenwechsel
    ensureGenerated(this.world, Math.ceil(this.viewWidth / TILE) + GENERATE_AHEAD);
  }

  get meters() { return Math.floor(this.distance / TILE); }
  get tier() { return tierAt(this.meters); }
  get zone() { return Math.floor(this.meters / ZONE_METERS); }  // alle 500 m neue Zone (Musik, Biom)
  get biome() { return biomeForZone(this.inTitle ? 0 : this.zone); }

  addShake(px) { this.shake = Math.max(this.shake, px); }

  get score() { return this.meters + this.coins * POINTS_COIN + this.stompPoints; }

  jump() {
    if (this.state === 'ready' || this.state === 'run') this.world.player.jumpBuffer = JUMP_BUFFER;
  }

  // Tasten für Menüs; gibt true zurück, wenn die Taste verbraucht wurde
  handleKey(code, key, repeat) {
    if (this.state === 'name') return this.handleNameKey(code, key, repeat);
    if (this.state === 'title' || this.state === 'paused' || this.state === 'settings') {
      menuKey(this.menu, code, repeat, this.sound);
      return true;
    }
    if (this.state === 'board') {
      const go = !repeat && (JUMP_KEYS.includes(code) || code === 'Enter' || code === 'KeyR' || code === 'Escape');
      if (go && this.boardTimer > 0.4) this.leaveBoard();
      return true;
    }
    if ((code === 'Escape' || code === 'KeyP') && !repeat) { this.pause(); return true; }
    if (code === 'KeyR' && !repeat) { this.restart(); return true; }
    if (JUMP_KEYS.includes(code)) { if (!repeat) this.jump(); return true; }
    return false;
  }

  leaveBoard() {
    this.sound('confirm');
    if (this.boardFromTitle) {
      this.openTitleMenuOnly();
      this.menu.index = 1;
    } else this.restart();
  }

  // Antippen/Klicken auf das Spielbild (Koordinaten in Spielpixeln)
  handleTap(x, y) {
    if (this.state === 'title' || this.state === 'paused' || this.state === 'settings') {
      menuTap(this.menu, x, y, this.viewWidth, this.sound);
    } else if (this.state === 'board' && this.boardTimer > 0.4) {
      this.leaveBoard();
    }
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
      this.sound('blip');
    } else if (code === 'ArrowUp' || code === 'ArrowRight') { cycle(1); this.sound('blip'); }
    else if (code === 'ArrowDown' || code === 'ArrowLeft') { cycle(-1); this.sound('blip'); }
    else if (code === 'Backspace') n.slot = Math.max(0, n.slot - 1);
    else if (!repeat && (code === 'Space' || code === 'Enter')) {
      this.sound('confirm');
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
    this.shake = Math.max(0, this.shake - 24 * dt);
    if (this.banner) { this.banner.t += dt; if (this.banner.t > 2.5) this.banner = null; }

    if (this.inTitle) {
      // Titel: Kamera fährt langsam über die Welt
      this.camX += 22 * dt;
      for (const pl of w.platforms) updatePlatform(pl, dt);
      const firstCol = Math.floor(this.camX / TILE);
      ensureGenerated(w, firstCol + Math.ceil(this.viewWidth / TILE) + GENERATE_AHEAD);
      pruneBehind(w, firstCol - 2);
    }
    if (this.state === 'board') { this.boardTimer += dt; return; }
    if (this.state !== 'ready' && this.state !== 'run' && this.state !== 'dead') return;
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
    if (this.state === 'ready' && (moveAxis() !== 0 || p.jumpBuffer > 0)) { this.state = 'run'; this.sound('start'); }
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
    updateCrumbling(w, dt, (c, r) => { puff(w.particles, c * TILE + 8, r * TILE + 8, 8, '#a0703a'); this.sound('crumble'); });
    if (this.state === 'dead') return;

    // --- Rechter Bildrand ist eine Wand, linker Bildrand ist tödlich
    const right = this.camX + this.viewWidth - p.w;
    if (p.x > right) { p.x = right; p.vx = Math.min(p.vx, 0); }
    if (p.x < this.camX) return this.die();

    // --- Münzen
    for (const c of w.coins) {
      if (!c.taken && overlap(p, c)) {
        c.taken = true; this.coins++;
        this.sound('coin');
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

    // --- Neue Zone erreicht: Biom & Musik wechseln, Banner zeigen
    if (this.zone !== this.lastZone) {
      this.lastZone = this.zone;
      this.banner = { title: `${this.zone * ZONE_METERS} M`, text: this.biome.name, t: 0 };
      this.sound('powerup');
    }

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
    this.sound('stomp', this.combo);
    this.addShake(2);
    this.stompPoints += pts;
    this.popup(this.combo > 1 ? `+${pts} ×${this.combo}` : `+${pts}`, e.x + e.w / 2, e.y - 6,
      this.combo > 1 ? '#ffcd75' : '#f4f4f4');
  }

  onJump(double) { this.sound(double ? 'doublejump' : 'jump'); }

  collectPowerup(pu) {
    const info = POWERUP_INFO[pu.type];
    if (pu.type === 'doublejump') this.effects.doublejump = DOUBLEJUMP_TIME;
    if (pu.type === 'shield') this.effects.shield = true;
    if (pu.type === 'slowmo') this.effects.slowmo = SLOWMO_TIME;
    puff(this.world.particles, pu.x + pu.w / 2, pu.y + pu.h / 2, 14, info.color);
    this.sound('powerup');
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
      this.sound('shieldbreak');
      this.addShake(4);
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
    this.sound('death');
    this.addShake(7);
    if (this.score > this.best) {
      this.best = this.score;
      this.newRecord = true;
      saveBest(this.best);
      this.sound('record');
    }
  }
}
