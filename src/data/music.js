// ============================================================
//  MUSIK – unsere Chiptune-Songs als Daten.
//  Jeder Song hat 4 Akkorde (1 Takt pro Akkord, 16 Schritte pro Takt).
//
//  chords: [Grundton als MIDI-Nummer, 'maj' | 'min']   (60 = C4)
//  lead:   pro Schritt ein Akkordton-Index (0 = Grundton, 1 = Terz, 2 = Quinte,
//          3 = Grundton eine Oktave höher …), -1 = Pause
//  bass:   pro Schritt 0 = Grundton, 1 = Oktave höher, -1 = Pause
//  drums:  pro Schritt 'K' Kick, 'S' Snare, 'h' Hi-Hat, '.' nichts
// ============================================================
export const SONGS = [
  {
    name: 'Wiese',
    chords: [[60, 'maj'], [57, 'min'], [53, 'maj'], [55, 'maj']],
    lead:  [0, 2, 4, 2, 3, 2, 4, 5, 0, 2, 4, 2, 3, 5, 4, 2],
    bass:  [0, -1, 1, -1, 0, -1, 1, -1, 0, -1, 1, -1, 0, -1, 1, 1],
    drums: 'K.h.S.h.K.h.S.hh',
  },
  {
    name: 'Höhle',
    chords: [[57, 'min'], [53, 'maj'], [60, 'maj'], [52, 'maj']],
    lead:  [0, -1, 2, -1, 4, -1, 2, 3, -1, 2, -1, 1, 0, -1, -1, -1],
    bass:  [0, 0, -1, 0, 1, -1, 0, -1, 0, 0, -1, 0, 1, -1, 1, -1],
    drums: 'K..hS..hK.KhS..h',
  },
  {
    name: 'Burg',
    chords: [[62, 'min'], [58, 'maj'], [60, 'maj'], [57, 'maj']],
    lead:  [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 5, 4, 3, 2],
    bass:  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    drums: 'KhhhShhhKhKhShhh',
  },
  {
    name: 'Nacht',
    chords: [[52, 'min'], [48, 'maj'], [55, 'maj'], [50, 'maj']],
    lead:  [4, -1, 3, -1, 2, -1, 0, -1, 2, 3, 4, 5, 4, -1, 2, -1],
    bass:  [0, -1, -1, 0, -1, -1, 1, -1, 0, -1, -1, 0, -1, 1, -1, 1],
    drums: 'K.h.S.hKK.h.S.h.',
  },
];
