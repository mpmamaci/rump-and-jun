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
      else if (ch === 'P') world.player = createPlayer(x + 2, y + 2);
      else if (ch === 'C') world.coins.push({ x: x + 4, y: y + 3, w: 8, h: 10, taken: false });
      else if (ch === 'E') world.enemies.push(createEnemy(x + 2, y + 5));
      else if (ch === 'F') world.flag = { x: x + 6, y: y - 3 * TILE, w: 5, h: 4 * TILE };
    }
  }
  return world;
}
