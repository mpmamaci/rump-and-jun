import { TILE } from '../config.js';
import { PALETTE } from '../data/palette.js';
import { PARTICLE_LIFE } from '../particles.js';
import { drawSprite } from './assets.js';
import { drawText } from './font.js';
import { POWERUP_INFO } from '../entities/powerup.js';
import { DOUBLEJUMP_TIME, SLOWMO_TIME } from '../config.js';
import { menuLayout, labelOf } from '../ui/menu.js';

// Alle Positionen werden gerundet, damit nichts zwischen zwei Pixeln landet.
const R = Math.round;
const C = PALETTE;

export function draw(ctx, game) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const { world, camX, camY, time } = game;
  const biome = game.biome;

  // Bildschirmwackeln
  const sx = game.shake ? R((Math.random() * 2 - 1) * game.shake) : 0;
  const sy = game.shake ? R((Math.random() * 2 - 1) * game.shake) : 0;
  ctx.save();
  ctx.translate(sx, sy);
  drawBackground(ctx, W, H, camX, time, biome);

  ctx.save();
  ctx.translate(-R(camX), -R(camY));
  drawTiles(ctx, world, camX, W, time, biome);
  drawPlatforms(ctx, world.platforms);
  drawCoins(ctx, world.coins, time);
  drawPowerups(ctx, world.powerups, time);
  drawEnemies(ctx, world.enemies, time);
  if (game.state !== 'dead' && !game.inTitle) drawPlayer(ctx, world.player, time, game.effects);
  drawParticles(ctx, world.particles);
  drawPopups(ctx, game.popups);
  ctx.restore();
  ctx.restore();

  if (game.effects.rocket) drawSpeedLines(ctx, W, H, time);
  if (game.effects.slowmo > 0) {  // Zeitlupe: leichter Blaustich
    ctx.fillStyle = C.n; ctx.globalAlpha = 0.18; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  }

  if (game.inTitle) {
    if (game.state === 'title') drawTitle(ctx, W, H, game, time);
    if (game.state === 'settings') drawMenuScreen(ctx, W, H, game, 'EINSTELLUNGEN', time);
    if (game.state === 'board') drawBoard(ctx, W, H, game, time);
    return;
  }

  drawDeathWall(ctx, H, time);
  drawHud(ctx, game, W);
  if (game.banner && game.state === 'run') drawBanner(ctx, W, game.banner);
  if (game.state === 'ready') drawReady(ctx, W, H, time);
  if (game.state === 'paused') drawMenuScreen(ctx, W, H, game, 'PAUSE', time);
  if (game.state === 'settings') drawMenuScreen(ctx, W, H, game, 'EINSTELLUNGEN', time);
  if (game.state === 'dead') drawDead(ctx, W, H, game);
  if (game.state === 'name') drawNameEntry(ctx, W, H, game, time);
  if (game.state === 'board') drawBoard(ctx, W, H, game, time);
}

// ---------------- Hintergrund ----------------
function drawBackground(ctx, W, H, camX, time, biome) {
  ctx.drawImage(skyFor(biome, W, H), 0, 0);

  // Wolken (Parallax 0.15)
  ctx.fillStyle = biome.cloud;
  for (let i = 0; biome.cloud && i < 8; i++) {
    const span = W + 80;
    const x = ((i * 97 - camX * 0.15 - time * 4) % span + span) % span - 40;
    cloud(ctx, R(x), 18 + (i * 29) % 70, i % 2);
  }

  // Hügel in zwei Ebenen, Spalte für Spalte (pixelgenaue Kanten)
  hills(ctx, W, H, camX * 0.25, biome.far, 70, 18, 0.013, 0.031);
  if (biome.crystals) crystals(ctx, W, H, camX * 0.35, time);
  hills(ctx, W, H, camX * 0.5, biome.near, 40, 14, 0.021, 0.047);
}

// Leuchtende Kristalle in der Höhle (zwischen den Hügel-Ebenen)
function crystals(ctx, W, H, offset, time) {
  const spacing = 70;
  const first = Math.floor(offset / spacing) - 1;
  for (let i = first; i < first + W / spacing + 3; i++) {
    const x = R(i * spacing - offset + ((i * 37) % 23));
    const h = 10 + ((i * 53) % 14);
    const y = H - 60 - ((i * 29) % 30);
    ctx.globalAlpha = 0.6 + Math.sin(time * 2 + i) * 0.3;
    ctx.fillStyle = C.a;
    for (let k = 0; k < h; k++) ctx.fillRect(x - Math.floor(k / 3), y + k, 1 + 2 * Math.floor(k / 3), 1);
    ctx.fillStyle = C.w; ctx.fillRect(x, y + 1, 1, 3);
  }
  ctx.globalAlpha = 1;
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
  if (biome.stars) {
    // feste "Zufalls"-Sterne, damit sie nicht flackern
    for (let i = 0; i < 90; i++) {
      const x = (i * 197 + 31) % W, y = (i * 113 + 7) % Math.floor(H * 0.6);
      g.fillStyle = i % 7 === 0 ? C.y : i % 3 ? C.s : C.w;
      g.fillRect(x, y, 1, 1);
      if (i % 11 === 0) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
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
    else if (t === '*') drawSprite(ctx, 'spring', world.springs.has(c + ',' + r) ? 'bounce' : 'idle', 0, x, y, o);
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
    } else if (e.type === 'swooper') {
      const anim = e.mode === 'dive' ? 'dive' : 'fly';
      drawSprite(ctx, 'swooper', anim, e.t, cx, e.y + e.h / 2 - 8, e.alive ? { flip: e.vx > 0 } : { h: 8 });
    }
  }
}

// Raketenflug: Geschwindigkeitslinien quer übers Bild
function drawSpeedLines(ctx, W, H, time) {
  ctx.fillStyle = C.w;
  for (let i = 0; i < 18; i++) {
    const y = (i * 53 + 17) % H;
    const len = 20 + (i * 31) % 50;
    const x = W - ((time * (900 + (i % 5) * 200) + i * 97) % (W + len));
    ctx.globalAlpha = 0.25 + (i % 3) * 0.15;
    ctx.fillRect(R(x), y, len, 1);
  }
  ctx.globalAlpha = 1;
}

function drawPowerups(ctx, powerups, time) {
  for (const pu of powerups) {
    if (pu.taken) continue;
    const bob = R(Math.sin(pu.t * 4) * 2);
    const cx = R(pu.x + pu.w / 2), cy = R(pu.y + pu.h / 2) + bob;
    // pulsierender Leuchtring
    const r = 9 + (Math.floor(time * 6) % 2);
    pixelCircle(ctx, cx, cy, r, POWERUP_INFO[pu.type].color, 0.7);
    drawSprite(ctx, 'powerup-' + pu.type, 'default', time, cx - 8, cy - 8);
  }
}

// Kreis aus einzelnen Pixeln (Bresenham) – sieht auf Pixel-Art sauberer aus als arc()
function pixelCircle(ctx, cx, cy, r, color, alpha = 1) {
  ctx.fillStyle = color; ctx.globalAlpha = alpha;
  let x = r, y = 0, err = 1 - r;
  while (x >= y) {
    for (const [dx, dy] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) ctx.fillRect(cx + dx, cy + dy, 1, 1);
    y++;
    if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x) + 1; }
  }
  ctx.globalAlpha = 1;
}

function drawPopups(ctx, popups) {
  for (const pop of popups) {
    ctx.globalAlpha = Math.min(1, (1.2 - pop.t) * 3);
    drawText(ctx, pop.text, pop.x, pop.y, { align: 'center', color: pop.color, shadow: C.k });
  }
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx, p, time, effects) {
  if (effects.rocket) {
    // Auf der Rakete reiten: Rakete unter dem Spieler, Spieler im Sprung-Bild
    drawSprite(ctx, 'powerup-rocket', 'default', time, p.x - 4, p.y + p.h - 9);
    drawSprite(ctx, 'player', 'jump', time, p.x + p.w / 2 - 8, p.y + p.h - 16 - 6);
    return;
  }
  if (p.invul > 0 && Math.floor(time * 16) % 2) return;  // blinkt nach Schild-Treffer
  let anim = 'idle';
  if (!p.onGround) anim = p.vy < 0 ? 'jump' : 'fall';
  else if (Math.abs(p.vx) > 15) anim = 'run';
  const w = R(16 * p.scaleX), h = R(16 * p.scaleY);
  const x = p.x + p.w / 2 - w / 2, y = p.y + p.h - h;
  drawSprite(ctx, 'player', anim, time, x, y, { flip: p.facing < 0, w, h });
  if (effects.shield) pixelCircle(ctx, R(p.x + p.w / 2), R(p.y + p.h / 2), 12, C.c, 0.5 + Math.sin(time * 6) * 0.3);
  if (effects.doublejump > 0 && !p.airJumpUsed && !p.onGround) {  // kleine Flügel: Doppelsprung bereit
    ctx.fillStyle = C.a;
    ctx.fillRect(R(p.x) - 3, R(p.y) + 4, 3, 1); ctx.fillRect(R(p.x) - 2, R(p.y) + 5, 2, 1);
    ctx.fillRect(R(p.x + p.w), R(p.y) + 4, 3, 1); ctx.fillRect(R(p.x + p.w), R(p.y) + 5, 2, 1);
  }
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
  // Kombo unter dem Punkte-Feld (oben rechts im Feld wäre sie bei langen Strecken im Weg)
  if (game.combo > 1) {
    const label = 'KOMBO ×' + game.combo;
    panel(ctx, 6, 38, label.length * 6 + 8, 13);
    drawText(ctx, label, 10, 41, { color: C.o });
  }

  // aktive Power-ups mit Restzeit-Balken
  let ix = 104;
  const fx = game.effects;
  const active = [
    fx.doublejump > 0 && ['doublejump', fx.doublejump / DOUBLEJUMP_TIME],
    fx.shield && ['shield', 1],
    fx.slowmo > 0 && ['slowmo', fx.slowmo / SLOWMO_TIME],
    fx.rocket && ['rocket', 1 - game.rocketProgress],
  ].filter(Boolean);
  for (const [type, left] of active) {
    panel(ctx, ix, 6, 20, 24);
    drawSprite(ctx, 'powerup-' + type, 'default', game.time, ix + 2, 6);
    ctx.fillStyle = POWERUP_INFO[type].color;
    ctx.fillRect(ix + 2, 26, Math.max(1, R(16 * left)), 2);
    ix += 24;
  }

  const best = 'REKORD ' + game.best;
  panel(ctx, W - 14 - best.length * 6, 6, best.length * 6 + 8, 13);
  drawText(ctx, best, W - 10, 9, { align: 'right' });
  if (game.tempo.points > 1) {
    const tag = `${game.tempo.name} ×${game.tempo.points}`;
    panel(ctx, W - 14 - tag.length * 6, 21, tag.length * 6 + 8, 13);
    drawText(ctx, tag, W - 10, 24, { align: 'right', color: C.o });
  }
}

function drawBanner(ctx, W, b) {
  // fährt von oben herein und wieder hinaus
  const inOut = Math.min(1, b.t * 4, (2.5 - b.t) * 4);
  const y = R(-40 + inOut * 84);
  panel(ctx, 0, y - 6, W, 38);
  drawText(ctx, b.title, W / 2, y, { align: 'center', color: C.y });
  drawText(ctx, b.text, W / 2, y + 12, { scale: 2, align: 'center', shadow: C.r });
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
  const extra = `MÜNZEN ${game.coins}` + (game.bestCombo > 1 ? `  ·  BESTE KOMBO ×${game.bestCombo}` : '');
  drawText(ctx, extra, W / 2, H / 2 + 38, { align: 'center', color: C.s });
}

function dim(ctx, W, H, a = 0.8) {
  ctx.fillStyle = C.k; ctx.globalAlpha = a; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
}

function drawNameEntry(ctx, W, H, game, time) {
  dim(ctx, W, H);
  drawText(ctx, 'TOP 10!', W / 2, 30, { scale: 3, align: 'center', color: C.q, shadow: C.r });
  drawText(ctx, `${game.score} PUNKTE  ·  ${game.meters} M`, W / 2, 62, { align: 'center' });
  drawText(ctx, 'DEIN NAME:', W / 2, 88, { align: 'center', color: C.s });

  const n = game.nameEntry;
  const slotW = 36, x0 = W / 2 - slotW * 1.5;
  n.chars.forEach((ch, i) => {
    const cx = x0 + i * slotW + slotW / 2;
    const active = i === n.slot;
    drawText(ctx, ch, cx, 112, { scale: 4, align: 'center', color: active ? C.w : C.m, shadow: C.k });
    if (active) {
      drawText(ctx, '↑', cx, 100, { align: 'center', color: C.a });
      drawText(ctx, '↓', cx, 144, { align: 'center', color: C.a });
      if (Math.floor(time * 3) % 2) { ctx.fillStyle = C.a; ctx.fillRect(R(cx - 12), 154, 24, 2); }
    }
  });
  drawText(ctx, '↑ ↓ ODER TIPPEN: BUCHSTABE', W / 2, 190, { align: 'center', color: C.s });
  drawText(ctx, 'LEERTASTE / ENTER: WEITER', W / 2, 202, { align: 'center', color: C.s });
}

function drawBoard(ctx, W, H, game, time) {
  dim(ctx, W, H, 0.85);
  drawText(ctx, 'RANGLISTE', W / 2, 16, { scale: 2, align: 'center', color: C.q, shadow: C.r });
  drawLeaderboard(ctx, W, game.leaderboard, game.boardRank, time, 42);
  if (game.boardTimer > 0.4 && Math.floor(time * 2) % 2 === 0) {
    drawText(ctx, game.boardFromTitle ? 'LEERTASTE: ZURÜCK' : 'LEERTASTE: NOCHMAL!', W / 2, H - 18, { align: 'center', color: C.a });
  }
}

// ---------------- Menüs ----------------
function drawMenu(ctx, W, game, time) {
  for (const { item, x, y, w, h } of menuLayout(game.menu, W)) {
    const active = game.menu.items[game.menu.index] === item;
    if (active) {
      ctx.fillStyle = C.r; ctx.fillRect(R(x), R(y), w, h);
      ctx.fillStyle = C.x; ctx.fillRect(R(x), R(y), w, 1);
      const nudge = Math.floor(time * 4) % 2;
      drawText(ctx, '→', R(x) + 6 + nudge, R(y) + 4, { color: C.y });
    }
    drawText(ctx, labelOf(item), W / 2, R(y) + 4, { align: 'center', color: active ? C.w : C.s, shadow: active ? C.p : null });
  }
}

function drawMenuScreen(ctx, W, H, game, title, time) {
  dim(ctx, W, H, 0.75);
  drawText(ctx, title, W / 2, game.menu.top - 44, { scale: 3, align: 'center', color: C.q, shadow: C.r });
  drawMenu(ctx, W, game, time);
  drawText(ctx, '↑ ↓ WÄHLEN  ·  LEERTASTE OK  ·  ESC ZURÜCK', W / 2, H - 16, { align: 'center', color: C.m });
}

function drawTitle(ctx, W, H, game, time) {
  ctx.fillStyle = C.k; ctx.globalAlpha = 0.45; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  // Logo mit leichtem Wippen
  const bob = R(Math.sin(time * 2) * 2);
  drawText(ctx, 'RUMP', W / 2 - 16, 36 + bob, { scale: 5, align: 'right', color: C.w, shadow: C.r });
  drawText(ctx, '&', W / 2, 44 + bob, { scale: 3, align: 'center', color: C.q, shadow: C.o });
  drawText(ctx, 'JUN', W / 2 + 16, 36 + bob, { scale: 5, color: C.w, shadow: C.r });
  drawText(ctx, 'DAS ENDLOSE PIXEL-ABENTEUER', W / 2, 88, { align: 'center', color: C.a });
  // kleiner Held, der vor dem Logo läuft
  drawSprite(ctx, 'player', 'run', time, W / 2 - 8, 110);
  drawText(ctx, 'REKORD ' + game.best + (game.tempo.points > 1 ? `  ·  TEMPO ${game.tempo.name} ×${game.tempo.points}` : ''),
    W / 2, 132, { align: 'center', color: C.y });

  drawMenu(ctx, W, game, time);
  drawText(ctx, '↑ ↓ WÄHLEN  ·  LEERTASTE / ANTIPPEN: OK', W / 2, H - 16, { align: 'center', color: C.s, shadow: C.k });
}

export function drawLeaderboard(ctx, W, entries, highlight, time, top) {
  const x0 = W / 2 - 130;
  drawText(ctx, '#', x0, top, { color: C.m });
  drawText(ctx, 'NAME', x0 + 24, top, { color: C.m });
  drawText(ctx, 'METER', x0 + 150, top, { color: C.m, align: 'right' });
  drawText(ctx, 'PUNKTE', x0 + 260, top, { color: C.m, align: 'right' });
  for (let i = 0; i < 10; i++) {
    const e = entries[i];
    const y = top + 14 + i * 16;
    const hl = i === highlight;
    if (hl) { ctx.fillStyle = C.r; ctx.globalAlpha = 0.5 + Math.sin(time * 6) * 0.2; ctx.fillRect(x0 - 6, y - 4, 272, 15); ctx.globalAlpha = 1; }
    const col = hl ? C.w : i === 0 ? C.q : C.s;
    drawText(ctx, String(i + 1), x0, y, { color: col });
    drawText(ctx, e ? e.name : '---', x0 + 24, y, { color: col, scale: 1 });
    // Markierung für Läufe mit höherem Tempo: > SCHNELL, >> TURBO
    const mark = e?.tempo === 'TURBO' ? '>>' : e?.tempo === 'SCHNELL' ? '>' : '';
    if (mark) drawText(ctx, mark, x0 + 48, y, { color: C.o });
    drawText(ctx, e ? String(e.meters) : '', x0 + 150, y, { color: col, align: 'right' });
    drawText(ctx, e ? String(e.score) : '', x0 + 260, y, { color: col, align: 'right' });
  }
}
