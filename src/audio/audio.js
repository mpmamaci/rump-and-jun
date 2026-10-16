// ============================================================
//  AUDIO – Soundeffekte und Musik, live erzeugt mit der Web-Audio-API.
//  Keine Audiodateien: alles sind Oszillatoren und Rauschen.
// ============================================================
import { SONGS } from '../data/music.js';

let ac = null;              // AudioContext – erst nach der ersten Eingabe erlaubt
let master, sfxBus, musicBus, noiseBuffer;
const settings = loadSettings();

function loadSettings() {
  try { return { sound: true, music: true, ...JSON.parse(localStorage.getItem('jump-and-run.settings') || '{}') }; }
  catch { return { sound: true, music: true }; }
}
function saveSettings() {
  try { localStorage.setItem('jump-and-run.settings', JSON.stringify(settings)); } catch { /* egal */ }
}
export const audioSettings = settings;

// Browser erlauben Ton erst nach einer Nutzeraktion → bei Taste/Touch aufrufen
export function unlockAudio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = 0.35; musicBus.connect(master);
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applySettings();
  }
  if (ac.state === 'suspended') ac.resume();
}

function applySettings() {
  if (!ac) return;
  sfxBus.gain.value = settings.sound ? 1 : 0;
  musicBus.gain.value = settings.music ? 0.35 : 0;
}

export function setSound(on) { settings.sound = on; saveSettings(); applySettings(); }
export function setMusic(on) { settings.music = on; saveSettings(); applySettings(); }

const midiToFreq = m => 440 * 2 ** ((m - 69) / 12);

// ---------------- Bausteine ----------------
function tone({ type = 'square', freq, to = freq, dur = 0.1, vol = 0.3, at = 0, bus = sfxBus, attack = 0.005 }) {
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to !== freq) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise({ dur = 0.1, vol = 0.3, at = 0, filter = 3000, bus = sfxBus, type = 'lowpass' }) {
  const t = ac.currentTime + at;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = filter;
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(bus);
  src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
}

const arp = (notes, step, opts) => notes.forEach((m, i) => tone({ freq: midiToFreq(m), dur: step * 1.6, at: i * step, ...opts }));

// ---------------- Soundeffekte ----------------
const SFX = {
  jump: () => tone({ freq: 280, to: 620, dur: 0.12, vol: 0.18 }),
  walljump: () => { tone({ freq: 360, to: 760, dur: 0.1, vol: 0.16 }); noise({ dur: 0.05, vol: 0.12, filter: 2500 }); },
  spring: () => { tone({ type: 'triangle', freq: 180, to: 900, dur: 0.28, vol: 0.3 }); tone({ freq: 440, to: 1300, dur: 0.2, vol: 0.08, at: 0.04 }); },
  rocket: () => {
    noise({ dur: 0.9, vol: 0.3, filter: 1400 });
    tone({ type: 'sawtooth', freq: 110, to: 880, dur: 0.8, vol: 0.14 });
    arp([72, 76, 79, 84, 88, 91], 0.06, { vol: 0.12 });
  },
  doublejump: () => { tone({ freq: 520, to: 1100, dur: 0.12, vol: 0.16 }); tone({ type: 'triangle', freq: 780, to: 1500, dur: 0.15, vol: 0.12, at: 0.03 }); },
  coin: () => { tone({ freq: 988, dur: 0.06, vol: 0.15 }); tone({ freq: 1319, dur: 0.16, vol: 0.15, at: 0.06 }); },
  stomp: (combo = 1) => {
    const up = Math.min(combo - 1, 8) * 2;  // Kombo: jeder Treffer etwas höher
    tone({ type: 'triangle', freq: midiToFreq(67 + up), to: midiToFreq(55 + up), dur: 0.15, vol: 0.35 });
    noise({ dur: 0.06, vol: 0.2, filter: 1800 });
  },
  powerup: () => arp([72, 76, 79, 84, 88], 0.05, { vol: 0.14 }),
  shieldbreak: () => { noise({ dur: 0.25, vol: 0.3, filter: 5000, type: 'highpass' }); tone({ type: 'sawtooth', freq: 700, to: 180, dur: 0.25, vol: 0.12 }); },
  crumble: () => noise({ dur: 0.18, vol: 0.18, filter: 900 }),
  death: () => { tone({ type: 'sawtooth', freq: 420, to: 55, dur: 0.55, vol: 0.2 }); noise({ dur: 0.35, vol: 0.25, filter: 1200 }); },
  // Fanfare kommt kurz nach dem Todesgeräusch
  record: () => [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => tone({ freq: midiToFreq(m), dur: 0.13, at: 0.55 + i * 0.08, vol: 0.14 })),
  blip: () => tone({ freq: 880, dur: 0.05, vol: 0.1 }),
  confirm: () => { tone({ freq: 660, dur: 0.06, vol: 0.12 }); tone({ freq: 990, dur: 0.1, vol: 0.12, at: 0.06 }); },
  start: () => arp([60, 64, 67, 72], 0.06, { vol: 0.12 }),
};

export function playSfx(name, ...args) {
  if (!ac || !settings.sound) return;
  SFX[name]?.(...args);
}

// ============================================================
//  MUSIK-SEQUENCER
//  Plant Noten ein kleines Stück im Voraus (Lookahead), damit das Timing
//  auch dann sauber bleibt, wenn das Spiel kurz ruckelt.
// ============================================================
const LOOKAHEAD = 0.12;   // so weit im Voraus planen (Sekunden)
const music = { playing: false, song: 0, pending: null, bpm: 120, step: 0, nextTime: 0, timer: null };

function chordTone(chord, idx) {
  const [root, kind] = chord;
  const iv = kind === 'min' ? [0, 3, 7] : [0, 4, 7];
  return root + iv[idx % 3] + 12 * Math.floor(idx / 3);
}

function scheduleStep(step, t) {
  if (step % 16 === 0 && music.pending !== null) { music.song = music.pending; music.pending = null; }
  const song = SONGS[music.song];
  const bar = Math.floor(step / 16) % song.chords.length;
  const s = step % 16;
  const chord = song.chords[bar];
  const stepDur = 60 / music.bpm / 4;
  const at = t - ac.currentTime;

  const li = song.lead[s];
  if (li >= 0) tone({ freq: midiToFreq(chordTone(chord, li) + 12), dur: stepDur * 0.9, vol: 0.09, at, bus: musicBus });
  const bi = song.bass[s];
  if (bi >= 0) tone({ type: 'triangle', freq: midiToFreq(chord[0] - 24 + bi * 12), dur: stepDur * 1.4, vol: 0.3, at, bus: musicBus });
  const dr = song.drums[s];
  if (dr === 'K') tone({ type: 'sine', freq: 150, to: 45, dur: 0.12, vol: 0.5, at, bus: musicBus });
  if (dr === 'S') noise({ dur: 0.1, vol: 0.22, filter: 2500, at, bus: musicBus });
  if (dr === 'h') noise({ dur: 0.03, vol: 0.08, filter: 7000, type: 'highpass', at, bus: musicBus });
}

function tick() {
  while (music.nextTime < ac.currentTime + LOOKAHEAD) {
    scheduleStep(music.step, music.nextTime);
    music.nextTime += 60 / music.bpm / 4;
    music.step++;
  }
}

export function startMusic(song = 0) {
  if (!ac) return;
  music.song = song % SONGS.length;
  if (music.playing) return;
  music.playing = true;
  music.step = 0;
  music.nextTime = ac.currentTime + 0.05;
  music.timer = setInterval(tick, 25);
}

export function stopMusic() {
  music.playing = false;
  clearInterval(music.timer);
}

// Wechselt den Song am nächsten Taktanfang, damit es nicht holpert
export function setSong(song) {
  const next = song % SONGS.length;
  if (next !== music.song) music.pending = next;
}

export function setTempo(bpm) { music.bpm = bpm; }
