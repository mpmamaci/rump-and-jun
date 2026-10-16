// ============================================================
//  PIXEL-SCHRIFT – unsere eigene 5×7-Schrift aus assets/fonts/pixel-font.json
// ============================================================
let font = null;
const glyphCache = new Map(); // "zeichen|farbe" → Canvas

export async function loadFont() {
  const res = await fetch('assets/fonts/pixel-font.json', { cache: 'no-cache' });
  font = await res.json();
}

function glyph(ch, color) {
  const id = ch + '|' + color;
  let c = glyphCache.get(id);
  if (c) return c;
  const rows = font.glyphs[ch] || font.glyphs['?'];
  c = document.createElement('canvas');
  c.width = font.width; c.height = font.height;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  rows.forEach((row, y) => [...row].forEach((p, x) => { if (p === '#') ctx.fillRect(x, y, 1, 1); }));
  glyphCache.set(id, c);
  return c;
}

const normalize = text => String(text).toUpperCase().replace(/ß/g, 'SS');

export function textWidth(text, scale = 1) {
  const n = [...normalize(text)].length;
  return n ? (n * (font.width + font.spacing) - font.spacing) * scale : 0;
}

export const LINE_HEIGHT = 7;

// align: 'left' | 'center' | 'right'; shadow: Farbe für einen 1-Pixel-Schatten
export function drawText(ctx, text, x, y, { color = '#f4f4f4', scale = 1, align = 'left', shadow = null } = {}) {
  if (!font) return;
  const str = normalize(text);
  const w = textWidth(str, scale);
  let cx = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
  const cy = Math.round(y);
  const step = (font.width + font.spacing) * scale;
  for (const ch of str) {
    if (ch !== ' ') {
      if (shadow) ctx.drawImage(glyph(ch, shadow), cx + scale, cy + scale, font.width * scale, font.height * scale);
      ctx.drawImage(glyph(ch, color), cx, cy, font.width * scale, font.height * scale);
    }
    cx += step;
  }
}
