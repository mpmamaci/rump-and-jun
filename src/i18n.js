// ============================================================
//  SPRACHEN – alle sichtbaren Texte des Spiels auf Deutsch und Englisch.
//  Neue Sprache: einfach einen weiteren Block wie `en` ergänzen.
//  Die Pixel-Schrift kennt A–Z, 0–9, ÄÖÜ und einige Satzzeichen.
// ============================================================
const KEY = 'rump-and-jun.lang';

const STRINGS = {
  de: {
    'lang.name': 'DEUTSCH',
    'on': 'AN', 'off': 'AUS',
    // Menüs
    'menu.play': 'SPIELEN', 'menu.leaderboard': 'RANGLISTE', 'menu.settings': 'EINSTELLUNGEN',
    'menu.resume': 'WEITER', 'menu.restart': 'NEUSTART', 'menu.mainMenu': 'HAUPTMENÜ', 'menu.back': 'ZURÜCK',
    'menu.pause': 'PAUSE',
    'menu.hint': '↑ ↓ WÄHLEN  ·  LEERTASTE OK  ·  ESC ZURÜCK',
    // Einstellungen
    'set.sound': 'SOUNDEFFEKTE', 'set.music': 'MUSIK', 'set.skin': 'SKIN', 'set.default': 'STANDARD',
    'set.tempo': 'TEMPO', 'set.points': 'PUNKTE', 'set.onlyMenu': 'NUR IM MENÜ',
    'set.fullscreen': 'VOLLBILD', 'set.buttons': 'TASTEN', 'set.side': 'NEBEN DEM BILD', 'set.overlay': 'ÜBERLAGERT',
    'set.language': 'SPRACHE',
    'tempo.NORMAL': 'NORMAL', 'tempo.SCHNELL': 'SCHNELL', 'tempo.TURBO': 'TURBO',
    // Titel
    'title.tagline': 'DAS ENDLOSE PIXEL-ABENTEUER',
    'title.hint': '↑ ↓ WÄHLEN  ·  LEERTASTE / ANTIPPEN: OK',
    // HUD & Spiel
    'hud.points': 'PUNKTE', 'hud.best': 'REKORD', 'hud.combo': 'KOMBO',
    'ready': '→ ODER LEERTASTE: LOS!',
    'dead.newRecord': 'NEUER REKORD!', 'dead.coins': 'MÜNZEN', 'dead.bestCombo': 'BESTE KOMBO',
    'popup.wallHint': 'AN DER WAND: SPRINGEN = WANDSPRUNG!',
    'popup.landing': 'LANDUNG!', 'popup.shieldGone': 'SCHILD WEG!',
    'powerup.doublejump': 'DOPPELSPRUNG!', 'powerup.shield': 'SCHILD!', 'powerup.slowmo': 'ZEITLUPE!', 'powerup.rocket': 'RAKETE!!',
    'biome.wiese': 'WIESE', 'biome.hoehle': 'KRISTALLHÖHLE', 'biome.burg': 'BURG IM ABENDROT', 'biome.nacht': 'STERNENNACHT',
    // Namenseingabe & Rangliste
    'name.top': 'TOP 10!', 'name.yourName': 'DEIN NAME:',
    'name.hint1': '↑ ↓ ODER TIPPEN: BUCHSTABE', 'name.hint2': 'LEERTASTE / ENTER: WEITER',
    'board.title': 'RANGLISTE', 'board.back': 'LEERTASTE: ZURÜCK', 'board.again': 'LEERTASTE: NOCHMAL!',
    'board.name': 'NAME', 'board.meters': 'METER', 'board.points': 'PUNKTE',
    'pad.connected': 'CONTROLLER VERBUNDEN',
    // HTML rund ums Spiel
    'html.run': 'laufen', 'html.jump': 'springen', 'html.hold': '(halten = höher)', 'html.space': 'Leertaste',
    'html.pause': 'Pause', 'html.fullscreen': 'Vollbild', 'html.sound': 'Ton',
    'html.rotate': '↻ Für die beste Ansicht das Handy ins Querformat drehen',
    'html.fsTitle': 'Vollbild auf dem iPhone',
    'html.fsText': 'Safari erlaubt Webseiten auf dem iPhone kein Vollbild. So geht es trotzdem:',
    'html.fsStep1': 'Unten auf <b>Teilen</b> tippen (Quadrat mit Pfeil nach oben)',
    'html.fsStep2': '<b>„Zum Home-Bildschirm“</b> wählen',
    'html.fsStep3': 'Das Spiel über das neue Symbol starten, dann läuft es ohne Browserleisten',
    'html.fsOk': 'Alles klar',
    'html.btnFullscreen': 'Vollbild', 'html.btnPause': 'Pause',
  },
  en: {
    'lang.name': 'ENGLISH',
    'on': 'ON', 'off': 'OFF',
    'menu.play': 'PLAY', 'menu.leaderboard': 'LEADERBOARD', 'menu.settings': 'SETTINGS',
    'menu.resume': 'RESUME', 'menu.restart': 'RESTART', 'menu.mainMenu': 'MAIN MENU', 'menu.back': 'BACK',
    'menu.pause': 'PAUSED',
    'menu.hint': '↑ ↓ SELECT  ·  SPACE OK  ·  ESC BACK',
    'set.sound': 'SOUND EFFECTS', 'set.music': 'MUSIC', 'set.skin': 'SKIN', 'set.default': 'DEFAULT',
    'set.tempo': 'SPEED', 'set.points': 'SCORE', 'set.onlyMenu': 'MAIN MENU ONLY',
    'set.fullscreen': 'FULLSCREEN', 'set.buttons': 'BUTTONS', 'set.side': 'BESIDE VIEW', 'set.overlay': 'OVERLAY',
    'set.language': 'LANGUAGE',
    'tempo.NORMAL': 'NORMAL', 'tempo.SCHNELL': 'FAST', 'tempo.TURBO': 'TURBO',
    'title.tagline': 'THE ENDLESS PIXEL ADVENTURE',
    'title.hint': '↑ ↓ SELECT  ·  SPACE / TAP: OK',
    'hud.points': 'SCORE', 'hud.best': 'BEST', 'hud.combo': 'COMBO',
    'ready': '→ OR SPACE: GO!',
    'dead.newRecord': 'NEW RECORD!', 'dead.coins': 'COINS', 'dead.bestCombo': 'BEST COMBO',
    'popup.wallHint': 'ON A WALL: JUMP = WALL JUMP!',
    'popup.landing': 'LANDING!', 'popup.shieldGone': 'SHIELD LOST!',
    'powerup.doublejump': 'DOUBLE JUMP!', 'powerup.shield': 'SHIELD!', 'powerup.slowmo': 'SLOW MOTION!', 'powerup.rocket': 'ROCKET!!',
    'biome.wiese': 'MEADOW', 'biome.hoehle': 'CRYSTAL CAVE', 'biome.burg': 'CASTLE AT SUNSET', 'biome.nacht': 'STARRY NIGHT',
    'name.top': 'TOP 10!', 'name.yourName': 'YOUR NAME:',
    'name.hint1': '↑ ↓ OR TYPE: LETTER', 'name.hint2': 'SPACE / ENTER: NEXT',
    'board.title': 'LEADERBOARD', 'board.back': 'SPACE: BACK', 'board.again': 'SPACE: PLAY AGAIN!',
    'board.name': 'NAME', 'board.meters': 'METERS', 'board.points': 'SCORE',
    'pad.connected': 'CONTROLLER CONNECTED',
    'html.run': 'run', 'html.jump': 'jump', 'html.hold': '(hold = higher)', 'html.space': 'Space',
    'html.pause': 'Pause', 'html.fullscreen': 'Fullscreen', 'html.sound': 'Sound',
    'html.rotate': '↻ Turn your phone sideways for the best view',
    'html.fsTitle': 'Fullscreen on iPhone',
    'html.fsText': 'Safari does not allow websites to go fullscreen on iPhone. Here is how to do it anyway:',
    'html.fsStep1': 'Tap <b>Share</b> at the bottom (square with an arrow pointing up)',
    'html.fsStep2': 'Choose <b>“Add to Home Screen”</b>',
    'html.fsStep3': 'Start the game from the new icon – it then runs without browser bars',
    'html.fsOk': 'Got it',
    'html.btnFullscreen': 'Fullscreen', 'html.btnPause': 'Pause',
  },
};

export const LANGUAGES = Object.keys(STRINGS);

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (STRINGS[saved]) return saved;
  } catch { /* privates Fenster o. Ä. */ }
  // Beim ersten Start: Browsersprache, sonst Englisch
  return (navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en';
}

let lang = initialLang();

export const getLang = () => lang;

export function setLang(next) {
  if (!STRINGS[next]) return;
  lang = next;
  try { localStorage.setItem(KEY, next); } catch { /* egal */ }
  applyHtml();
}

// Text holen; fehlt er in der Sprache, gilt Deutsch, sonst der Schlüssel selbst
export const t = key => STRINGS[lang][key] ?? STRINGS.de[key] ?? key;

// Texte in der HTML-Seite (Tasten-Hinweise, iPhone-Dialog …) übersetzen
export function applyHtml() {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);  // nur eigene, feste Texte
  for (const el of document.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
}
