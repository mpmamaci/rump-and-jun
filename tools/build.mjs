// ============================================================
//  BUILD – erzeugt dist/ zum Hochladen auf einen statischen Webspace.
//
//  Aufruf:  npm run build
//
//  - prüft vorher alle Chunks
//  - bündelt und minifiziert das JavaScript zu einer Datei
//  - minifiziert CSS, HTML und alle JSON-Assets (Sprites, Schrift, Skins)
//  - Dateinamen mit Inhalts-Hash → Browser laden nach einem Update sicher die neue Version
//  - ohne Pixel-Studio, Dev-Server und Dokumentation
//  Die Quelldateien werden nicht verändert.
// ============================================================
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, rm, readdir, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const rel = p => path.relative(ROOT, p);

// 1) Chunks prüfen – ein kaputter Chunk soll nie online gehen
execFileSync(process.execPath, [path.join(ROOT, 'tools/check-chunks.mjs')], { stdio: 'inherit' });

// 2) dist/ leeren
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

// 3) JavaScript + CSS bündeln und minifizieren
const result = await build({
  entryPoints: { game: path.join(ROOT, 'src/main.js'), style: path.join(ROOT, 'styles/main.css') },
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2022', 'safari15'],
  outdir: DIST,
  entryNames: '[name]-[hash]',
  metafile: true,
  legalComments: 'none',
  logLevel: 'warning',
});
const outputs = Object.keys(result.metafile.outputs).map(f => path.basename(f));
const jsFile = outputs.find(f => f.startsWith('game-') && f.endsWith('.js'));
const cssFile = outputs.find(f => f.startsWith('style-') && f.endsWith('.css'));

// 4) HTML: auf die gebündelten Dateien umstellen und minifizieren
let html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
html = html
  .replace(/<link rel="stylesheet" href="[^"]+">/, `<link rel="stylesheet" href="${cssFile}">`)
  .replace(/<script type="module" src="[^"]+"><\/script>/, `<script type="module" src="${jsFile}"></script>`)
  .replace(/<!--[\s\S]*?-->/g, '')   // Kommentare
  .replace(/>\s+</g, '><')           // Leerraum zwischen Tags
  .replace(/\s{2,}/g, ' ')
  .trim();
if (!html.includes(jsFile) || !html.includes(cssFile)) throw new Error('index.html: Skript oder Stylesheet nicht gefunden');
await writeFile(path.join(DIST, 'index.html'), html + '\n');

// 5) Assets kopieren – JSON minifizieren, Bilder (App-Symbole) unverändert
const minifyJson = async src => JSON.stringify(JSON.parse(await readFile(src, 'utf8')));
async function copyAssets(srcDir) {
  let count = 0;
  for (const entry of await readdir(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    if (entry.isDirectory()) { count += await copyAssets(src); continue; }
    const dest = path.join(DIST, rel(src));
    if (entry.name.endsWith('.json')) {
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, await minifyJson(src));
    } else if (entry.name.endsWith('.png')) {
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(src, dest);
    } else continue;
    count++;
  }
  return count;
}
const assetCount = await copyAssets(path.join(ROOT, 'assets'));
// Web-App-Manifest (Home-Bildschirm / Vollbild)
await writeFile(path.join(DIST, 'manifest.webmanifest'), await minifyJson(path.join(ROOT, 'manifest.webmanifest')));

// 6) Zusammenfassung
async function dirSize(dir) {
  let total = 0, files = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { const s = await dirSize(p); total += s.total; files += s.files; }
    else { total += (await stat(p)).size; files++; }
  }
  return { total, files };
}
const { total, files } = await dirSize(DIST);
const skins = JSON.parse(await readFile(path.join(ROOT, 'assets/skins/index.json'), 'utf8')).skins;
const kb = n => (n / 1024).toFixed(1) + ' KB';

console.log('\n✓ Build fertig: dist/');
console.log(`  ${jsFile.padEnd(28)} ${kb((await stat(path.join(DIST, jsFile))).size)}`);
console.log(`  ${cssFile.padEnd(28)} ${kb((await stat(path.join(DIST, cssFile))).size)}`);
console.log(`  ${assetCount} Asset-Dateien, Skins: ${Object.keys(skins).join(', ') || 'keine'}`);
console.log(`  insgesamt ${files} Dateien, ${kb(total)}`);
console.log('\nZum Veröffentlichen den Inhalt von dist/ auf den Webspace hochladen.');
