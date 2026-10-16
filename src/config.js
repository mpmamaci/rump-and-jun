// ============================================================
//  EINSTELLUNGEN – hier kannst du rumspielen!
// ============================================================

// Interne Auflösung – wird ganzzahlig hochskaliert (Pixel-Art bleibt scharf)
export const VIEW_WIDTH = 480;
export const VIEW_HEIGHT = 270;

export const TILE = 16;          // Größe eines Blocks in Pixeln (1 Block = 1 Meter)
export const ROWS = 17;          // Höhe der Welt in Blöcken
export const STEP = 1 / 60;      // fester Zeitschritt: 60 Physik-Updates pro Sekunde

// Spieler
export const GRAVITY = 880;      // Schwerkraft (Pixel/s²)
export const MOVE_SPEED = 120;   // Laufgeschwindigkeit
export const JUMP_SPEED = 328;   // Sprungkraft (≈ 3,8 Blöcke hoch)
export const MAX_FALL = 360;     // maximale Fallgeschwindigkeit
export const COYOTE_TIME = 0.1;  // so lange darf man nach der Kante noch springen
export const JUMP_BUFFER = 0.12; // Sprung wird kurz "gemerkt", wenn man zu früh drückt

// Parkour
export const WALL_SLIDE_SPEED = 55;  // so langsam rutscht man an einer Wand herunter
export const WALL_KICK = 150;        // so stark stößt man sich beim Wandsprung ab
export const WALL_JUMP_LOCK = 0.12;  // kurz nach dem Wandsprung zählt die Laufrichtung nicht
export const WALL_COYOTE = 0.08;     // Wandsprung geht auch noch kurz nach dem Loslassen der Wand
export const SPRING_SPEED = 520;     // Sprungfeder: ca. 9,5 Blöcke hoch

// Gegner
export const ENEMY_SPEED = 28;
export const JUMPER_JUMP = 260;  // Sprungkraft der Springer
export const FLYER_SPEED = 22;
export const SWOOPER_DIVE = 150;     // Sturzflieger: Tempo beim Herabstoßen

// Plattformen
export const PLATFORM_SPEED = 40;
export const CRUMBLE_TIME = 0.45; // so lange hält eine Bröckel-Plattform

// Runner
export const SCROLL_START = 55;  // Auto-Scroll am Anfang (Pixel/s)
export const SCROLL_MAX = 100;   // Höchsttempo – muss unter MOVE_SPEED bleiben!
export const SCROLL_RAMP = 1200; // nach so vielen Metern sind ca. 63 % des Maximums erreicht
export const TIER_METERS = [0, 300, 800, 1500, 3000];  // ab hier beginnt Stufe 1, 2, 3, 4, 5
export const ZONE_METERS = 500;  // alle 500 m wechseln Biom und Musik
export const DEATH_PAUSE = 0.8;  // so lange bleibt der Game-Over-Moment stehen
export const GENERATE_AHEAD = 8; // so viele Blöcke rechts vom Bild sind schon fertig gebaut

// Power-ups
export const POWERUP_CHANCE = 0.55;   // Wahrscheinlichkeit, dass auf einem ?-Platz eins erscheint
export const POWERUP_MIN_GAP = 60;    // mindestens so viele Blöcke zwischen zwei Power-ups
export const DOUBLEJUMP_TIME = 15;
export const SLOWMO_TIME = 5;
export const SLOWMO_FACTOR = 0.6;     // Welt läuft in Zeitlupe mit 60 % Tempo
export const HURT_INVUL = 1.2;        // Unverwundbarkeit, nachdem das Schild gebrochen ist

// Rakete: seltenes Power-up, trägt dich unverwundbar über 500 m weit
export const ROCKET_METERS = 510;     // Mindeststrecke (die Landung kommt auf flachem Boden danach)
export const ROCKET_SPEED = 900;      // Pixel/s – ca. 9 Sekunden Flug
export const ROCKET_CHANCE = 0.25;    // Wahrscheinlichkeit auf einem !-Platz
export const ROCKET_MIN_GAP = 600;    // mindestens so viele Blöcke zwischen zwei Raketen

// Tempo-Stufen (Einstellungen): das ganze Spiel läuft schneller – dafür gibt es mehr Punkte.
// Nur der Scroll allein ginge nicht: über MOVE_SPEED wäre das Spiel nicht mehr schaffbar.
export const TEMPO_LEVELS = [
  { name: 'NORMAL', speed: 1, points: 1, mark: '' },
  { name: 'SCHNELL', speed: 1.25, points: 1.5, mark: '>' },
  { name: 'TURBO', speed: 1.5, points: 2, mark: '>>' },
];

// Fuchs: rettet dich manchmal beim Tod – wenn du ihn im Tic-Tac-Toe schlägst
export const FOX_CHANCE = 0.1;        // 10 % Chance pro Tod
export const FOX_MAX_PER_RUN = 1;     // höchstens so oft pro Lauf
export const FOX_WIN_CHANCE = 0.9;    // so oft nutzt der Fuchs eine Gewinnchance
export const FOX_BLOCK_CHANCE = 0.65; // so oft blockt er deine Reihe – sonst wäre er unschlagbar
export const FOX_THINK_TIME = 0.6;    // Bedenkzeit des Fuchses (Sekunden)
export const FOX_RESCUE_INVUL = 2;    // Unverwundbarkeit nach der Rettung

// Punkte
export const POINTS_COIN = 10;
export const POINTS_STOMP = 50;
