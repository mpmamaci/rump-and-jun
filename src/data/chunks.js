// ============================================================
//  CHUNKS – handgebaute Streckenabschnitte, die endlos aneinandergehängt werden
//
//   #  Boden            =  Plattform        ~  Bröckel-Plattform
//   ^  Stacheln         C  Münze            ?  Power-up (Kandidat)
//   E  Läufer-Gegner    J  Springer-Gegner  B  Flieger-Gegner
//   D  Sturzflieger (stürzt sich auf den Spieler)
//   *  Sprungfeder (im Boden, schleudert ca. 9 Blöcke hoch)
//   !  Rakete (sehr selten – nur an schwer erreichbaren Stellen verwenden!)
//   M  bewegte Plattform (waagerecht, 3 breit)
//   V  bewegte Plattform (senkrecht, 3 breit)
//   P  Spieler-Start (nur im Start-Chunk)
//
//  Regeln, damit alles zusammenpasst:
//   - Die Karte wird unten an der Welt ausgerichtet (unterste Zeile = Weltboden)
//   - Erste und letzte Spalte haben Boden in den untersten zwei Zeilen
//   - Sprung: ca. 3 Blöcke hoch, ca. 5 Blöcke weit
//   - Wandsprung: zwischen zwei Wänden mit 3 Blöcken Abstand kommt man beliebig hoch
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

// Sichere Landezone nach dem Raketenflug – flach, ohne Gegner
export const LANDING_CHUNK = {
  name: 'landung',
  difficulty: 0,
  map: [
    "",
    "      C C C C C C",
    "",
    "",
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
      "              D",
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
  // ---------------- Erweiterung (M8) ----------------
  {
    name: 'muenzregen', difficulty: 1,
    map: [
      "",
      "   C  C  C  C  C  C",
      "",
      "",
      "     E",
      "######################",
      "######################",
    ],
  },
  {
    name: 'decke', difficulty: 2,
    map: [
      "",
      "",
      "    ################",
      "",
      "",
      "      E       E",
      "########################",
      "########################",
    ],
  },
  {
    name: 'stachel-graben', difficulty: 2,
    map: [
      "",
      "",
      "         CCC",
      "",
      "     ==   ==   ==",
      "",
      "####^^^^^^^^^^^^^^####",
      "######################",
    ],
  },
  {
    name: 'springer-treppe', difficulty: 3,
    map: [
      "",
      "",
      "              J",
      "          ########",
      "      J   ########",
      "      ############",
      "########################",
      "########################",
    ],
  },
  {
    name: 'doppel-faehre', difficulty: 3,
    map: [
      "",
      "",
      "            ?",
      "",
      "    M          M",
      "",
      "###                         ###",
      "###                         ###",
    ],
  },
  {
    name: 'flieger-schwarm', difficulty: 4,
    map: [
      "",
      "      B     B     B",
      "",
      "         B     B",
      "",
      "   C  C  C  C  C  C  C",
      "########################",
      "########################",
    ],
  },
  {
    name: 'finale', difficulty: 5,
    map: [
      "",
      "           B",
      "            ?",
      "",
      "     ~~~   ===   ~~~",
      "",
      "####^^^^^^^^^^^^^^^^^####",
      "#########################",
    ],
  },

  // ---------------- Parkour & Luftkampf (Feedback-Runde) ----------------
  {
    // Zu hohe Wand: nur per Wandsprung im Spalt links davon zu schaffen
    name: 'wandsprung', difficulty: 2,
    map: [
      "",
      "             CCCC",
      "        #   #######",
      "        #   #######",
      "        #   #######",
      "        #   #######",
      "            #######",
      "            #######",
      "########################",
      "########################",
    ],
  },
  {
    // Sprungfeder im Boden schleudert auf die hohe Plattform über dem Abgrund
    name: 'sprungfeder', difficulty: 2,
    map: [
      "         !",
      "        CCCCC",
      "       =======",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "###*#           ########",
      "########################",
    ],
  },
  {
    name: 'sturzflug', difficulty: 2,
    map: [
      "",
      "     D        D",
      "",
      "",
      "   C  C  C  C  C  C",
      "",
      "######################",
      "######################",
    ],
  },
  {
    // Kamin: hoch hinauf per Wandsprung – oben wartet manchmal die Rakete
    name: 'kamin', difficulty: 3,
    map: [
      "              !",
      "                   B",
      "        #   #####",
      "        #   #####",
      "        #   #####",
      "        #   #####",
      "        #   #####",
      "        #   #####",
      "            #####",
      "            #####",
      "######################",
      "######################",
    ],
  },
  {
    // Federsprünge über Stachelfelder
    name: 'feder-stacheln', difficulty: 3,
    map: [
      "",
      "       CCC     CCC",
      "",
      "",
      "",
      "",
      "",
      "",
      "####*^^^^^^^*^^^^^^^####",
      "########################",
    ],
  },
  {
    name: 'luftkampf', difficulty: 4,
    map: [
      "",
      "    D         D",
      "          B",
      "",
      "",
      "#####    ####    #####",
      "#####    ####    #####",
    ],
  },
  {
    // Doppelter Kamin mit Sturzflieger
    name: 'kletterwand', difficulty: 4,
    map: [
      "",
      "      D            CC",
      "                 #####",
      "            #    #####",
      "     #   ####    #####",
      "     #   ####    #####",
      "         ####    #####",
      "         ####    #####",
      "########################",
      "########################",
    ],
  },
];
