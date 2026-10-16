import { VIEW_WIDTH, VIEW_HEIGHT, STEP, SCROLL_START, SCROLL_MAX, SLOWMO_FACTOR } from './config.js';
import { Game } from './game.js';
import { initInput } from './input.js';
import { draw } from './render/renderer.js';
import { loadSprites } from './render/assets.js';
import { loadFont } from './render/font.js';
import { unlockAudio, playSfx, startMusic, stopMusic, setSong, setTempo, audioSettings, setSound, setMusic } from './audio/audio.js';
import { SONGS } from './data/music.js';

const canvas = document.getElementById('game');
const frame = document.getElementById('game-frame');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Erst alle eigenen Assets laden, dann starten
ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
await Promise.all([loadSprites(), loadFont()]);

const game = new Game(VIEW_WIDTH, VIEW_HEIGHT);

game.sound = playSfx;

initInput({
  onKeyDown: (code, key, repeat) => {
    unlockAudio();
    if (game.handleKey(code, key, repeat)) return;
    // M: Ton an/aus (Musik und Effekte)
    if (code === 'KeyM' && !repeat) {
      const on = !(audioSettings.sound || audioSettings.music);
      setSound(on); setMusic(on);
    }
  },
});
addEventListener('pointerdown', unlockAudio);

// ============================================================
//  MUSIK – läuft während des Spiels, Tempo wächst mit dem Scroll-Tempo
// ============================================================
function updateMusic() {
  if (game.state === 'run') {
    const k = (game.scrollSpeed - SCROLL_START) / (SCROLL_MAX - SCROLL_START);
    const bpm = (112 + 48 * Math.max(0, k)) * (game.effects.slowmo > 0 ? SLOWMO_FACTOR + 0.15 : 1);
    setTempo(bpm);
    setSong(game.zone % SONGS.length);
    startMusic(game.zone % SONGS.length);
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
  const framePad = 16;  // Innenabstand des Rahmens (2 × 8px)
  const availW = window.innerWidth - 32 - framePad;
  const availH = window.innerHeight * 0.75 - framePad;
  const fit = Math.min(availW / VIEW_WIDTH, availH / VIEW_HEIGHT);
  // Ganzzahlig, wenn möglich; auf sehr kleinen Bildschirmen notfalls kleiner als 1×
  const scale = fit >= 1 ? Math.floor(fit) : fit;
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
  draw(ctx, game);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
