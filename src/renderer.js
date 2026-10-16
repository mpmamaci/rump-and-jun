import { TILE } from './config.js';
import { PARTICLE_LIFE } from './particles.js';

// Zeichnet den aktuellen Spielzustand auf das Canvas
export function draw(ctx, game) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const { world, camX, time } = game;

  drawBackground(ctx, W, H, camX);

  ctx.save();
  ctx.translate(-Math.round(camX), 0);
  drawTiles(ctx, world, camX, W);
  drawFlag(ctx, world.flag, time);
  drawCoins(ctx, world.coins, time);
  drawEnemies(ctx, world.enemies, time);
  if (game.state !== 'over') drawPlayer(ctx, world.player, time);
  drawParticles(ctx, world.particles);
  ctx.restore();

  drawHud(ctx, game);
  if (game.state === 'win') overlay(ctx, W, H, 'Geschafft! 🎉', 'Punkte: ' + game.score + '  ·  R für Neustart');
  if (game.state === 'over') overlay(ctx, W, H, 'Game Over', 'Drücke R für einen neuen Versuch');
}

function drawBackground(ctx, W, H, camX) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#5ec8f2'); sky.addColorStop(1, '#c8f0ff');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // Parallax: Wolken und Hügel bewegen sich langsamer als die Kamera
  ctx.fillStyle = '#ffffffcc';
  for (let i = 0; i < 12; i++) {
    const x = ((i * 330 - camX * 0.2) % (W + 300) + W + 300) % (W + 300) - 150;
    cloud(ctx, x, 60 + (i * 53) % 120);
  }
  ctx.fillStyle = '#7ccf7a';
  for (let i = 0; i < 20; i++) {
    const x = i * 260 - camX * 0.4;
    ctx.beginPath(); ctx.arc(x, H - 60, 140 + (i % 3) * 40, Math.PI, 0); ctx.fill();
  }
}

function drawTiles(ctx, world, camX, W) {
  // nur die sichtbaren Spalten zeichnen
  const c0 = Math.floor(camX / TILE), c1 = Math.min(c0 + Math.ceil(W / TILE) + 1, world.cols - 1);
  for (let r = 0; r < world.rows; r++) for (let c = c0; c <= c1; c++) {
    const t = world.tileAt(c, r), x = c * TILE, y = r * TILE;
    if (t === '#') {
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#7a4d22'; ctx.fillRect(x + 6, y + 14, 8, 6); ctx.fillRect(x + 24, y + 26, 10, 6);
      if (world.tileAt(c, r - 1) !== '#') {
        ctx.fillStyle = '#4caf50'; ctx.fillRect(x, y, TILE, 10);
        ctx.fillStyle = '#66cc66'; ctx.fillRect(x, y, TILE, 4);
      }
    } else if (t === '=') {
      ctx.fillStyle = '#c0603a'; ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = '#8c3f22'; ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE / 2 - 1);
      ctx.strokeRect(x + 1, y + TILE / 2, TILE / 2 - 1, TILE / 2 - 1);
      ctx.strokeRect(x + TILE / 2, y + TILE / 2, TILE / 2 - 1, TILE / 2 - 1);
    } else if (t === '^') {
      ctx.fillStyle = '#9aa3ad';
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 20, y + TILE); ctx.lineTo(x + i * 20 + 10, y + TILE / 2); ctx.lineTo(x + i * 20 + 20, y + TILE);
        ctx.fill();
      }
    }
  }
}

function drawFlag(ctx, flag, time) {
  if (!flag) return;
  ctx.fillStyle = '#ddd'; ctx.fillRect(flag.x, flag.y, 6, flag.h);
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(flag.x + 3, flag.y, 7, 0, Math.PI * 2); ctx.fill();
  const wave = Math.sin(time * 6) * 5;
  ctx.fillStyle = '#2ecc71';
  ctx.beginPath(); ctx.moveTo(flag.x + 6, flag.y + 6); ctx.lineTo(flag.x + 56, flag.y + 22 + wave); ctx.lineTo(flag.x + 6, flag.y + 40); ctx.fill();
}

function drawCoins(ctx, coins, time) {
  for (const c of coins) {
    if (c.taken) continue;
    const spin = Math.abs(Math.cos(time * 4 + c.x * 0.05));
    const bob = Math.sin(time * 3 + c.x) * 3;
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2 + bob, Math.max(2, 10 * spin), 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff6'; ctx.fillRect(c.x + c.w / 2 - 2 * spin, c.y + 6 + bob, 3 * spin, 12);
  }
}

function drawEnemies(ctx, enemies, time) {
  for (const e of enemies) {
    if (!e.alive && e.squish <= 0) continue;
    ctx.fillStyle = '#8e44ad';
    if (!e.alive) { ctx.fillRect(e.x, e.y + e.h - 8, e.w, 8); continue; }
    const wob = Math.sin(time * 12 + e.x) * 2;
    ctx.beginPath(); ctx.roundRect(e.x, e.y + wob, e.w, e.h - wob, [14, 14, 4, 4]); ctx.fill();
    const look = Math.sign(e.vx) * 3;
    ctx.fillStyle = '#fff'; ctx.fillRect(e.x + 7 + look, e.y + 8, 7, 8); ctx.fillRect(e.x + 18 + look, e.y + 8, 7, 8);
    ctx.fillStyle = '#000'; ctx.fillRect(e.x + 9 + look * 1.5, e.y + 11, 3, 4); ctx.fillRect(e.x + 20 + look * 1.5, e.y + 11, 3, 4);
  }
}

function drawPlayer(ctx, p, time) {
  if (p.invul > 0 && Math.floor(time * 15) % 2) return;  // blinkt nach Treffer
  const w = p.w * p.scaleX, h = p.h * p.scaleY;
  const x = p.x + (p.w - w) / 2, y = p.y + p.h - h;
  ctx.fillStyle = '#e84a5f';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill();
  ctx.fillStyle = '#c0392b'; ctx.fillRect(x, y + h * 0.15, w, 5);  // Stirnband
  const ex = x + w / 2 + p.facing * 5;
  ctx.fillStyle = '#fff'; ctx.fillRect(ex - 7, y + h * 0.35, 6, 8); ctx.fillRect(ex + 2, y + h * 0.35, 6, 8);
  ctx.fillStyle = '#000'; ctx.fillRect(ex - 5 + p.facing * 1.5, y + h * 0.35 + 2, 3, 5); ctx.fillRect(ex + 4 + p.facing * 1.5, y + h * 0.35 + 2, 3, 5);
}

function drawParticles(ctx, particles) {
  for (const pt of particles) {
    ctx.globalAlpha = pt.life / PARTICLE_LIFE;
    ctx.fillStyle = pt.color; ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
  }
  ctx.globalAlpha = 1;
}

function drawHud(ctx, game) {
  ctx.fillStyle = '#0006'; ctx.beginPath(); ctx.roundRect(12, 12, 260, 40, 10); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px system-ui, sans-serif'; ctx.textBaseline = 'middle';
  ctx.fillText('Punkte: ' + game.score, 26, 33);
  ctx.fillStyle = '#e84a5f';
  for (let i = 0; i < game.lives; i++) heart(ctx, 190 + i * 26, 33);
}

function cloud(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.arc(x + 26, y - 10, 28, 0, Math.PI * 2); ctx.arc(x + 54, y, 22, 0, Math.PI * 2);
  ctx.fill();
}

function heart(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y + 8); ctx.bezierCurveTo(x - 14, y - 2, x - 6, y - 12, x, y - 4);
  ctx.bezierCurveTo(x + 6, y - 12, x + 14, y - 2, x, y + 8); ctx.fill();
}

function overlay(ctx, W, H, title, sub) {
  ctx.fillStyle = '#000a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.font = 'bold 56px system-ui, sans-serif'; ctx.fillText(title, W / 2, H / 2 - 20);
  ctx.font = '22px system-ui, sans-serif'; ctx.fillText(sub, W / 2, H / 2 + 30);
  ctx.textAlign = 'left';
}
