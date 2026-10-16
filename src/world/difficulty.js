import { SCROLL_START, SCROLL_MAX, SCROLL_RAMP, TIER_METERS } from '../config.js';

// Stufe 1–5 je nach Strecke (siehe TIER_METERS in config.js)
export function tierAt(meters) {
  let tier = 1;
  for (let i = 1; i < TIER_METERS.length; i++) if (meters >= TIER_METERS[i]) tier = i + 1;
  return tier;
}

// Scroll-Tempo nähert sich weich dem Maximum an: schnell am Anfang, dann immer langsamer
export function scrollSpeedAt(meters) {
  return SCROLL_START + (SCROLL_MAX - SCROLL_START) * (1 - Math.exp(-meters / SCROLL_RAMP));
}

// Gewichtung für die Chunk-Auswahl: Chunks der aktuellen Stufe kommen am häufigsten,
// leichtere bleiben als Verschnaufpause im Mix
export function chunkWeight(chunkDifficulty, tier) {
  if (chunkDifficulty > tier) return 0;
  const below = tier - chunkDifficulty;
  return below === 0 ? 4 : below === 1 ? 2 : 1;
}
