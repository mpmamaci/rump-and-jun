import { TILE, ROWS } from './config.js';
import { createRng } from './core/random.js';
import { createPlayer } from './entities/player.js';
import { createEnemy } from './entities/enemy.js';
import { START_CHUNK, CHUNKS } from './data/chunks.js';

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
    rng: createRng(seed),
    player: null, enemies: [], coins: [], particles: [],
    tileAt(c, r) {
      if (r < 0 || r >= ROWS) return ' ';
      const col = this.columns[c - this.colOffset];
      return col ? col[r] : ' ';
    },
  };
  appendChunk(world, START_CHUNK);
  return world;
}

// Hängt so lange Chunks an, bis die Welt bis untilCol reicht
export function ensureGenerated(world, untilCol) {
  while (world.nextCol < untilCol) appendChunk(world, pickChunk(world));
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
  world.coins = world.coins.filter(c => !c.taken && c.x + c.w > minX);
}

function pickChunk(world) {
  // nie zweimal derselbe Chunk direkt hintereinander
  const pool = CHUNKS.filter(c => c !== world.lastChunk);
  return pool[Math.floor(world.rng() * pool.length)];
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
      if (ch === '#' || ch === '=' || ch === '^') col[r] = ch;
      else if (ch === 'P' && !world.player) world.player = createPlayer(x + 2, y + 2);
      else if (ch === 'C') world.coins.push({ x: x + 4, y: y + 3, w: 8, h: 10, taken: false });
      else if (ch === 'E') world.enemies.push(createEnemy(x + 2, y + 5));
    }
    world.columns.push(col);
  }
  world.nextCol += width;
  world.lastChunk = chunk;
}
