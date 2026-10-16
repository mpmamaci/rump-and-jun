// ============================================================
//  PIXEL-STUDIO
//  1. Skizze frei zeichnen  →  2. in Pixel-Art umwandeln + nachbessern  →  3. speichern
//  Sprites werden als Text mit Paletten-Zeichen gespeichert (siehe src/data/palette.js).
// ============================================================
import { PALETTE, PALETTE_KEYS, TRANSPARENT, hexToRgb, nearestKey } from '../../src/data/palette.js';

const $ = sel => document.querySelector(sel);
const SKETCH_MAX = 384;   // maximale Kantenlänge der Skizzenfläche in Bildschirmpixeln
const PIXEL_MAX = 384;    // maximale Kantenlänge des Pixel-Editors

// ---------------- Zustand ----------------
let sprite = blankSprite('neues-sprite', 16, 16);
let anim = 'default';
let frameIndex = 0;
let color = 'k';
let tool = 'pen';
let sketchTool = 'brush';
let pixelUndo = [];
let sketchUndo = [];

function blankFrame(w, h) { return Array.from({ length: h }, () => TRANSPARENT.repeat(w)); }
function blankSprite(name, w, h) {
  return { name, width: w, height: h, fps: { default: 8 }, animations: { default: [blankFrame(w, h)] } };
}
const frames = () => sprite.animations[anim];
const frame = () => frames()[frameIndex];

// ---------------- Status ----------------
function status(msg, kind = '') {
  const el = $('#status');
  el.textContent = msg;
  el.className = 'status ' + kind;
}

// ---------------- Palette ----------------
function buildPalette() {
  const bar = $('#palette');
  const keys = [TRANSPARENT, ...PALETTE_KEYS];
  for (const key of keys) {
    const b = document.createElement('button');
    b.className = 'swatch' + (key === TRANSPARENT ? ' transparent' : '');
    if (key !== TRANSPARENT) b.style.background = PALETTE[key];
    b.title = key === TRANSPARENT ? 'durchsichtig' : `${key}  ${PALETTE[key]}`;
    b.innerHTML = `<span>${key}</span>`;
    b.dataset.key = key;
    b.addEventListener('click', () => setColor(key));
    bar.appendChild(b);
  }
  setColor('k');
}
function setColor(key) {
  color = key;
  document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s.dataset.key === key));
}

// ============================================================
//  1 · SKIZZE
// ============================================================
const sketch = $('#sketch');
const sctx = sketch.getContext('2d', { willReadFrequently: true });

function sketchCell() { return Math.max(1, Math.floor(SKETCH_MAX / Math.max(sprite.width, sprite.height))); }

function resizeSketch() {
  const k = sketchCell();
  const old = document.createElement('canvas');
  old.width = sketch.width; old.height = sketch.height;
  if (sketch.width) old.getContext('2d').drawImage(sketch, 0, 0);
  sketch.width = sprite.width * k;
  sketch.height = sprite.height * k;
  if (old.width) sctx.drawImage(old, 0, 0, sketch.width, sketch.height);
}

function pushSketchUndo() {
  sketchUndo.push(sctx.getImageData(0, 0, sketch.width, sketch.height));
  if (sketchUndo.length > 30) sketchUndo.shift();
}

function sketchPos(e) {
  const r = sketch.getBoundingClientRect();
  return [(e.clientX - r.left) * sketch.width / r.width, (e.clientY - r.top) * sketch.height / r.height];
}

let drawing = false, last = null;
sketch.addEventListener('pointerdown', e => {
  drawing = true; pushSketchUndo();
  sketch.setPointerCapture(e.pointerId);
  last = sketchPos(e);
  stroke(last, last);
});
sketch.addEventListener('pointermove', e => {
  if (!drawing) return;
  const p = sketchPos(e);
  stroke(last, p);
  last = p;
});
addEventListener('pointerup', () => { drawing = false; });

function stroke([x0, y0], [x1, y1]) {
  sctx.save();
  sctx.globalCompositeOperation = sketchTool === 'erase' || color === TRANSPARENT ? 'destination-out' : 'source-over';
  sctx.strokeStyle = sctx.fillStyle = color === TRANSPARENT ? '#000' : PALETTE[color];
  sctx.lineWidth = Number($('#brush-size').value) * sketch.width / SKETCH_MAX;
  sctx.lineCap = sctx.lineJoin = 'round';
  sctx.beginPath(); sctx.moveTo(x0, y0); sctx.lineTo(x1 + 0.01, y1); sctx.stroke();
  sctx.restore();
}

document.querySelectorAll('[data-sketch-tool]').forEach(b => b.addEventListener('click', () => {
  sketchTool = b.dataset.sketchTool;
  document.querySelectorAll('[data-sketch-tool]').forEach(x => x.classList.toggle('active', x === b));
}));
$('#sketch-undo').addEventListener('click', () => { const d = sketchUndo.pop(); if (d) sctx.putImageData(d, 0, 0); });
$('#sketch-clear').addEventListener('click', () => { pushSketchUndo(); sctx.clearRect(0, 0, sketch.width, sketch.height); });

// Bild (z. B. Foto einer Papierzeichnung) in die Skizze laden
$('#sketch-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = await createImageBitmap(file);
  pushSketchUndo();
  sctx.clearRect(0, 0, sketch.width, sketch.height);
  const s = Math.min(sketch.width / img.width, sketch.height / img.height);
  const w = img.width * s, h = img.height * s;
  sctx.drawImage(img, (sketch.width - w) / 2, (sketch.height - h) / 2, w, h);
  removeLightBackground();
  e.target.value = '';
  status('Bild geladen – jetzt umwandeln');
});

// Fast weißes Papier wird durchsichtig, damit nur die Zeichnung übrig bleibt
function removeLightBackground() {
  const img = sctx.getImageData(0, 0, sketch.width, sketch.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 225 && d[i + 1] > 225 && d[i + 2] > 225) d[i + 3] = 0;
  }
  sctx.putImageData(img, 0, 0);
}

$('#threshold').addEventListener('input', e => { $('#threshold-out').textContent = e.target.value + ' %'; });

// ---------------- Umwandeln: Skizze → Pixel ----------------
$('#btn-convert').addEventListener('click', () => {
  pushPixelUndo();
  frames()[frameIndex] = convertSketch(Number($('#threshold').value) / 100, $('#outline').checked);
  render();
  status('Umgewandelt – jetzt nachbessern');
});

function convertSketch(threshold, outline) {
  const k = sketchCell();
  const { width: W, height: H } = sprite;
  const data = sctx.getImageData(0, 0, sketch.width, sketch.height).data;
  const nearestCache = new Map();
  const rows = [];
  for (let cy = 0; cy < H; cy++) {
    let row = '';
    for (let cx = 0; cx < W; cx++) {
      // Pro Zelle: wie viel ist bemalt, und welche Palettenfarbe kommt am häufigsten vor?
      const votes = new Map();
      let opaque = 0;
      for (let y = cy * k; y < (cy + 1) * k; y++) {
        for (let x = cx * k; x < (cx + 1) * k; x++) {
          const i = (y * sketch.width + x) * 4;
          if (data[i + 3] < 128) continue;
          opaque++;
          const rgb = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
          let key = nearestCache.get(rgb);
          if (!key) { key = nearestKey(data[i], data[i + 1], data[i + 2]); nearestCache.set(rgb, key); }
          votes.set(key, (votes.get(key) || 0) + 1);
        }
      }
      if (opaque / (k * k) < threshold) { row += TRANSPARENT; continue; }
      let best = TRANSPARENT, bestN = 0;
      for (const [key, n] of votes) if (n > bestN) { best = key; bestN = n; }
      row += best;
    }
    rows.push(row);
  }
  return outline ? addOutline(rows) : rows;
}

// Dunkle Kontur um alle bemalten Flächen
function addOutline(rows) {
  const H = rows.length, W = rows[0].length;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? TRANSPARENT : rows[y][x];
  return rows.map((row, y) => [...row].map((ch, x) => {
    if (ch !== TRANSPARENT) return ch;
    const n = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
    return n.some(c => c !== TRANSPARENT && c !== 'k') ? 'k' : ch;
  }).join(''));
}

// ============================================================
//  2 · PIXEL-EDITOR
// ============================================================
const pixels = $('#pixels');
const pctx = pixels.getContext('2d');
const zoom = () => Math.max(4, Math.floor(PIXEL_MAX / Math.max(sprite.width, sprite.height)));

function pushPixelUndo() {
  pixelUndo.push(JSON.stringify({ sprite, anim, frameIndex }));
  if (pixelUndo.length > 80) pixelUndo.shift();
}
function undoPixel() {
  const s = pixelUndo.pop();
  if (!s) return;
  ({ sprite, anim, frameIndex } = JSON.parse(s));
  syncInputs(); render();
}

function setPixel(x, y, key) {
  const f = frame();
  if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height || f[y][x] === key) return false;
  f[y] = f[y].slice(0, x) + key + f[y].slice(x + 1);
  return true;
}

function floodFill(x, y, key) {
  const f = frame();
  const target = f[y][x];
  if (target === key) return;
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= sprite.width || cy >= sprite.height || f[cy][cx] !== target) continue;
    setPixel(cx, cy, key);
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
}

function cellAt(e) {
  const r = pixels.getBoundingClientRect();
  return [Math.floor((e.clientX - r.left) / r.width * sprite.width), Math.floor((e.clientY - r.top) / r.height * sprite.height)];
}

let painting = false, paintKey = 'k';
pixels.addEventListener('contextmenu', e => e.preventDefault());
pixels.addEventListener('pointerdown', e => {
  const [x, y] = cellAt(e);
  const erase = e.button === 2 || tool === 'erase';
  if (tool === 'pick') { setColor(frame()[y]?.[x] ?? TRANSPARENT); return; }
  pushPixelUndo();
  if (tool === 'fill') { floodFill(x, y, erase ? TRANSPARENT : color); render(); return; }
  painting = true; paintKey = erase ? TRANSPARENT : color;
  pixels.setPointerCapture(e.pointerId);
  if (setPixel(x, y, paintKey)) render();
});
pixels.addEventListener('pointermove', e => {
  if (!painting) return;
  const [x, y] = cellAt(e);
  if (setPixel(x, y, paintKey)) render();
});
addEventListener('pointerup', () => { painting = false; });

function setTool(t) {
  tool = t;
  document.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === t));
}
document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
$('#pixel-undo').addEventListener('click', undoPixel);
$('#pixel-clear').addEventListener('click', () => { pushPixelUndo(); frames()[frameIndex] = blankFrame(sprite.width, sprite.height); render(); });
$('#onion').addEventListener('change', render);

function drawFrame(ctx, rows, scale, alpha = 1, flip = false) {
  ctx.globalAlpha = alpha;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const key = row[x];
      if (key === TRANSPARENT) continue;
      ctx.fillStyle = PALETTE[key] || '#f0f';
      ctx.fillRect((flip ? row.length - 1 - x : x) * scale, y * scale, scale, scale);
    }
  });
  ctx.globalAlpha = 1;
}

function renderPixels() {
  const z = zoom();
  pixels.width = sprite.width * z;
  pixels.height = sprite.height * z;
  pctx.clearRect(0, 0, pixels.width, pixels.height);
  const prev = frames()[frameIndex - 1];
  if ($('#onion').checked && prev) drawFrame(pctx, prev, z, 0.25);
  drawFrame(pctx, frame(), z);
  // Raster
  pctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let x = 1; x < sprite.width; x++) pctx.fillRect(x * z, 0, 1, pixels.height);
  for (let y = 1; y < sprite.height; y++) pctx.fillRect(0, y * z, pixels.width, 1);
  // Achtel-Linien helfen beim Ausrichten
  pctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let x = 8; x < sprite.width; x += 8) pctx.fillRect(x * z, 0, 1, pixels.height);
  for (let y = 8; y < sprite.height; y += 8) pctx.fillRect(0, y * z, pixels.width, 1);
}

// ---------------- Animationen & Frames ----------------
function renderAnimSelect() {
  const sel = $('#anim-select');
  sel.innerHTML = '';
  for (const name of Object.keys(sprite.animations)) {
    const o = document.createElement('option');
    o.value = o.textContent = name;
    sel.appendChild(o);
  }
  sel.value = anim;
  $('#anim-fps').value = sprite.fps[anim] || 8;
}

function renderFrames() {
  const box = $('#frames');
  box.innerHTML = '';
  frames().forEach((f, i) => {
    const c = document.createElement('canvas');
    const s = Math.max(1, Math.floor(48 / Math.max(sprite.width, sprite.height)));
    c.width = sprite.width * s; c.height = sprite.height * s;
    drawFrame(c.getContext('2d'), f, s);
    c.className = i === frameIndex ? 'active' : '';
    c.title = `Frame ${i + 1}`;
    c.addEventListener('click', () => { frameIndex = i; render(); });
    box.appendChild(c);
  });
}

$('#anim-select').addEventListener('change', e => { anim = e.target.value; frameIndex = 0; render(); });
$('#anim-fps').addEventListener('change', e => { sprite.fps[anim] = Math.max(1, Math.min(30, Number(e.target.value) || 8)); });
$('#anim-add').addEventListener('click', () => {
  const name = $('#anim-new-name').value.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,30}$/.test(name)) return status('Animationsname: nur a–z, 0–9, -', 'err');
  if (sprite.animations[name]) return status('Animation gibt es schon', 'err');
  pushPixelUndo();
  sprite.animations[name] = [blankFrame(sprite.width, sprite.height)];
  sprite.fps[name] = 8;
  anim = name; frameIndex = 0;
  $('#anim-new-name').value = '';
  render();
});
$('#anim-delete').addEventListener('click', () => {
  if (Object.keys(sprite.animations).length < 2) return status('Mindestens eine Animation muss bleiben', 'err');
  pushPixelUndo();
  delete sprite.animations[anim]; delete sprite.fps[anim];
  anim = Object.keys(sprite.animations)[0]; frameIndex = 0;
  render();
});
$('#frame-add').addEventListener('click', () => { pushPixelUndo(); frames().splice(frameIndex + 1, 0, blankFrame(sprite.width, sprite.height)); frameIndex++; render(); });
$('#frame-dup').addEventListener('click', () => { pushPixelUndo(); frames().splice(frameIndex + 1, 0, [...frame()]); frameIndex++; render(); });
$('#frame-del').addEventListener('click', () => {
  if (frames().length < 2) return status('Mindestens ein Frame muss bleiben', 'err');
  pushPixelUndo(); frames().splice(frameIndex, 1); frameIndex = Math.max(0, frameIndex - 1); render();
});
function moveFrame(d) {
  const j = frameIndex + d;
  if (j < 0 || j >= frames().length) return;
  pushPixelUndo();
  const fs = frames(); [fs[frameIndex], fs[j]] = [fs[j], fs[frameIndex]]; frameIndex = j; render();
}
$('#frame-left').addEventListener('click', () => moveFrame(-1));
$('#frame-right').addEventListener('click', () => moveFrame(1));

// ============================================================
//  3 · VORSCHAU
// ============================================================
const preview = $('#preview');
const vctx = preview.getContext('2d');
let previewT = 0, lastT = performance.now();
function previewLoop(now) {
  previewT += (now - lastT) / 1000; lastT = now;
  const s = Math.max(1, Math.floor(192 / Math.max(sprite.width, sprite.height)));
  if (preview.width !== sprite.width * s || preview.height !== sprite.height * s) {
    preview.width = sprite.width * s; preview.height = sprite.height * s;
  }
  vctx.clearRect(0, 0, preview.width, preview.height);
  const fs = frames();
  const i = Math.floor(previewT * (sprite.fps[anim] || 8)) % fs.length;
  drawFrame(vctx, fs[i], s, 1, $('#preview-flip').checked);
  requestAnimationFrame(previewLoop);
}
requestAnimationFrame(previewLoop);

// ============================================================
//  LADEN, NEU, GRÖSSE, SPEICHERN
// ============================================================
function syncInputs() {
  $('#sprite-name').value = sprite.name;
  $('#sprite-w').value = sprite.width;
  $('#sprite-h').value = sprite.height;
}

function render() {
  if (!sprite.animations[anim]) anim = Object.keys(sprite.animations)[0];
  frameIndex = Math.min(frameIndex, frames().length - 1);
  renderPixels(); renderAnimSelect(); renderFrames();
}

// ---------------- Skins ----------------
// Standardgrafiken (assets/sprites/) sind geschützt. Gespeichert wird immer in einen Skin
// (assets/skins/<skin>/). Ein Skin enthält nur die Sprites, die er verändert.
let defaults = [];   // Namen der Standard-Sprites
let skins = {};      // { skinName: [spriteNamen] }
let skin = '';       // gewählter Skin ('' = Standard, nur ansehen)
let source = 'neu';  // woher das geladene Sprite stammt: 'standard' | 'skin' | 'neu'

const inSkin = name => !!skin && (skins[skin] || []).includes(name);

async function loadManifest() {
  try {
    defaults = (await (await fetch('/assets/sprites/index.json', { cache: 'no-store' })).json()).sprites;
    skins = (await (await fetch('/assets/skins/index.json', { cache: 'no-store' })).json()).skins || {};
  } catch { status('Sprite-Liste nicht gefunden', 'err'); }
  renderSkinSelect();
  renderSpriteSelect();
}

function renderSkinSelect() {
  const sel = $('#skin-select');
  sel.innerHTML = '<option value="">Standard (geschützt)</option>';
  for (const name of Object.keys(skins).sort()) {
    const o = document.createElement('option');
    o.value = name; o.textContent = `Skin: ${name}`;
    sel.appendChild(o);
  }
  if (skin && !skins[skin]) {  // neuer, noch leerer Skin
    const o = document.createElement('option');
    o.value = skin; o.textContent = `Skin: ${skin} (neu)`;
    sel.appendChild(o);
  }
  sel.value = skin;
}

function renderSpriteSelect() {
  const sel = $('#sprite-select');
  const current = sel.value;
  sel.innerHTML = '<option value="">– laden –</option>';
  const names = [...new Set([...defaults, ...(skins[skin] || [])])].sort();
  for (const name of names) {
    const o = document.createElement('option');
    o.value = name;
    o.textContent = inSkin(name) ? `★ ${name}` : name;  // ★ = in diesem Skin verändert
    sel.appendChild(o);
  }
  sel.value = names.includes(current) ? current : '';
}

function updateSourceInfo() {
  const info = $('#source-info');
  const name = sprite.name;
  if (source === 'skin') info.textContent = `„${name}“ aus Skin ${skin}`;
  else if (source === 'standard') info.textContent = `„${name}“ – Standardgrafik`;
  else info.textContent = 'neues Sprite';
  $('#btn-reset').hidden = !(inSkin(name) && defaults.includes(name));
  $('#btn-save').textContent = skin ? `In Skin „${skin}“ speichern` : 'Speichern (Skin wählen)';
}

async function loadSprite(name) {
  const fromSkin = inSkin(name);
  const url = fromSkin ? `/assets/skins/${skin}/${name}.json` : `/assets/sprites/${name}.json`;
  sprite = await (await fetch(url, { cache: 'no-store' })).json();
  sprite.fps ||= {};
  source = fromSkin ? 'skin' : 'standard';
  anim = Object.keys(sprite.animations)[0]; frameIndex = 0;
  pixelUndo = [];
  syncInputs(); resizeSketch(); render(); updateSourceInfo();
}

$('#sprite-select').addEventListener('change', async e => {
  if (!e.target.value) return;
  await loadSprite(e.target.value);
  status(`„${e.target.value}“ geladen`);
});

$('#skin-select').addEventListener('change', async e => {
  skin = e.target.value;
  renderSpriteSelect();
  // gleiches Sprite in der Version des gewählten Skins (oder Standard) neu laden
  if (defaults.includes(sprite.name) || inSkin(sprite.name)) await loadSprite(sprite.name);
  updateSourceInfo();
  status(skin ? `Skin „${skin}“ gewählt` : 'Standard gewählt – nur ansehen, Speichern braucht einen Skin');
});

$('#skin-add').addEventListener('click', () => {
  const name = $('#skin-new-name').value.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(name)) return status('Skin-Name: nur a–z, 0–9 und -', 'err');
  skin = name;
  $('#skin-new-name').value = '';
  renderSkinSelect(); renderSpriteSelect(); updateSourceInfo();
  status(`Skin „${name}“ angelegt – wird beim ersten Speichern erstellt`, 'ok');
});

// Skin-Version löschen → die Standardgrafik gilt wieder
$('#btn-reset').addEventListener('click', async () => {
  const name = sprite.name;
  if (!confirm(`„${name}“ im Skin „${skin}“ auf die Standardgrafik zurücksetzen?`)) return;
  try {
    const res = await fetch(`/api/skins/${skin}/sprites/${name}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    skins = data.skins;
    renderSkinSelect(); renderSpriteSelect();
    await loadSprite(name);
    status(`„${name}“ ist wieder Standard`, 'ok');
  } catch (err) {
    status('Zurücksetzen fehlgeschlagen (' + err.message + ')', 'err');
  }
});

const readSize = () => [
  Math.max(1, Math.min(64, Number($('#sprite-w').value) || 16)),
  Math.max(1, Math.min(64, Number($('#sprite-h').value) || 16)),
];

$('#btn-new').addEventListener('click', () => {
  const [w, h] = readSize();
  pushPixelUndo();
  sprite = blankSprite($('#sprite-name').value.trim().toLowerCase() || 'neues-sprite', w, h);
  anim = 'default'; frameIndex = 0;
  $('#sprite-select').value = '';
  source = 'neu';
  resizeSketch(); sctx.clearRect(0, 0, sketch.width, sketch.height);
  render(); updateSourceInfo();
  status('Neues Sprite');
});

// Größe ändern: unten mittig verankert (gut für Figuren, die auf dem Boden stehen)
$('#btn-resize').addEventListener('click', () => {
  const [w, h] = readSize();
  pushPixelUndo();
  const dx = Math.floor((w - sprite.width) / 2), dy = h - sprite.height;
  for (const fs of Object.values(sprite.animations)) {
    fs.forEach((f, i) => {
      const out = blankFrame(w, h).map(r => [...r]);
      f.forEach((row, y) => [...row].forEach((ch, x) => {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h) out[ny][nx] = ch;
      }));
      fs[i] = out.map(r => r.join(''));
    });
  }
  sprite.width = w; sprite.height = h;
  resizeSketch(); render();
  status(`Größe jetzt ${w}×${h}`);
});

$('#btn-save').addEventListener('click', async () => {
  if (!skin) return status('Standardgrafiken sind geschützt – wähle oben einen Skin oder lege einen neuen an', 'err');
  const name = $('#sprite-name').value.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(name)) return status('Name: nur a–z, 0–9 und -', 'err');
  sprite.name = name;
  try {
    const res = await fetch(`/api/skins/${skin}/sprites/${name}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sprite),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.status);
    skins = data.skins;
    source = 'skin';
    renderSkinSelect(); renderSpriteSelect();
    $('#sprite-select').value = name;
    updateSourceInfo();
    status(`Gespeichert in Skin „${skin}“: assets/skins/${skin}/${name}.json`, 'ok');
  } catch (err) {
    status('Speichern fehlgeschlagen: ' + err.message, 'err');
  }
});

// ---------------- Tastenkürzel ----------------
addEventListener('keydown', e => {
  if (e.target.matches('input, select')) return;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undoPixel(); return; }
  const map = { b: 'pen', e: 'erase', g: 'fill', i: 'pick' };
  if (map[e.key]) setTool(map[e.key]);
  if (e.key === 'ArrowLeft' && frameIndex > 0) { frameIndex--; render(); }
  if (e.key === 'ArrowRight' && frameIndex < frames().length - 1) { frameIndex++; render(); }
});

// ---------------- Start ----------------
buildPalette();
resizeSketch();
render();
loadManifest().then(updateSourceInfo);
fetch('/api/ping').then(r => { if (!r.ok) throw 0; status('Bereit'); })
  .catch(() => status('Hinweis: Speichern geht nur mit „npm run dev“', 'err'));

// für Tests in der Konsole
window.studio = { get sprite() { return sprite; }, convertSketch, sketch: sctx };
