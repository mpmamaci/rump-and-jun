import { TILE } from './config.js';
import { createPlayer } from './entities/player.js';
import { createEnemy } from './entities/enemy.js';

// Baut aus den Level-Zeilen die Spielwelt
export function loadLevel(levelRows) {
  const cols = Math.max(...levelRows.map(r => r.length));
  const rows = levelRows.length;
  const world = {
    cols, rows, grid: [], player: null, enemies: [], coins: [], flag: null, particles: [],
    tileAt(c, r) {
      if (c < 0 || c >= cols) return '#';  // unsichtbare Wand links/rechts
      if (r < 0 || r >= rows) return ' ';
      return this.grid[r][c];
    },
  };

  for (let r = 0; r < rows; r++) {
    world.grid[r] = [];
    for (let c = 0; c < cols; c++) {
      const ch = levelRows[r][c] || ' ';
      const x = c * TILE, y = r * TILE;
      world.grid[r][c] = ' ';
      if (ch === '#' || ch === '=' || ch === '^') world.grid[r][c] = ch;
      else if (ch === 'P') world.player = createPlayer(x + 6, y + 4);
      else if (ch === 'C') world.coins.push({ x: x + 10, y: y + 8, w: 20, h: 24, taken: false });
      else if (ch === 'E') world.enemies.push(createEnemy(x + 4, y + 12));
      else if (ch === 'F') world.flag = { x: x + 16, y: y - 3 * TILE, w: 12, h: 4 * TILE };
    }
  }
  return world;
}
