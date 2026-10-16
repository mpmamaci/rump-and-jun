# Jump & Run

Ein 2D-Jump-and-Run im Browser, gebaut mit purem JavaScript und dem HTML5-Canvas. Es hat keine Abhängigkeiten.

## Starten

Das Spiel nutzt ES-Module. Deshalb muss es über einen lokalen Server laufen, ein Doppelklick auf `index.html` reicht nicht:

```bash
python3 -m http.server 8765
```

Danach im Browser <http://localhost:8765> öffnen.

## Steuerung

| Taste | Aktion |
|---|---|
| ← → / A D | laufen |
| Leertaste / W / ↑ | springen (länger halten = höher) |
| R | Neustart |

## Projektstruktur

```
jump-and-run/
├── index.html           Einstiegsseite
├── styles/main.css      Seiten-Design
├── src/
│   ├── main.js          Start, Skalierung, Game Loop
│   ├── game.js          Spielzustand (Auto-Scroll, Punkte, Tod & Neustart)
│   ├── config.js        alle Werte zum Tunen
│   ├── world.js         endlose Welt aus Chunks
│   ├── input.js         Tastatur
│   ├── physics.js       Kollision mit Blöcken
│   ├── renderer.js      zeichnet alles
│   ├── particles.js     Partikeleffekte
│   ├── core/random.js   Seed-Zufall
│   ├── data/chunks.js   Streckenabschnitte als Text-Karten
│   ├── entities/        Spieler, Gegner
│   └── storage/         Rekord (später Leaderboard)
├── assets/              Grafiken, Sounds, Schriften
└── docs/
    ├── PLAN.md          Spielplan & Meilensteine
    └── prototype/       erster Ein-Datei-Prototyp
```

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
