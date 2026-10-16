import { TILE } from './config.js';

export const playerSolid = t => t === '#' || t === '=' || t === '~';
export const enemySolid = t => t === '#' || t === '=' || t === '~' || t === '^';

export const overlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// Ruft fn(spalte, zeile) für jeden Block auf, den das Objekt berührt
export function forEachTile(o, fn) {
  const c0 = Math.floor(o.x / TILE), c1 = Math.floor((o.x + o.w - 0.01) / TILE);
  const r0 = Math.floor(o.y / TILE), r1 = Math.floor((o.y + o.h - 0.01) / TILE);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) fn(c, r);
}

// Bewegt ein Objekt erst in X, dann in Y und schiebt es aus festen Blöcken heraus
export function moveAndCollide(o, dt, world, isSolid) {
  o.hitWall = false;
  o.x += o.vx * dt;
  forEachTile(o, (c, r) => {
    if (!isSolid(world.tileAt(c, r))) return;
    if (o.vx > 0) o.x = c * TILE - o.w;
    else if (o.vx < 0) o.x = (c + 1) * TILE;
    o.hitWall = true;
  });
  if (o.hitWall) o.vx = 0;

  o.onGround = false;
  o.y += o.vy * dt;
  forEachTile(o, (c, r) => {
    if (!isSolid(world.tileAt(c, r))) return;
    if (o.vy > 0) { o.y = r * TILE - o.h; o.onGround = true; }
    else if (o.vy < 0) o.y = (r + 1) * TILE;
    o.vy = 0;
  });
}
