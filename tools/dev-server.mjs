// ============================================================
//  DEV-SERVER – liefert das Spiel aus und lässt das Pixel-Studio speichern.
//  Ohne Abhängigkeiten, nur Node.js.
//
//  Start:  npm run dev   (oder: node tools/dev-server.mjs)
//  Spiel:        http://localhost:8765
//  Pixel-Studio: http://localhost:8765/tools/pixel-studio/
// ============================================================
import http from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPRITES_DIR = path.join(ROOT, 'assets', 'sprites');
const PORT = Number(process.env.PORT) || 8765;
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8', '.ico': 'image/x-icon',
};

async function readBody(req, limit = 2_000_000) {
  let size = 0; const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw new Error('zu groß');
    chunks.push(c);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// Sprite prüfen, damit nur saubere Daten ins Projekt geschrieben werden
function validateSprite(s, name) {
  if (!s || typeof s !== 'object') return 'kein Objekt';
  if (s.name !== name) return 'Name passt nicht';
  if (!Number.isInteger(s.width) || !Number.isInteger(s.height) || s.width < 1 || s.height < 1 || s.width > 64 || s.height > 64) return 'Größe ungültig (1–64)';
  if (!s.animations || typeof s.animations !== 'object' || !Object.keys(s.animations).length) return 'keine Animationen';
  for (const [anim, frames] of Object.entries(s.animations)) {
    if (!/^[a-z0-9-]{1,30}$/.test(anim)) return `Animationsname "${anim}" ungültig`;
    if (!Array.isArray(frames) || !frames.length) return `Animation ${anim} ist leer`;
    for (const f of frames) {
      if (!Array.isArray(f) || f.length !== s.height) return `Frame in ${anim} hat falsche Höhe`;
      for (const row of f) if (typeof row !== 'string' || row.length !== s.width || !/^[.a-z]+$/.test(row)) return `Zeile in ${anim} ungültig`;
    }
  }
  return null;
}

async function saveSprite(name, body) {
  const sprite = JSON.parse(body);
  const err = validateSprite(sprite, name);
  if (err) return { status: 400, data: { error: err } };

  await writeFile(path.join(SPRITES_DIR, name + '.json'), formatSprite(sprite));
  const manifestPath = path.join(SPRITES_DIR, 'index.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!manifest.sprites.includes(name)) {
    manifest.sprites.push(name);
    manifest.sprites.sort();
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  }
  return { status: 200, data: { ok: true, name } };
}

// Lesbares JSON: jede Pixelzeile in einer eigenen Zeile (gut für git diff)
export function formatSprite(s) {
  const anims = Object.entries(s.animations).map(([anim, frames]) =>
    `    "${anim}": [\n` + frames.map(f => '      [\n' + f.map(r => `        "${r}"`).join(',\n') + '\n      ]').join(',\n') + '\n    ]'
  ).join(',\n');
  return `{\n  "name": "${s.name}",\n  "width": ${s.width},\n  "height": ${s.height},\n  "fps": ${JSON.stringify(s.fps || {})},\n  "animations": {\n${anims}\n  }\n}\n`;
}

const server = http.createServer(async (req, res) => {
  const send = (status, data, type = 'application/json; charset=utf-8') => {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data));
  };
  try {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/ping') return send(200, { ok: true });
    const m = url.pathname.match(/^\/api\/sprites\/([^/]+)$/);
    if (m && req.method === 'POST') {
      const name = decodeURIComponent(m[1]);
      if (!NAME_RE.test(name)) return send(400, { error: 'Name nur a–z, 0–9 und -' });
      const { status, data } = await saveSprite(name, await readBody(req));
      console.log(`Sprite gespeichert: ${name}`);
      return send(status, data);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, { error: 'nicht erlaubt' });

    // Statische Dateien – nur innerhalb des Projekts
    let filePath = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) return send(403, 'verboten', 'text/plain');
    if (filePath.includes(`${path.sep}.git`)) return send(403, 'verboten', 'text/plain');
    const st = await stat(filePath).catch(() => null);
    if (st?.isDirectory()) filePath = path.join(filePath, 'index.html');
    const data = await readFile(filePath).catch(() => null);
    if (!data) return send(404, 'nicht gefunden', 'text/plain');
    send(200, data, MIME[path.extname(filePath)] || 'application/octet-stream');
  } catch (e) {
    send(500, { error: String(e.message || e) });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Spiel:        http://localhost:${PORT}`);
  console.log(`Pixel-Studio: http://localhost:${PORT}/tools/pixel-studio/`);
});
