import { TILE } from '../config.js';
import { PALETTE } from '../data/palette.js';
import { PARTICLE_LIFE } from '../particles.js';
import { drawSprite } from './assets.js';
import { drawText } from './font.js';

// Alle Positionen werden gerundet, damit nichts zwischen zwei Pixeln landet.
const R = Math.round;
const C = PALETTE;

const DEFAULT_BIOME = {
  sky: [C.c, C.c, C.c, C.a], cloud: C.w, far: C.t, near: C.g, tileRemap: null, key: 'wiese',
};

export function draw(ctx, game) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const { world, camX, camY, time } = game;
  const biome = game.biome || DEFAULT_BIOME;

  drawBackground(ctx, W, H, camX, time, biome);

  ctx.save();
  ctx.translate(-R(camX), -R(camY));
  drawTiles(ctx, world, camX, W, time, biome);
  drawPlatforms(ctx, world.platforms);
  drawCoins(ctx, world.coins, time);
  drawEnemies(ctx, world.enemies, time);
  if (game.state !== 'dead') drawPlayer(ctx, world.player, time);
  drawParticles(ctx, world.particles);
  ctx.restore();

  drawDeathWall(ctx, H, time);
  drawHud(ctx, game, W);
  if (game.state === 'ready') drawReady(ctx, W, H, time);
  if (game.state === 'dead') drawDead(ctx, W, H, game);
}

// ---------------- Hintergrund ----------------
function drawBackground(ctx, W, H, camX, time, biome) {
  ctx.drawImage(skyFor(biome, W, H), 0, 0);

  // Wolken (Parallax 0.15)
  ctx.fillStyle = biome.cloud;
  for (let i = 0; i < 8; i++) {
    const span = W + 80;
    const x = ((i * 97 - camX * 0.15 - time * 4) % span + span) % span - 40;
    cloud(ctx, R(x), 18 + (i * 29) % 70, i % 2);
  }

  // Hügel in zwei Ebenen, Spalte für Spalte (pixelgenaue Kanten)
  hills(ctx, W, H, camX * 0.25, biome.far, 70, 18, 0.013, 0.031);
  hills(ctx, W, H, camX * 0.5, biome.near, 40, 14, 0.021, 0.047);
}

// Himmel in harten Farbstreifen mit Dither-Übergängen – einmal pro Biom gebaut und gemerkt
const skyCache = new Map();
function skyFor(biome, W, H) {
  let c = skyCache.get(biome.key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const n = biome.sky.length, bh = Math.ceil(H / n);
  biome.sky.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * bh, W, bh); });
  for (let i = 1; i < n; i++) {
    if (biome.sky[i] === biome.sky[i - 1]) continue;
    g.fillStyle = biome.sky[i];
    for (let row = 1; row <= 4; row++) {
      const step = row <= 2 ? 2 : 4;
      for (let x = row % 2; x < W; x += step) g.fillRect(x, i * bh - row, 1, 1);
    }
  }
  skyCache.set(biome.key, c);
  return c;
}

function hills(ctx, W, H, offset, color, base, amp, f1, f2) {
  ctx.fillStyle = color;
  for (let x = 0; x < W; x++) {
    const wx = x + offset;
    const h = base + Math.sin(wx * f1) * amp + Math.sin(wx * f2 + 1.7) * amp * 0.5;
    ctx.fillRect(x, R(H - h), 1, R(h));
  }
}

function cloud(ctx, x, y, variant) {
  if (variant) {
    ctx.fillRect(x + 4, y, 14, 3); ctx.fillRect(x, y + 3, 26, 5); ctx.fillRect(x + 8, y - 3, 7, 3);
  } else {
    ctx.fillRect(x + 6, y, 18, 3); ctx.fillRect(x + 2, y + 3, 30, 4); ctx.fillRect(x, y + 7, 36, 3); ctx.fillRect(x + 12, y - 3, 8, 3);
  }
}

// ---------------- Welt ----------------
function drawTiles(ctx, world, camX, W, time, biome) {
  const remap = biome.tileRemap, remapKey = biome.key;
  const c0 = Math.floor(camX / TILE), c1 = c0 + Math.ceil(W / TILE) + 1;
  for (let r = 0; r < world.rows; r++) for (let c = c0; c <= c1; c++) {
    const t = world.tileAt(c, r);
    if (t === ' ') continue;
    const x = c * TILE, y = r * TILE;
    const o = { remap, remapKey };
    if (t === '#') drawSprite(ctx, world.tileAt(c, r - 1) === '#' ? 'ground' : 'ground-top', 'default', 0, x, y, o);
    else if (t === '=') drawSprite(ctx, 'brick', 'default', 0, x, y, o);
    else if (t === '^') drawSprite(ctx, 'spikes', 'default', 0, x, y, o);
    else if (t === '~') {
      const shake = world.crumbling.has(c + ',' + r) ? R(Math.sin(time * 70)) : 0;
      drawSprite(ctx, 'crumble', 'default', 0, x + shake, y, o);
    }
  }
}

function drawPlatforms(ctx, platforms) {
  for (const pl of platforms) {
    for (let i = 0; i < pl.w; i += TILE) drawSprite(ctx, 'lift', 'default', 0, pl.x + i, pl.y);
  }
}

function drawCoins(ctx, coins, time) {
  for (const c of coins) {
    if (c.taken) continue;
    const bob = R(Math.sin(time * 3 + c.x * 0.1) * 1.5);
    drawSprite(ctx, 'coin', 'spin', time + c.x * 0.01, c.x, c.y + 1 + bob);
  }
}

function drawEnemies(ctx, enemies, time) {
  for (const e of enemies) {
    if (!e.alive && e.squish <= 0) continue;
    const cx = e.x + e.w / 2 - 8;
    if (e.type === 'walker') {
      if (!e.alive) drawSprite(ctx, 'walker', 'squished', 0, cx, e.y + e.h - 16);
      else drawSprite(ctx, 'walker', 'walk', e.t, cx, e.y + e.h - 15, { flip: e.vx > 0 });
    } else if (e.type === 'jumper') {
      const anim = e.onGround && e.alive ? 'idle' : 'jump';
      drawSprite(ctx, 'jumper', anim, 0, cx, e.y + e.h - 14, e.alive ? {} : { h: 8 });
    } else if (e.type === 'flyer') {
      drawSprite(ctx, 'flyer', 'fly', e.t, cx, e.y + e.h / 2 - 8, e.alive ? {} : { h: 8 });
    }
  }
}

function drawPlayer(ctx, p, time) {
  let anim = 'idle';
  if (!p.onGround) anim = p.vy < 0 ? 'jump' : 'fall';
  else if (Math.abs(p.vx) > 15) anim = 'run';
  const w = R(16 * p.scaleX), h = R(16 * p.scaleY);
  const x = p.x + p.w / 2 - w / 2, y = p.y + p.h - h;
  drawSprite(ctx, 'player', anim, time, x, y, { flip: p.facing < 0, w, h });
}

function drawParticles(ctx, particles) {
  for (const pt of particles) {
    ctx.globalAlpha = Math.max(0, pt.life / PARTICLE_LIFE);
    ctx.fillStyle = pt.color; ctx.fillRect(R(pt.x) - 1, R(pt.y) - 1, 2, 2);
  }
  ctx.globalAlpha = 1;
}

// ---------------- Oberfläche ----------------
// Linker Bildrand: pulsierende Stachelwand – wer hier hängen bleibt, stirbt
function drawDeathWall(ctx, H, time) {
  ctx.globalAlpha = 0.6 + Math.sin(time * 8) * 0.25;
  ctx.fillStyle = C.x; ctx.fillRect(0, 0, 3, H);
  ctx.fillStyle = C.o;
  for (let y = 0; y < H; y += 8) { ctx.fillRect(3, y + 2, 2, 4); ctx.fillRect(5, y + 3, 1, 2); }
  ctx.globalAlpha = 1;
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = C.k; ctx.globalAlpha = 0.6; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
}

function drawHud(ctx, game, W) {
  panel(ctx, 6, 6, 92, 30);
  drawText(ctx, game.meters + ' M', 11, 10, { scale: 2, shadow: C.k });
  drawText(ctx, 'PUNKTE ' + game.score, 11, 27, { color: C.q });

  const best = 'REKORD ' + game.best;
  panel(ctx, W - 14 - best.length * 6, 6, best.length * 6 + 8, 13);
  drawText(ctx, best, W - 10, 9, { align: 'right' });
}

function drawReady(ctx, W, H, time) {
  if (Math.floor(time * 2) % 2) return;  // blinkender Hinweis
  panel(ctx, W / 2 - 92, H / 2 - 44, 184, 17);
  drawText(ctx, '→ ODER LEERTASTE: LOS!', W / 2, H / 2 - 39, { align: 'center' });
}

function drawDead(ctx, W, H, game) {
  ctx.fillStyle = C.k; ctx.globalAlpha = 0.7; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  drawText(ctx, game.meters + ' M', W / 2, H / 2 - 34, { scale: 4, align: 'center', shadow: C.r });
  drawText(ctx, 'PUNKTE ' + game.score, W / 2, H / 2 + 4, { scale: 2, align: 'center', color: C.q });
  drawText(ctx, game.newRecord ? 'NEUER REKORD!' : 'REKORD ' + game.best, W / 2, H / 2 + 24,
    { align: 'center', color: game.newRecord ? C.l : C.w });
}
