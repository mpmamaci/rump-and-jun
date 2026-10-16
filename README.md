# Jump & Run

Ein 2D-Jump-and-Run im Browser, gebaut mit purem JavaScript und dem HTML5-Canvas. Es hat keine Abhängigkeiten.

## Starten

Du brauchst nur [Node.js](https://nodejs.org) und keine weiteren Pakete:

```bash
npm run dev
```

| Was | Adresse |
|---|---|
| Spiel | <http://localhost:8765> |
| Pixel-Studio | <http://localhost:8765/tools/pixel-studio/> |

## Steuerung

| Taste | Aktion |
|---|---|
| ← → / A D | laufen |
| Leertaste / W / ↑ | springen (länger halten = höher) |
| R | Neustart |

## Projektstruktur

```
jump-and-run/
├── index.html             Einstiegsseite
├── styles/main.css        Seiten-Design
├── src/
│   ├── main.js            Start, Skalierung, Game Loop
│   ├── game.js            Spielzustand (Auto-Scroll, Punkte, Tod & Neustart)
│   ├── config.js          alle Werte zum Tunen
│   ├── input.js           Tastatur
│   ├── physics.js         Kollision mit Blöcken
│   ├── particles.js       Partikeleffekte
│   ├── core/              Seed-Zufall
│   ├── world/             endlose Welt, Schwierigkeit
│   ├── entities/          Spieler, Gegner, Plattformen
│   ├── render/            Renderer, Sprite-Loader, Pixel-Schrift
│   ├── data/              Chunks, Farbpalette
│   └── storage/           Rekord (später Leaderboard)
├── assets/
│   ├── sprites/           unsere Pixel-Grafiken (JSON, eine Zeile pro Pixelreihe)
│   └── fonts/             unsere 5×7-Pixel-Schrift
├── tools/
│   ├── dev-server.mjs     lokaler Server mit Speicher-Funktion fürs Pixel-Studio
│   ├── pixel-studio/      Skizze → Pixel-Art → Animation → Speichern
│   └── check-chunks.mjs   prüft alle Chunks (npm run check)
└── docs/
    ├── PLAN.md            Spielplan & Meilensteine
    └── prototype/         erster Ein-Datei-Prototyp
```

## Eigene Grafiken (Pixel-Studio)

1. `npm run dev` starten und das Pixel-Studio öffnen.
2. Ein vorhandenes Sprite laden (z. B. `player`) oder ein neues anlegen.
3. **Skizze**: frei zeichnen oder ein Foto einer Papierzeichnung laden.
4. **In Pixel umwandeln**: Die Skizze wird auf die Sprite-Größe heruntergerechnet und auf unsere 24-Farben-Palette reduziert, auf Wunsch mit dunkler Kontur.
5. Pixel nachbessern und weitere Frames bzw. Animationen anlegen.
6. **Speichern** legt die Datei unter `assets/sprites/<name>.json` ab. Danach das Spiel neu laden.

Die Palette steht in `src/data/palette.js`. Jede Farbe hat ein Zeichen, `.` ist durchsichtig.

## Chunks bauen

Die Strecke wird endlos aus **Chunks** zusammengesetzt, das sind Abschnitte in `src/data/chunks.js`.
Jedes Zeichen ist ein Block mit 16×16 Pixeln (1 Block = 1 Meter):

| Zeichen | Bedeutung |
|---|---|
| `#` | Boden |
| `=` | Plattform |
| `^` | Stacheln |
| `C` | Münze |
| `E` | Gegner |
| `P` | Spieler-Start (nur im Start-Chunk) |

Regeln: Die Karte wird unten ausgerichtet. Die erste und die letzte Spalte brauchen Boden in den untersten zwei Zeilen.
