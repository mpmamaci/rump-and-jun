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
│   ├── main.js          Start + Game Loop
│   ├── game.js          Spielzustand (Punkte, Leben, Kamera)
│   ├── config.js        Physik- und Spielwerte zum Tunen
│   ├── input.js         Tastatur
│   ├── physics.js       Kollision mit Blöcken
│   ├── world.js         baut die Welt aus einem Level
│   ├── renderer.js      zeichnet alles
│   ├── particles.js     Partikeleffekte
│   ├── entities/        Spieler, Gegner
│   └── levels/          Level als Text-Karten
├── assets/              Grafiken, Sounds, Schriften
└── docs/prototype/      erster Ein-Datei-Prototyp
```

## Level bauen

Ein Level besteht aus Textzeilen in `src/levels/`. Jedes Zeichen ist ein Block mit 40×40 Pixeln:

| Zeichen | Bedeutung |
|---|---|
| `#` | Boden |
| `=` | Plattform |
| `^` | Stacheln |
| `C` | Münze |
| `E` | Gegner |
| `P` | Spieler-Start |
| `F` | Zielflagge |
