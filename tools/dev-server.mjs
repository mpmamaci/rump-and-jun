// ============================================================
//  DEV-SERVER – liefert das Spiel aus und lässt das Pixel-Studio speichern.
//  Ohne Abhängigkeiten, nur Node.js.
//
//  Die Standardgrafiken in assets/sprites/ sind geschützt: Das Studio speichert
//  ausschließlich in Skins unter assets/skins/<skin>/<sprite>.json.
//
//  Start:  npm run dev       – nur auf diesem Computer erreichbar
//          npm run dev:lan   – auch im Heimnetz (Handy, iPad) erreichbar
//  Spiel:        http://localhost:8765
//  Pixel-Studio: http://localhost:8765/tools/pixel-studio/
// ============================================================
import http from 'node:http';
import { readFile, writeFile, stat, mkdir, readdir, unlink, rmdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPRITES_DIR = path.join(ROOT, 'assets', 'sprites');
const SKINS_DIR = path.join(ROOT, 'assets', 'skins');
const PORT = Number(process.env.PORT) || 8765;
// --lan: auf allen Netzwerk-Schnittstellen lauschen, damit Geräte im WLAN zugreifen können
const LAN = process.argv.includes('--lan');
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.md': 'text/markdown; charset=utf-8', '.ico': 'image/x-icon',
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

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

// assets/skins/index.json neu aufbauen: { "skins": { "<skin>": ["player", ...] } }
async function rebuildSkinIndex() {
  await mkdir(SKINS_DIR, { recursive: true });
  const skins = {};
  for (const d of await readdir(SKINS_DIR, { withFileTypes: true })) {
    if (!d.isDirectory() || !NAME_RE.test(d.name)) continue;
    const files = (await readdir(path.join(SKINS_DIR, d.name))).filter(f => f.endsWith('.json'));
    if (files.length) skins[d.name] = files.map(f => f.slice(0, -5)).sort();
  }
  await writeFile(path.join(SKINS_DIR, 'index.json'), JSON.stringify({ skins }, null, 2) + '\n');
  return skins;
}

async function saveSkinSprite(skin, name, body) {
  const sprite = JSON.parse(body);
  const err = validateSprite(sprite, name);
  if (err) return { status: 400, data: { error: err } };

  // Ersetzt der Skin eine Standardgrafik, muss die Größe passen – sonst sitzt sie im Spiel falsch
  const def = await readJson(path.join(SPRITES_DIR, name + '.json')).catch(() => null);
  if (def && (def.width !== sprite.width || def.height !== sprite.height)) {
    return { status: 400, data: { error: `Größe muss wie beim Standard ${def.width}×${def.height} sein` } };
  }

  await mkdir(path.join(SKINS_DIR, skin), { recursive: true });
  await writeFile(path.join(SKINS_DIR, skin, name + '.json'), formatSprite(sprite));
  const skins = await rebuildSkinIndex();
  return { status: 200, data: { ok: true, skin, name, skins } };
}

// Skin-Version löschen → im Spiel gilt wieder die Standardgrafik
async function resetSkinSprite(skin, name) {
  await unlink(path.join(SKINS_DIR, skin, name + '.json')).catch(() => null);
  await rmdir(path.join(SKINS_DIR, skin)).catch(() => null);  // nur wenn leer
  const skins = await rebuildSkinIndex();
  return { status: 200, data: { ok: true, skins } };
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
    if (url.pathname === '/api/skins' && req.method === 'GET') return send(200, { skins: await rebuildSkinIndex() });

    const m = url.pathname.match(/^\/api\/skins\/([^/]+)\/sprites\/([^/]+)$/);
    if (m) {
      const skin = decodeURIComponent(m[1]), name = decodeURIComponent(m[2]);
      if (!NAME_RE.test(skin) || !NAME_RE.test(name)) return send(400, { error: 'Namen nur a–z, 0–9 und -' });
      if (req.method === 'POST') {
        const { status, data } = await saveSkinSprite(skin, name, await readBody(req));
        if (status === 200) console.log(`Skin „${skin}“: ${name} gespeichert`);
        return send(status, data);
      }
      if (req.method === 'DELETE') {
        console.log(`Skin „${skin}“: ${name} auf Standard zurückgesetzt`);
        const { status, data } = await resetSkinSprite(skin, name);
        return send(status, data);
      }
    }
    if (url.pathname.startsWith('/api/')) return send(404, { error: 'unbekannt' });
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

// IPv4-Adressen dieses Computers im lokalen Netz (z. B. 192.168.178.23)
function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat()
    .filter(i => i && i.family === 'IPv4' && !i.internal)
    .map(i => i.address);
}

server.listen(PORT, LAN ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`Spiel:        http://localhost:${PORT}`);
  console.log(`Pixel-Studio: http://localhost:${PORT}/tools/pixel-studio/`);
  if (!LAN) return;
  const ips = lanAddresses();
  if (!ips.length) return console.log('\nKein Netzwerk gefunden – ist der Computer im WLAN?');
  console.log('\nIm Heimnetz (Handy/iPad im selben WLAN):');
  for (const ip of ips) {
    console.log(`  Spiel:        http://${ip}:${PORT}`);
    console.log(`  Pixel-Studio: http://${ip}:${PORT}/tools/pixel-studio/`);
  }
  console.log('\nHinweis: Jeder im selben WLAN kann das Spiel öffnen und Skins speichern.');
  console.log('Nur im eigenen Heimnetz nutzen, nicht in öffentlichen WLANs.');
});
