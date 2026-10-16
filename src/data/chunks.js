// ============================================================
//  CHUNKS – handgebaute Streckenabschnitte, die endlos aneinandergehängt werden
//
//   #  Boden            =  Plattform        ~  Bröckel-Plattform
//   ^  Stacheln         C  Münze            ?  Power-up (Kandidat)
//   E  Läufer-Gegner    J  Springer-Gegner  B  Flieger-Gegner
//   M  bewegte Plattform (waagerecht, 3 breit)
//   V  bewegte Plattform (senkrecht, 3 breit)
//   P  Spieler-Start (nur im Start-Chunk)
//
//  Regeln, damit alles zusammenpasst:
//   - Die Karte wird unten an der Welt ausgerichtet (unterste Zeile = Weltboden)
//   - Erste und letzte Spalte haben Boden in den untersten zwei Zeilen
//   - Sprung: ca. 3 Blöcke hoch, ca. 5 Blöcke weit
//   - difficulty 1–5: ab welcher Stufe der Chunk vorkommen darf
//
//  Prüfen mit:  node tools/check-chunks.mjs
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
  // ---------------- Stufe 1: Grundlagen ----------------
  {
    name: 'luecken', difficulty: 1,
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
    name: 'stacheln', difficulty: 1,
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
    name: 'plattformen', difficulty: 1,
    map: [
      "             ?",
      "            CCC",
      "          =======",
      "",
      "    ====           ====",
      "####                   ####",
      "####                   ####",
    ],
  },
  {
    name: 'gegner', difficulty: 1,
    map: [
      "",
      "            ?",
      "         C  C  C",
      "      E        E",
      "########################",
      "########################",
    ],
  },
  {
    name: 'treppe', difficulty: 1,
    map: [
      "             ?",
      "            CCCC",
      "            ####",
      "        ########",
      "    ############    ^^",
      "########################",
      "########################",
    ],
  },
  {
    name: 'huegel', difficulty: 1,
    map: [
      "          ?",
      "         CCC",
      "",
      "       #######",
      "     ###########",
      "########################",
      "########################",
    ],
  },
  {
    name: 'muenzbogen', difficulty: 1,
    map: [
      "",
      "         CC",
      "       C    C",
      "",
      "########    ########",
      "########    ########",
    ],
  },

  // ---------------- Stufe 2: bewegte Teile ----------------
  {
    name: 'plattform-gegner', difficulty: 2,
    map: [
      "",
      "           CCC",
      "",
      "         E",
      "       =======",
      "",
      "####              ####",
      "####              ####",
    ],
  },
  {
    name: 'faehre', difficulty: 2,
    map: [
      "",
      "",
      "           C C",
      "",
      "     M",
      "",
      "####              ####",
      "####              ####",
    ],
  },
  {
    name: 'stachel-treppe', difficulty: 2,
    map: [
      "",
      "",
      "",
      "           CC",
      "          ####",
      "      ###########^^",
      "   ^^##############  ^^",
      "########################",
      "########################",
    ],
  },
  {
    name: 'springer', difficulty: 2,
    map: [
      "",
      "          ?",
      "      C       C",
      "",
      "     J      J",
      "########################",
      "########################",
    ],
  },
  {
    name: 'inseln', difficulty: 2,
    map: [
      "",
      "     CC     CC     CC",
      "        ?",
      "",
      "###    ###    ###    ###",
      "###    ###    ###    ###",
    ],
  },

  // ---------------- Stufe 3: Luft & Bröckeln ----------------
  {
    name: 'flieger', difficulty: 3,
    map: [
      "",
      "",
      "        B",
      "              B",
      "",
      "   CCC     CCC",
      "########################",
      "########################",
    ],
  },
  {
    name: 'broeckel', difficulty: 3,
    map: [
      "",
      "              ?",
      "            CCC",
      "",
      "      ~~~~   ~~~~",
      "",
      "####                ####",
      "####                ####",
    ],
  },
  {
    name: 'stachel-plattformen', difficulty: 3,
    map: [
      "         ?",
      "",
      "        ===     ===",
      "",
      "    ===     ===     ===",
      "",
      "####^^^^^^^^^^^^^^^^^^^####",
      "###########################",
    ],
  },
  {
    name: 'gegner-gruppe', difficulty: 3,
    map: [
      "",
      "",
      "        CCCCCC",
      "",
      "     E   E   E",
      "########################",
      "########################",
    ],
  },
  {
    name: 'aufzug', difficulty: 3,
    map: [
      "",
      "                 ?",
      "            CCCC",
      "            ########",
      "            ########",
      "     V      ########",
      "            ########",
      "####        ########",
      "####        ########",
    ],
  },

  // ---------------- Stufe 4: Präzision ----------------
  {
    name: 'flieger-luecken', difficulty: 4,
    map: [
      "",
      "",
      "         B         B",
      "",
      "",
      "#####    #####    #####",
      "#####    #####    #####",
    ],
  },
  {
    name: 'trittsteine', difficulty: 4,
    map: [
      "",
      "     C   C   C   C",
      "",
      "     =   =   =   =",
      "",
      "####^^^^^^^^^^^^^^^^####",
      "########################",
    ],
  },
  {
    name: 'broeckel-stacheln', difficulty: 4,
    map: [
      "",
      "",
      "",
      "    ~~~  ~~~  ~~~  ~~~",
      "",
      "####^^^^^^^^^^^^^^^^^^^####",
      "###########################",
    ],
  },
  {
    name: 'springer-plattformen', difficulty: 4,
    map: [
      "",
      "",
      "",
      "         J        J",
      "       =====    =====",
      "",
      "####                    ####",
      "####                    ####",
    ],
  },

  // ---------------- Stufe 5: alles zusammen ----------------
  {
    name: 'chaos', difficulty: 5,
    map: [
      "                ?",
      "         B",
      "                 B",
      "       ~~~    ===",
      "",
      "   ^^      E       ^^",
      "########   #####   #####",
      "########   #####   #####",
    ],
  },
  {
    name: 'luftweg', difficulty: 5,
    map: [
      "",
      "",
      "           B",
      "",
      "    ===    ===",
      "",
      "###               ###",
      "###               ###",
    ],
  },
];
