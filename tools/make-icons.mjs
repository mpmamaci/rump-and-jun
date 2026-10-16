// ============================================================
//  APP-SYMBOLE – erzeugt assets/icons/*.png aus unserem Spieler-Sprite.
//  Aufruf:  npm run icons
//  Eigener kleiner PNG-Encoder (nur Node.js, keine Zusatzpakete).
// ============================================================
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE, hexToRgb } from '../src/data/palette.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'icons');
const SIZES = [180, 192, 512];

// ---------------- PNG schreiben ----------------
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);  // Filter 0 je Zeile
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;  // 8 Bit, RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------- Symbol malen ----------------
// Himmel, Gras-Boden und der Held in der Mitte – alles aus unserer Palette
function drawIcon(size, frame) {
  const rgba = Buffer.alloc(size * size * 4);
  const set = (x, y, hex) => {
    const [r, g, b] = hexToRgb(hex);
    const i = (y * size + x) * 4;
    rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = 255;
  };
  const px = Math.floor(size * 0.62 / 16);         // Größe eines Sprite-Pixels
  const groundY = Math.round(size * 0.78);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let c = y < size * 0.5 ? PALETTE.c : PALETTE.a;  // Himmel in zwei Streifen
    if (y >= groundY) c = y < groundY + px ? PALETTE.l : y < groundY + px * 2 ? PALETTE.g : PALETTE.u;
    set(x, y, c);
  }
  const ox = Math.floor((size - 16 * px) / 2), oy = groundY - 16 * px;
  frame.forEach((row, sy) => [...row].forEach((key, sx) => {
    if (key === '.') return;
    for (let dy = 0; dy < px; dy++) for (let dx = 0; dx < px; dx++) set(ox + sx * px + dx, oy + sy * px + dy, PALETTE[key]);
  }));
  return rgba;
}

const player = JSON.parse(await readFile(path.join(ROOT, 'assets/sprites/player.json'), 'utf8'));
const frame = player.animations.idle[0];
await mkdir(OUT, { recursive: true });
for (const size of SIZES) {
  const file = path.join(OUT, `icon-${size}.png`);
  await writeFile(file, encodePng(size, size, drawIcon(size, frame)));
  console.log(`✓ ${path.relative(ROOT, file)}`);
}
