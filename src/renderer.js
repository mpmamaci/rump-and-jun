import { TILE } from './config.js';
import { PARTICLE_LIFE } from './particles.js';
import { ENEMY_COLORS } from './entities/enemy.js';

// Platzhalter-Grafik in 16px-Pixeln – wird in M3 durch unsere eigenen Sprites ersetzt.
// Alle Positionen werden gerundet, damit nichts zwischen zwei Pixeln landet.
const R = Math.round;

export function draw(ctx, game) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const { world, camX, camY, time } = game;

  drawBackground(ctx, W, H, camX);

  ctx.save();
  ctx.translate(-R(camX), -R(camY));
  drawTiles(ctx, world, camX, W, time);
  drawPlatforms(ctx, world.platforms);
  drawCoins(ctx, world.coins, time);
  drawEnemies(ctx, world.enemies, time);
  if (game.state !== 'dead') drawPlayer(ctx, world.player);
  drawParticles(ctx, world.particles);
  ctx.restore();

  drawDeathWall(ctx, H, time);
  drawHud(ctx, game);
  if (game.state === 'ready') drawReady(ctx, W, H, time);
  if (game.state === 'dead') drawDead(ctx, W, H, game);
}

function drawBackground(ctx, W, H, camX) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#5ec8f2'); sky.addColorStop(1, '#c8f0ff');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // Parallax: Wolken und Hügel bewegen sich langsamer als die Kamera
  ctx.fillStyle = '#ffffffcc';
  for (let i = 0; i < 12; i++) {
    const x = ((i * 132 - camX * 0.2) % (W + 120) + W + 120) % (W + 120) - 60;
    cloud(ctx, R(x), 24 + (i * 21) % 50);
  }
  ctx.fillStyle = '#7ccf7a';
  const first = Math.floor(camX * 0.4 / 104) - 1;
  for (let i = first; i < first + Math.ceil(W / 104) + 3; i++) {
    const x = R(i * 104 - camX * 0.4);
    ctx.beginPath(); ctx.arc(x, H - 24, 56 + (((i % 3) + 3) % 3) * 16, Math.PI, 0); ctx.fill();
  }
}

function drawTiles(ctx, world, camX, W, time) {
  // nur die sichtbaren Spalten zeichnen
  const c0 = Math.floor(camX / TILE), c1 = c0 + Math.ceil(W / TILE) + 1;
  for (let r = 0; r < world.rows; r++) for (let c = c0; c <= c1; c++) {
    const t = world.tileAt(c, r), x = c * TILE, y = r * TILE;
    if (t === '#') {
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#7a4d22'; ctx.fillRect(x + 2, y + 6, 3, 2); ctx.fillRect(x + 10, y + 11, 4, 2);
      if (world.tileAt(c, r - 1) !== '#') {
        ctx.fillStyle = '#4caf50'; ctx.fillRect(x, y, TILE, 4);
        ctx.fillStyle = '#66cc66'; ctx.fillRect(x, y, TILE, 2);
      }
    } else if (t === '=') {
      ctx.fillStyle = '#8c3f22'; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#c0603a';
      ctx.fillRect(x + 1, y + 1, TILE - 2, 6);
      ctx.fillRect(x + 1, y + 8, 6, 7);
      ctx.fillRect(x + 8, y + 8, 7, 7);
    } else if (t === '~') {
      // Bröckel-Plattform: wackelt, sobald jemand drauf steht
      const shaking = world.crumbling.has(c + ',' + r);
      const sx = shaking ? R(Math.sin(time * 60) * 1) : 0;
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x + sx, y, TILE, 8);
      ctx.fillStyle = '#a0703a'; ctx.fillRect(x + sx + 1, y + 1, TILE - 2, 5);
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x + sx + 5, y + 1, 1, 3); ctx.fillRect(x + sx + 11, y + 3, 1, 3);
    } else if (t === '^') {
      ctx.fillStyle = '#9aa3ad';
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 8, y + TILE); ctx.lineTo(x + i * 8 + 4, y + TILE / 2); ctx.lineTo(x + i * 8 + 8, y + TILE);
        ctx.fill();
      }
    }
  }
}

function drawPlatforms(ctx, platforms) {
  for (const pl of platforms) {
    const x = R(pl.x), y = R(pl.y);
    ctx.fillStyle = '#3d6e8c'; ctx.fillRect(x, y, pl.w, pl.h);
    ctx.fillStyle = '#6fb3d9'; ctx.fillRect(x + 1, y + 1, pl.w - 2, 2);
    ctx.fillStyle = '#2a4d63';
    for (let i = 6; i < pl.w; i += 12) ctx.fillRect(x + i, y + 3, 2, 2);
  }
}

function drawCoins(ctx, coins, time) {
  for (const c of coins) {
    if (c.taken) continue;
    const spin = Math.abs(Math.cos(time * 4 + c.x * 0.1));
    const w = Math.max(2, R(c.w * spin));
    const bob = R(Math.sin(time * 3 + c.x) * 1.5);
    const x = R(c.x + (c.w - w) / 2), y = c.y + bob;
    ctx.fillStyle = '#c99a1a'; ctx.fillRect(x, y, w, c.h);
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + (w > 3 ? 1 : 0), y + 1, Math.max(1, w - 2), c.h - 2);
  }
}

function drawEnemies(ctx, enemies, time) {
  for (const e of enemies) {
    if (!e.alive && e.squish <= 0) continue;
    const x = R(e.x), y = R(e.y);
    ctx.fillStyle = ENEMY_COLORS[e.type];
    if (!e.alive) { ctx.fillRect(x, y + e.h - 3, e.w, 3); continue; }
    const wob = Math.sin(time * 12 + e.x) > 0 ? 1 : 0;
    ctx.fillRect(x + 2, y + wob, e.w - 4, 2);
    ctx.fillRect(x, y + 2 + wob, e.w, e.h - 2 - wob);
    if (e.type === 'flyer') {  // Flügel
      const up = Math.sin(time * 18) > 0;
      ctx.fillRect(x - 3, y + (up ? 0 : 4), 3, 2); ctx.fillRect(x + e.w, y + (up ? 0 : 4), 3, 2);
    }
    const look = e.type === 'jumper' ? -1 : Math.sign(e.vx);
    ctx.fillStyle = '#fff'; ctx.fillRect(x + 3 + look, y + 3, 3, 3); ctx.fillRect(x + 7 + look, y + 3, 3, 3);
    ctx.fillStyle = '#000'; ctx.fillRect(x + 4 + look, y + 4, 1, 2); ctx.fillRect(x + 8 + look, y + 4, 1, 2);
  }
}

function drawPlayer(ctx, p) {
  const w = R(p.w * p.scaleX), h = R(p.h * p.scaleY);
  const x = R(p.x + (p.w - w) / 2), y = R(p.y + p.h - h);
  ctx.fillStyle = '#e84a5f'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#c0392b'; ctx.fillRect(x, y + 2, w, 2);  // Stirnband
  const ex = x + R(w / 2) + p.facing * 2;
  ctx.fillStyle = '#fff'; ctx.fillRect(ex - 3, y + 5, 2, 3); ctx.fillRect(ex + 1, y + 5, 2, 3);
  ctx.fillStyle = '#000'; ctx.fillRect(ex - 3 + (p.facing > 0 ? 1 : 0), y + 6, 1, 2); ctx.fillRect(ex + 1 + (p.facing > 0 ? 1 : 0), y + 6, 1, 2);
}

function drawParticles(ctx, particles) {
  for (const pt of particles) {
    ctx.globalAlpha = pt.life / PARTICLE_LIFE;
    ctx.fillStyle = pt.color; ctx.fillRect(R(pt.x) - 1, R(pt.y) - 1, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawHud(ctx, game) {
  // Text ist ein Platzhalter bis zur eigenen Pixel-Schrift
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0008'; ctx.fillRect(6, 6, 96, 30);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace';
  ctx.fillText(game.meters + ' m', 11, 15);
  ctx.font = '9px monospace'; ctx.fillStyle = '#ffd23f';
  ctx.fillText('PUNKTE ' + game.score, 11, 29);

  const W = ctx.canvas.width;
  const best = 'REKORD ' + game.best;
  ctx.font = '9px monospace';
  const bw = Math.ceil(ctx.measureText(best).width) + 10;
  ctx.fillStyle = '#0008'; ctx.fillRect(W - 6 - bw, 6, bw, 14);
  ctx.fillStyle = '#fff'; ctx.fillText(best, W - 1 - bw, 13);
}

// Linker Bildrand: pulsierende Stachelwand – wer hier hängen bleibt, stirbt
function drawDeathWall(ctx, H, time) {
  const pulse = 0.55 + Math.sin(time * 8) * 0.25;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#e84a5f'; ctx.fillRect(0, 0, 3, H);
  ctx.fillStyle = '#ff8a9a';
  for (let y = 0; y < H; y += 8) {
    ctx.fillRect(3, y + 2, 2, 4);
    ctx.fillRect(5, y + 3, 1, 2);
  }
  ctx.globalAlpha = 1;
}

function drawReady(ctx, W, H, time) {
  if (Math.floor(time * 2) % 2) return;  // blinkender Hinweis
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0008'; ctx.fillRect(W / 2 - 110, H / 2 - 40, 220, 22);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
  ctx.fillText('→ ODER LEERTASTE ZUM STARTEN', W / 2, H / 2 - 29);
  ctx.textAlign = 'left';
}

function drawDead(ctx, W, H, game) {
  ctx.fillStyle = '#000a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 28px monospace'; ctx.fillText(game.meters + ' m', W / 2, H / 2 - 22);
  ctx.font = 'bold 12px monospace'; ctx.fillStyle = '#ffd23f';
  ctx.fillText('PUNKTE ' + game.score, W / 2, H / 2 + 4);
  ctx.font = '10px monospace'; ctx.fillStyle = game.newRecord ? '#7CFC7C' : '#fff';
  ctx.fillText(game.newRecord ? 'NEUER REKORD!' : 'REKORD ' + game.best, W / 2, H / 2 + 22);
  ctx.textAlign = 'left';
}

function cloud(ctx, x, y) {
  ctx.fillRect(x + 4, y, 16, 4);
  ctx.fillRect(x, y + 4, 28, 6);
  ctx.fillRect(x + 8, y - 3, 8, 3);
}
