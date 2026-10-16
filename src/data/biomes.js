import { PALETTE as C } from './palette.js';

// ============================================================
//  BIOME – alle 500 m wechselt die Umgebung (Namen: src/i18n.js unter biome.*).
//  sky:       Farbstreifen von oben nach unten
//  far/near:  Farben der beiden Hügel-Ebenen
//  cloud:     Wolkenfarbe (null = keine Wolken)
//  tileRemap: färbt die Block-Sprites um (Paletten-Zeichen → Paletten-Zeichen)
// ============================================================
export const BIOMES = [
  {
    key: 'wiese',
    sky: [C.c, C.c, C.c, C.a], cloud: C.w, far: C.t, near: C.g,
    tileRemap: null,
  },
  {
    key: 'hoehle',
    sky: [C.k, C.k, C.d, C.d], cloud: null, far: C.n, near: C.p,
    tileRemap: { l: 'a', g: 't', u: 'm', e: 'd', h: 's', r: 'm', x: 's', p: 'd' },
    crystals: true,
  },
  {
    key: 'burg',
    sky: [C.p, C.v, C.r, C.o], cloud: C.i, far: C.p, near: C.e,
    tileRemap: { l: 's', g: 'm', u: 'd', e: 'k', h: 'm' },
  },
  {
    key: 'nacht',
    sky: [C.k, C.n, C.n, C.b], cloud: C.d, far: C.n, near: C.k,
    tileRemap: { l: 'g', g: 't', u: 'e', h: 'u' },
    stars: true,
  },
];

export const biomeForZone = zone => BIOMES[zone % BIOMES.length];
