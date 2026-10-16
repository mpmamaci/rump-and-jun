import { PALETTE } from '../data/palette.js';

// ============================================================
//  ASSETS – lädt unsere Sprites (assets/sprites/*.json) und baut daraus Canvas-Bilder.
//  Ein Sprite besteht aus Animationen, jede Animation aus Frames,
//  jeder Frame aus Textzeilen mit einem Paletten-Zeichen pro Pixel.
// ============================================================
const raw = {};          // Standard-JSON je Sprite (assets/sprites/)
let skinRaw = {};        // Sprites des aktiven Skins – ersetzen die Standardgrafik
let activeSkin = '';     // '' = Standard
let skinList = {};       // { skinName: [spriteNamen] } aus assets/skins/index.json
const cache = new Map(); // "name|remapKey" → fertiges Sprite

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

export async function loadSprites() {
  const { sprites } = await fetchJson('assets/sprites/index.json');
  await Promise.all(sprites.map(async name => { raw[name] = await fetchJson(`assets/sprites/${name}.json`); }));
}

// Welche Skins gibt es? (Datei pflegt der Dev-Server; fehlt sie, gibt es nur Standard)
export async function loadSkinList() {
  try { skinList = (await fetchJson('assets/skins/index.json')).skins || {}; } catch { skinList = {}; }
  return Object.keys(skinList).sort();
}

// Skin aktivieren – '' schaltet zurück auf die Standardgrafiken
export async function setSkin(name) {
  const next = {};
  if (name && skinList[name]) {
    await Promise.all(skinList[name].map(async s => { next[s] = await fetchJson(`assets/skins/${name}/${s}.json`); }));
  } else name = '';
  skinRaw = next;
  activeSkin = name;
  cache.clear();
  return name;
}

export const getActiveSkin = () => activeSkin;

function frameToCanvas(rows, w, h, remap, flip) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      let key = row[x];
      if (key === '.') continue;
      if (remap && remap[key]) key = remap[key];
      ctx.fillStyle = PALETTE[key] || '#ff00ff';
      ctx.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }
  });
  return c;
}

// remap: { altesZeichen: neuesZeichen } – damit färben wir Blöcke je Biom um
export function getSprite(name, remap = null, remapKey = '') {
  const id = name + '|' + remapKey;
  let s = cache.get(id);
  if (s) return s;
  const src = skinRaw[name] || raw[name];
  if (!src) return null;
  s = { w: src.width, h: src.height, fps: src.fps || {}, anims: {} };
  for (const [anim, frames] of Object.entries(src.animations)) {
    s.anims[anim] = {
      frames: frames.map(f => frameToCanvas(f, src.width, src.height, remap, false)),
      flipped: frames.map(f => frameToCanvas(f, src.width, src.height, remap, true)),
    };
  }
  cache.set(id, s);
  return s;
}

// Zeichnet einen Sprite-Frame. t = Zeit in Sekunden (für Animationen)
export function drawSprite(ctx, name, anim, t, x, y, opts = {}) {
  const s = opts.sprite || getSprite(name, opts.remap, opts.remapKey);
  if (!s) return;
  const a = s.anims[anim] || Object.values(s.anims)[0];
  const fps = s.fps[anim] || 8;
  const i = opts.frame ?? Math.floor(t * fps) % a.frames.length;
  const img = (opts.flip ? a.flipped : a.frames)[i];
  if (opts.w || opts.h) ctx.drawImage(img, Math.round(x), Math.round(y), opts.w ?? s.w, opts.h ?? s.h);
  else ctx.drawImage(img, Math.round(x), Math.round(y));
}

export const hasSprite = name => !!(skinRaw[name] || raw[name]);
