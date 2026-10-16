# Spielplan: Endless Jump & Run

> Lebendes Dokument. Wir passen es gemeinsam an, wenn sich Ideen ändern.

## 1. Vision

Ein klassisches Pixel-Art-Jump-and-Run mit Laufen, Springen, Gegnern und Power-ups, aber **ohne feste Level**.
Von *The Impossible Game* übernehmen wir die Grundidee:

- **Auto-Scroll**: Der Bildschirm läuft von selbst nach rechts. Wer zurückbleibt, verliert.
- **Endlos**: Die Strecke wird beim Spielen erzeugt und endet nie.
- **Wird immer schwerer**: schneller, enger, gemeinere Gegner.
- **Sofort-Tod und Sofort-Neustart**: ein Fehler beendet den Lauf, und nach weniger als 1 Sekunde läuft der nächste.
- **Highscore und Leaderboard**: Ziel ist, sich selbst zu schlagen.

Grundregel: **Alle Assets machen wir selbst.** Grafik, Schrift, Sound und Musik kommen nicht aus dem Netz.

---

## 2. Kernmechanik

| Element | Verhalten |
|---|---|
| Kamera | scrollt automatisch mit der Geschwindigkeit `scrollSpeed` nach rechts |
| Spieler | läuft frei links und rechts innerhalb des Bildes und springt (variable Sprunghöhe, Coyote Time, Jump Buffer) |
| Linker Bildrand | „Todeswand“: Wer vom Rand eingeholt wird, stirbt |
| Tod durch | Stacheln, Gegner von der Seite, Abgrund, linker Rand |
| Gegner besiegen | von oben draufspringen |
| Neustart | Taste drücken oder automatisch nach ca. 0,7 s, ohne Ladebildschirm |

Der Spieler kann also nach vorne preschen, um Zeit zu gewinnen. Er kann sich aber nie ausruhen.

---

## 3. Endlos-Strecke (Chunk-System)

Die Strecke besteht aus **Chunks**. Das sind handgebaute Abschnitte mit 16 bis 32 Blöcken Breite, in derselben Textform wie unser jetziges Level.

```
Chunk = { name, difficulty: 1–5, tags: ['gap','enemy','platforms'], map: [...Textzeilen] }
```

- Jeder Chunk **beginnt und endet auf Bodenhöhe**. So passen alle Chunks aneinander und jeder ist garantiert schaffbar.
- Ein Generator wählt den nächsten Chunk zufällig, gewichtet nach der aktuellen Schwierigkeit.
- Es gibt **keine Wiederholung** desselben Chunks direkt hintereinander.
- Der Generator nutzt einen **Seed-Zufall**. Gleicher Seed ergibt die gleiche Strecke, das ist nützlich für „Tages-Challenge“ und faire Online-Ranglisten später.
- Ziel für Version 1 sind **ca. 30 Chunks**, die wir gemeinsam designen.

## 4. Schwierigkeitskurve

Die Schwierigkeit hängt von der gelaufenen Strecke ab:

| Strecke | Scroll-Tempo | Chunk-Schwierigkeit | Neu dazu |
|---|---|---|---|
| 0–300 m | langsam | 1 | Lücken, Stacheln, Läufer-Gegner |
| 300–800 m | mittel | 1–2 | bewegliche Plattformen |
| 800–1500 m | schneller | 2–3 | Springer-Gegner, längere Lücken |
| 1500–3000 m | schnell | 3–4 | Flieger-Gegner, bröckelnde Plattformen |
| 3000 m+ | steigt weiter bis zum Maximum | 4–5 | Kombinationen von allem |

- Alle **500 m** gibt es einen **Zonenwechsel** mit neuen Farben bzw. neuem Biom (Wiese → Höhle → Burg → Nacht …). So spürt man den Fortschritt.
- Alle Zahlen stehen zentral in `config.js` und lassen sich leicht feintunen.

## 5. Power-ups (Version 1)

| Power-up | Wirkung | Dauer |
|---|---|---|
| **Doppelsprung** | ein zusätzlicher Sprung in der Luft | 15 s |
| **Schild** | übersteht genau einen tödlichen Treffer (außer Abgrund und linker Rand) | bis zum Treffer |
| **Zeitlupe** | Auto-Scroll und Gegner werden 40 % langsamer | 5 s |

- Power-ups erscheinen selten in Chunks, auf festen Positionen, die als Kandidaten markiert sind (Zeichen `?` in der Karte).
- Eine Anzeige im HUD zeigt das aktive Power-up mit Restzeit.

## 6. Punkte & Highscore

```
Punkte = Meter × 1  +  Münzen × 10  +  Gegner × 50 × Kombo
```

- **Kombo**: Gegner hintereinander besiegen, ohne den Boden zu berühren, ergibt ×2, ×3, ×4 …
- **HUD**: Punkte, Meter, aktuelle Kombo, aktives Power-up
- **Game-Over-Bildschirm**: Punkte, Meter, persönlicher Rekord, „NEU!“-Hinweis

## 7. Leaderboard

- **Jetzt: lokal** im Browser (`localStorage`), Top 10
- Eintrag: **3 Buchstaben** im Arcade-Stil, Punkte, Meter, Datum
- Im Code steckt das hinter einer Schnittstelle:
  ```
  LeaderboardStore { load(), submit(entry) }
   ├─ LocalStore    ← jetzt
   └─ ServerStore   ← später, ohne Umbau des Spiels
  ```

## 8. Steuerung

| Gerät | Laufen | Springen | Pause |
|---|---|---|---|
| Tastatur | ← → / A D | Leertaste / W / ↑ | Esc / P |
| Handy | Touch-Buttons links | Touch-Button rechts | Pause-Symbol |

Gamepad-Unterstützung kann später dazukommen.

---

## 9. Assets: alles selbst gemacht

### 9.1 Pixel-Studio (eigenes Tool)

Ein kleines, leichtes Werkzeug unter `tools/pixel-studio/`:

1. **Skizzieren**: Du zeichnest frei mit Maus, Trackpad oder Finger auf einer großen Fläche.
2. **Umwandeln**: Das Tool rechnet die Skizze in echte Pixel-Art um:
   - herunterrechnen auf die Zielgröße (z. B. 16×16 oder 32×32)
   - Farben auf **unsere Spielpalette** reduzieren
   - optional eine automatische dunkle Kontur
3. **Nachbessern**: einzelne Pixel im Raster setzen oder löschen
4. **Animation**: mehrere Frames (z. B. Lauf-Animation) mit Vorschau
5. **Speichern**: direkt ins Projekt nach `assets/sprites/` (PNG + JSON). Dafür sorgt ein kleiner lokaler Dev-Server mit Speicher-Funktion, ohne Umweg über den Downloads-Ordner.

### 9.2 Spielpalette

Wir legen eine feste Palette mit **ca. 24 Farben** fest. Alle Sprites nutzen nur diese Farben, damit das Spiel einheitlich aussieht.

### 9.3 Sprite-Liste (Version 1)

| Was | Größe | Frames |
|---|---|---|
| Spieler | 16×16 | stehen, laufen (4), springen, fallen, sterben |
| Läufer-Gegner | 16×16 | laufen (2), zerquetscht |
| Springer-Gegner | 16×16 | stehen, springen |
| Flieger-Gegner | 16×16 | fliegen (2) |
| Boden, Plattform, Stacheln | 16×16 | je Biom eine Variante |
| Münze | 8×8 | drehen (4) |
| Power-up-Symbole | 16×16 | 3 Stück |
| Hintergrund-Ebenen (Parallax) | breite Streifen | je Biom |
| Pixel-Schrift | 5×7 pro Zeichen | A–Z, 0–9, Satzzeichen |

### 9.4 Schrift

Wir machen eine **eigene Pixel-Schrift**, die ebenfalls im Pixel-Studio entsteht. Die Google-Schrift im aktuellen `index.html` fliegt raus.

### 9.5 Sound & Musik (per Code)

Alles entsteht live mit der **Web-Audio-API**, ohne Audiodateien:

- **Effekte**: Sprung, Münze, Gegner besiegt, Power-up, Schild bricht, Tod, neuer Rekord
- **Musik**: ein kleiner Chiptune-Sequencer. **Das Tempo steigt mit der Scroll-Geschwindigkeit.**
- Mehrere Musikmuster, die mit dem Zonenwechsel wechseln
- Ein Stumm-Schalter, der gespeichert wird

---

## 10. Technik

- Weiter **reines JavaScript mit ES-Modulen**, ohne Frameworks und ohne Abhängigkeiten
- **Pixel-perfekte Darstellung**: Das Spiel rendert intern in niedriger Auflösung (z. B. **480×270**) und wird ganzzahlig hochskaliert
- Blockgröße wird **16 px** (passend zu den Pixel-Sprites)
- **Fester Zeitschritt** (60 Updates/s), damit die Physik auf jedem Gerät gleich ist. Das ist wichtig für faire Highscores.
- Spielzustände: `Titel → Spiel → Pause → Game Over → Leaderboard`

Geplante Struktur:

```
src/
├── core/        Loop, Zustände, Input (Tastatur + Touch), Seed-Zufall
├── world/       Chunk-Generator, Schwierigkeit, Kamera
├── entities/    Spieler, Gegner, Power-ups, Münzen
├── render/      Sprites, Animation, Pixel-Schrift, Parallax, Partikel
├── audio/       Synth, Effekte, Musik-Sequencer
├── ui/          HUD, Menüs, Game Over, Leaderboard
├── data/        Chunks, Palette, Konstanten
└── storage/     LeaderboardStore (Local, später Server)
tools/
└── pixel-studio/
assets/
└── sprites/     von uns erstellte PNG + JSON
```

---

## 11. Meilensteine

| # | Meilenstein | Ergebnis | Status |
|---|---|---|---|
| **M0** | Aufräumen | Prototyp nach `docs/prototype/`, Google-Schrift raus, niedrige Auflösung + Skalierung, fester Zeitschritt | ✅ |
| **M1** | Runner-Kern | Auto-Scroll, Todeswand, Chunk-System mit 5 Chunks, Meter-Anzeige, Sofort-Neustart, **erstmals spielbar als Endlos-Runner** | ✅ |
| **M2** | Schwierigkeit | Tempo-Kurve, 15+ Chunks, Springer- und Flieger-Gegner | ✅ |
| **M3** | Pixel-Studio | Tool fertig, Palette festgelegt, erste eigene Sprites (Spieler, Boden) im Spiel | ✅ |
| **M4** | Power-ups | Doppelsprung, Schild, Zeitlupe inkl. HUD-Anzeige | ✅ |
| **M5** | Punkte & Leaderboard | Kombo, Game-Over-Screen, Initialen-Eingabe, lokale Top 10 | ✅ |
| **M6** | Audio | Soundeffekte und mitwachsende Chiptune-Musik | ✅ |
| **M7** | Handy & Menüs | Touch-Steuerung, Titelbild, Pause, Einstellungen | ✅ |
| **M8** | Feinschliff | Biome, Screen-Shake, mehr Partikel, restliche Sprites, 30 Chunks | ✅ |

**Erste Demo fertig (Stand 16.10.2026).** Alle Meilensteine M0–M8 sind umgesetzt.

**Später:** Server-Leaderboard, Tages-Challenge (gleicher Seed für alle), Gamepad, weitere Power-ups (z. B. Münz-Magnet).

---

## 12. Offene Fragen

- Name des Spiels?
- Wie sieht die Spielfigur aus?
- Welche Biome und in welcher Reihenfolge?
- Soll man Münzen später für etwas ausgeben können, z. B. Skins?
