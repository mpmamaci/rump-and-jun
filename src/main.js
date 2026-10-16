import { VIEW_WIDTH, VIEW_HEIGHT, STEP, SCROLL_START, SCROLL_MAX, SLOWMO_FACTOR } from './config.js';
import { Game } from './game.js';
import { initInput } from './input.js';
import { draw } from './render/renderer.js';
import { loadSprites, loadSkinList, setSkin, getActiveSkin } from './render/assets.js';
import { loadSkinChoice, saveSkinChoice } from './storage/skin.js';
import { loadFont } from './render/font.js';
import { unlockAudio, playSfx, startMusic, stopMusic, setSong, setTempo, audioSettings, setSound, setMusic } from './audio/audio.js';
import { SONGS } from './data/music.js';
import { initTouch } from './ui/touch.js';

const canvas = document.getElementById('game');
const frame = document.getElementById('game-frame');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Erst alle eigenen Assets laden, dann starten
ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
await Promise.all([loadSprites(), loadFont()]);
// Skin: gespeicherte Wahl laden – gibt es den Skin nicht mehr, gilt Standard
let skinNames = await loadSkinList();
await setSkin(loadSkinChoice()).catch(() => setSkin(''));

const game = new Game(VIEW_WIDTH, VIEW_HEIGHT);

game.sound = playSfx;
game.options = {
  sound: () => audioSettings.sound, setSound,
  music: () => audioSettings.music, setMusic,
  skin: getActiveSkin,
  // Standard → Skin 1 → Skin 2 → … → Standard
  async nextSkin() {
    skinNames = await loadSkinList();
    const order = ['', ...skinNames];
    const next = order[(order.indexOf(getActiveSkin()) + 1) % order.length];
    saveSkinChoice(await setSkin(next));
  },
};

function onKeyDown(code, key, repeat) {
  unlockAudio();
  if (game.handleKey(code, key, repeat)) return;
  // M: Ton an/aus (Musik und Effekte)
  if (code === 'KeyM' && !repeat) {
    const on = !(audioSettings.sound || audioSettings.music);
    setSound(on); setMusic(on);
  }
}
initInput({ onKeyDown });
initTouch(document, onKeyDown);
addEventListener('pointerdown', unlockAudio);

// Antippen/Klicken ins Spielbild – für Menüs
canvas.addEventListener('pointerdown', e => {
  const r = canvas.getBoundingClientRect();
  game.handleTap((e.clientX - r.left) * VIEW_WIDTH / r.width, (e.clientY - r.top) * VIEW_HEIGHT / r.height);
});

// Tab gewechselt oder Fenster verlassen → automatisch Pause
document.addEventListener('visibilitychange', () => { if (document.hidden) game.pause(); });
addEventListener('blur', () => game.pause());

// ============================================================
//  MUSIK – läuft während des Spiels, Tempo wächst mit dem Scroll-Tempo
// ============================================================
function updateMusic() {
  if (game.state === 'run') {
    const k = (game.scrollSpeed - SCROLL_START) / (SCROLL_MAX - SCROLL_START);
    const bpm = (112 + 48 * Math.max(0, k)) * game.tempo.speed * (game.effects.slowmo > 0 ? SLOWMO_FACTOR + 0.15 : 1);
    setTempo(bpm);
    setSong(game.zone % SONGS.length);
    startMusic(game.zone % SONGS.length);
  } else if (game.inTitle) {
    setTempo(100);
    setSong(0);
    startMusic(0);
  } else if (game.state !== 'ready') {
    stopMusic();
  }
}

// Zum Debuggen in der Browser-Konsole: window.game
window.game = game;

// ============================================================
//  SKALIERUNG – immer ein ganzzahliges Vielfaches, damit Pixel scharf bleiben
// ============================================================
function resize() {
  const app = document.querySelector('.app');
  const px = (el, prop) => parseFloat(getComputedStyle(el)[prop]) || 0;
  // Platz, den Tasten-Hinweise & Abstände brauchen (auf kleinen Handys ausgeblendet)
  const others = [...app.children].filter(el => el !== frame && el.offsetParent)
    .reduce((h, el) => h + el.offsetHeight + px(app, 'rowGap'), 0);
  const availW = innerWidth - px(app, 'paddingLeft') - px(app, 'paddingRight') - px(frame, 'paddingLeft') - px(frame, 'paddingRight');
  const availH = innerHeight - px(app, 'paddingTop') - px(app, 'paddingBottom') - px(frame, 'paddingTop') - px(frame, 'paddingBottom') - others;
  const fit = Math.min(availW / VIEW_WIDTH, availH / VIEW_HEIGHT);
  // Desktop: ganzzahlig in echten Gerätepixeln → perfekt scharfe Pixel.
  // Touch-Geräte: ganze Fläche nutzen – auf kleinen Bildschirmen zählt die Größe mehr.
  const dpr = devicePixelRatio || 1;
  const touch = document.body.classList.contains('touch');
  const scale = touch || fit * dpr < 1 ? fit : Math.floor(fit * dpr) / dpr;
  canvas.style.width = VIEW_WIDTH * scale + 'px';
  canvas.style.height = VIEW_HEIGHT * scale + 'px';
  frame.style.setProperty('--scale', scale);
}
addEventListener('resize', resize);
resize();

// ============================================================
//  GAME LOOP – feste Physik-Schritte, Zeichnen so oft der Bildschirm kann
// ============================================================
const MAX_STEPS = 5;  // falls der Tab hängt: nicht hunderte Schritte nachholen
let last = performance.now();
let acc = 0;
function loop(now) {
  acc += Math.min((now - last) / 1000, MAX_STEPS * STEP);
  last = now;
  while (acc >= STEP) {
    game.update(STEP);
    acc -= STEP;
  }
  updateMusic();
  if (document.body.dataset.state !== game.state) document.body.dataset.state = game.state;  // für CSS (z. B. Pause-Button)
  draw(ctx, game);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
