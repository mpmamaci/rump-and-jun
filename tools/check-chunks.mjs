// Prüft alle Chunks auf typische Fehler.
// Aufruf:  node tools/check-chunks.mjs
import { START_CHUNK, CHUNKS } from '../src/data/chunks.js';

const VALID = new Set([...' #=~^CEJBMVP?']);
let errors = 0;
const fail = (chunk, msg) => { errors++; console.error(`✗ ${chunk.name}: ${msg}`); };

const names = new Set();
for (const chunk of [START_CHUNK, ...CHUNKS]) {
  const { map } = chunk;
  if (names.has(chunk.name)) fail(chunk, 'Name doppelt');
  names.add(chunk.name);

  const width = Math.max(...map.map(l => l.length));
  const last = width - 1;
  map.forEach((line, i) => {
    for (const ch of line) if (!VALID.has(ch)) fail(chunk, `unbekanntes Zeichen "${ch}" in Zeile ${i + 1}`);
  });
  for (const li of [map.length - 1, map.length - 2]) {
    if (map[li][0] !== '#') fail(chunk, `erste Spalte hat keinen Boden (Zeile ${li + 1})`);
    if (map[li][last] !== '#') fail(chunk, `letzte Spalte hat keinen Boden (Zeile ${li + 1}, Breite ${width})`);
  }
  if (chunk !== START_CHUNK && map.some(l => l.includes('P'))) fail(chunk, 'P nur im Start-Chunk erlaubt');
  if (chunk !== START_CHUNK && !(chunk.difficulty >= 1 && chunk.difficulty <= 5)) fail(chunk, 'difficulty muss 1–5 sein');
}

const perTier = [1, 2, 3, 4, 5].map(t => CHUNKS.filter(c => c.difficulty === t).length);
console.log(`${CHUNKS.length} Chunks, pro Stufe: ${perTier.join(' / ')}`);
console.log(errors ? `${errors} Fehler gefunden` : '✓ alles in Ordnung');
process.exit(errors ? 1 : 0);
