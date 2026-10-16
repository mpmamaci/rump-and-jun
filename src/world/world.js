import { TILE, ROWS, CRUMBLE_TIME, POWERUP_CHANCE, POWERUP_MIN_GAP, ROCKET_CHANCE, ROCKET_MIN_GAP } from '../config.js';
import { createRng } from '../core/random.js';
import { createPlayer } from '../entities/player.js';
import { createEnemy } from '../entities/enemy.js';
import { createPlatform } from '../entities/platform.js';
import { createPowerup, POWERUP_TYPES } from '../entities/powerup.js';
import { START_CHUNK, LANDING_CHUNK, CHUNKS } from '../data/chunks.js';
import { tierAt, chunkWeight } from './difficulty.js';

// ============================================================
//  ENDLOSE WELT
//  Die Welt ist eine Liste von Spalten. Rechts hängen wir neue Chunks an,
//  links werfen wir weg, was die Kamera schon hinter sich gelassen hat.
// ============================================================
export function createWorld(seed) {
  const world = {
    rows: ROWS,
    columns: [],     // columns[i] = Array mit ROWS Zeichen
    colOffset: 0,    // Weltspalte von columns[0]
    nextCol: 0,      // erste noch nicht erzeugte Weltspalte
    lastChunk: null,
    lastPowerupCol: -Infinity,
    lastRocketCol: -Infinity,
    landingAt: null,     // Rakete unterwegs: ab dieser Spalte kommt eine sichere Landezone
    landingStart: null,  // Spalte, an der die Landezone tatsächlich beginnt
    springs: new Map(),  // "spalte,zeile" → Restzeit der Feder-Animation
    rng: createRng(seed),
    player: null, enemies: [], platforms: [], coins: [], powerups: [], particles: [],
    crumbling: new Map(),  // "spalte,zeile" → Restzeit
    tileAt(c, r) {
      if (r < 0 || r >= ROWS) return ' ';
      const col = this.columns[c - this.colOffset];
      return col ? col[r] : ' ';
    },
    setTile(c, r, ch) {
      const col = this.columns[c - this.colOffset];
      if (col && r >= 0 && r < ROWS) col[r] = ch;
    },
  };
  appendChunk(world, START_CHUNK);
  return world;
}

// Hängt so lange Chunks an, bis die Welt bis untilCol reicht
export function ensureGenerated(world, untilCol) {
  while (world.nextCol < untilCol) {
    if (world.landingAt !== null && world.nextCol >= world.landingAt) {
      world.landingStart = world.nextCol;
      world.landingAt = null;
      appendChunk(world, LANDING_CHUNK);
    } else appendChunk(world, pickChunk(world));
  }
}

// Sprungfeder unter den Füßen? Dann Animation starten und true zurückgeben
export function touchSpring(world, c, r) {
  if (world.tileAt(c, r) !== '*') return false;
  world.springs.set(c + ',' + r, 0.25);
  return true;
}

export function updateSprings(world, dt) {
  for (const [key, t] of world.springs) {
    if (t - dt <= 0) world.springs.delete(key); else world.springs.set(key, t - dt);
  }
}

// Entfernt Spalten und Objekte links von fromCol
export function pruneBehind(world, fromCol) {
  const drop = fromCol - world.colOffset;
  if (drop > 0) {
    world.columns.splice(0, drop);
    world.colOffset = fromCol;
  }
  const minX = fromCol * TILE;
  world.enemies = world.enemies.filter(e => e.x + e.w > minX && (e.alive || e.squish > 0));
  world.platforms = world.platforms.filter(pl => pl.x0 + pl.range + pl.w > minX);
  world.coins = world.coins.filter(c => !c.taken && c.x + c.w > minX);
  world.powerups = world.powerups.filter(pu => !pu.taken && pu.x + pu.w > minX);
}

// Bröckel-Plattformen: Timer starten, wenn jemand drauf steht, und abbauen
export function touchCrumble(world, c, r) {
  if (world.tileAt(c, r) !== '~') return;
  const key = c + ',' + r;
  if (!world.crumbling.has(key)) world.crumbling.set(key, CRUMBLE_TIME);
}

export function updateCrumbling(world, dt, onBreak) {
  for (const [key, t] of world.crumbling) {
    const left = t - dt;
    if (left > 0) { world.crumbling.set(key, left); continue; }
    world.crumbling.delete(key);
    const [c, r] = key.split(',').map(Number);
    world.setTile(c, r, ' ');
    onBreak(c, r);
  }
}

function pickChunk(world) {
  const tier = tierAt(world.nextCol);  // 1 Block = 1 Meter
  // nie zweimal derselbe Chunk direkt hintereinander
  const pool = CHUNKS.filter(c => c !== world.lastChunk);
  const weights = pool.map(c => chunkWeight(c.difficulty, tier));
  let roll = world.rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll < 0) return pool[i];
  }
  return pool[0];
}

function appendChunk(world, chunk) {
  const lines = chunk.map;
  const width = Math.max(...lines.map(l => l.length));
  const top = ROWS - lines.length;  // Karte unten an der Welt ausrichten

  for (let i = 0; i < width; i++) {
    const wc = world.nextCol + i;
    const col = new Array(ROWS).fill(' ');
    for (let li = 0; li < lines.length; li++) {
      const r = top + li;
      const ch = lines[li][i] || ' ';
      const x = wc * TILE, y = r * TILE;
      switch (ch) {
        case '#': case '=': case '^': case '~': case '*': col[r] = ch; break;
        case 'P': if (!world.player) world.player = createPlayer(x + 2, y + 2); break;
        case 'C': world.coins.push({ x: x + 4, y: y + 3, w: 8, h: 10, taken: false }); break;
        case 'E': world.enemies.push(createEnemy('walker', x + 2, y + 5)); break;
        case 'J': world.enemies.push(createEnemy('jumper', x + 2, y + 4)); break;
        case 'B': world.enemies.push(createEnemy('flyer', x + 2, y + 4)); break;
        case 'D': world.enemies.push(createEnemy('swooper', x + 2, y + 4)); break;
        case '!':
          // Rakete: selten und nur an schwer erreichbaren Stellen
          if (wc - world.lastRocketCol >= ROCKET_MIN_GAP && world.rng() < ROCKET_CHANCE) {
            world.powerups.push(createPowerup('rocket', x, y));
            world.lastRocketCol = wc;
          }
          break;
        case 'M': world.platforms.push(createPlatform('h', x, y)); break;
        case 'V': world.platforms.push(createPlatform('v', x, y)); break;
        case '?':
          // Nicht jeder ?-Platz bekommt ein Power-up – und nie zu dicht hintereinander
          if (wc - world.lastPowerupCol >= POWERUP_MIN_GAP && world.rng() < POWERUP_CHANCE) {
            const type = POWERUP_TYPES[Math.floor(world.rng() * POWERUP_TYPES.length)];
            world.powerups.push(createPowerup(type, x, y));
            world.lastPowerupCol = wc;
          }
          break;
      }
    }
    world.columns.push(col);
  }
  world.nextCol += width;
  world.lastChunk = chunk;
}
