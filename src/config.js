// ============================================================
//  EINSTELLUNGEN – hier kannst du rumspielen!
// ============================================================

// Interne Auflösung – wird ganzzahlig hochskaliert (Pixel-Art bleibt scharf)
export const VIEW_WIDTH = 480;
export const VIEW_HEIGHT = 270;

export const TILE = 16;          // Größe eines Blocks in Pixeln
export const STEP = 1 / 60;      // fester Zeitschritt: 60 Physik-Updates pro Sekunde

export const GRAVITY = 880;      // Schwerkraft (Pixel/s²)
export const MOVE_SPEED = 120;   // Laufgeschwindigkeit
export const JUMP_SPEED = 328;   // Sprungkraft (≈ 3,8 Blöcke hoch)
export const MAX_FALL = 360;     // maximale Fallgeschwindigkeit
export const COYOTE_TIME = 0.1;  // so lange darf man nach der Kante noch springen
export const JUMP_BUFFER = 0.12; // Sprung wird kurz "gemerkt", wenn man zu früh drückt
export const START_LIVES = 3;
export const ENEMY_SPEED = 28;
