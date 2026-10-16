// ============================================================
//  CHUNKS – handgebaute Streckenabschnitte, die endlos aneinandergehängt werden
//
//   #  Boden        =  Plattform     ^  Stacheln
//   C  Münze        E  Gegner        P  Spieler-Start (nur im Start-Chunk)
//
//  Regeln, damit alles zusammenpasst:
//   - Die Karte wird unten an der Welt ausgerichtet (unterste Zeile = Weltboden)
//   - Erste und letzte Spalte haben Boden in den untersten zwei Zeilen
//   - Sprung: ca. 3 Blöcke hoch, ca. 5 Blöcke weit
// ============================================================

export const START_CHUNK = {
  name: 'start',
  difficulty: 0,
  map: [
    "",
    "",
    "",
    "    P",
    "##############################",
    "##############################",
  ],
};

export const CHUNKS = [
  {
    name: 'luecken',
    difficulty: 1,
    map: [
      "",
      "      CC          CC",
      "",
      "",
      "#####   ########   #####",
      "#####   ########   #####",
    ],
  },
  {
    name: 'stacheln',
    difficulty: 1,
    map: [
      "",
      "      C          C",
      "",
      "     ^^        ^^^",
      "######################",
      "######################",
    ],
  },
  {
    name: 'plattformen',
    difficulty: 1,
    map: [
      "",
      "            CCC",
      "          =======",
      "",
      "    ====           ====",
      "####                   ####",
      "####                   ####",
    ],
  },
  {
    name: 'gegner',
    difficulty: 1,
    map: [
      "",
      "",
      "         C  C  C",
      "      E        E",
      "########################",
      "########################",
    ],
  },
  {
    name: 'treppe',
    difficulty: 1,
    map: [
      "",
      "            CCCC",
      "            ####",
      "        ########",
      "    ############    ^^",
      "########################",
      "########################",
    ],
  },
];
