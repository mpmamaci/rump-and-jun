<div align="center">

<img src="assets/icons/icon-192.png" alt="Rump & Jun Icon" width="96" height="96">

# Rump & Jun

**Ein endloses Pixel-Art-Jump-and-Run für den Browser.**
Die Strecke scrollt von selbst, wird immer schneller und hört nie auf. Wie weit kommst du?

[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-e84a5f.svg)](LICENSE)
![Laufzeit-Abhängigkeiten: 0](https://img.shields.io/badge/Abh%C3%A4ngigkeiten-0-38b764.svg)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-ES2022-ffcd75.svg)
![Plattformen](https://img.shields.io/badge/l%C3%A4uft%20auf-Desktop%20%C2%B7%20Handy%20%C2%B7%20Tablet-41a6f6.svg)

<img src="docs/screenshots/title.png" alt="Titelbild" width="720">

</div>

---

## Inhalt

- [Über das Spiel](#über-das-spiel)
- [Screenshots](#screenshots)
- [Schnellstart](#schnellstart)
- [Steuerung](#steuerung)
- [Pixel-Studio & Skins](#pixel-studio--skins)
- [Eigene Streckenabschnitte](#eigene-streckenabschnitte)
- [Veröffentlichen](#veröffentlichen)
- [Technik](#technik)
- [Projektstruktur](#projektstruktur)
- [Lizenz](#lizenz)

## Über das Spiel

Rump & Jun verbindet ein klassisches Jump and Run mit der Endlos-Idee von *The Impossible Game*. Du läufst, springst und kletterst durch eine Welt, die beim Spielen entsteht, während dich der linke Bildrand vor sich hertreibt.

- 🏃 **Endlose Strecke** aus 37 handgebauten Abschnitten in 5 Schwierigkeitsstufen. Das Tempo steigt mit jedem Meter.
- 🧗 **Parkour** mit Wandsprung, Wandrutschen und Sprungfedern.
- 👾 **4 Gegnertypen:** Läufer, Springer, Flieger und Sturzflieger. Dazu kommen bewegte und bröckelnde Plattformen.
- ⚡ **Power-ups:** Doppelsprung, Schild, Zeitlupe und die seltene **Rakete**, die dich unverwundbar über 500 m weit trägt.
- 🌄 **4 Biome**, die alle 500 m wechseln: Wiese, Kristallhöhle, Burg im Abendrot und Sternennacht, jedes mit eigener Musik.
- 🏆 **Punkte** aus Metern, Münzen und Gegner-Kombos, dazu eine lokale **Top-10-Rangliste** im Arcade-Stil.
- 🎚️ **Tempo-Stufen** Normal, Schnell und Turbo mit Punkte-Multiplikator.
- 📱 **Desktop, Handy und Tablet:** Touch-Steuerung, Vollbild und als App auf dem Home-Bildschirm installierbar.
- 🎨 **Alles selbst gemacht:** Pixel-Grafik, Pixel-Schrift, Soundeffekte und Chiptune-Musik entstehen im Projekt selbst. Es werden keine fremden Assets geladen.

## Screenshots

<table>
  <tr>
    <td><img src="docs/screenshots/cave.png" alt="Kristallhöhle mit Kombo und Schild"></td>
    <td><img src="docs/screenshots/rocket.png" alt="Raketenflug in der Sternennacht"></td>
  </tr>
  <tr>
    <td align="center"><sub>Kristallhöhle: Kombo und Schild</sub></td>
    <td align="center"><sub>Raketenflug durch die Sternennacht</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/castle.png" alt="Burg im Abendrot"></td>
    <td><img src="docs/screenshots/title.png" alt="Titelbild"></td>
  </tr>
  <tr>
    <td align="center"><sub>Burg im Abendrot mit Doppelsprung</sub></td>
    <td align="center"><sub>Titelbild</sub></td>
  </tr>
</table>

## Schnellstart

Voraussetzung ist [Node.js](https://nodejs.org) ab Version 18. Zum Spielen und Entwickeln werden keine weiteren Pakete benötigt.

```bash
git clone https://github.com/mpmamaci/rump-and-jun.git
cd rump-and-jun
npm run dev
```

| Was | Adresse |
|---|---|
| Spiel | <http://localhost:8765> |
| Pixel-Studio | <http://localhost:8765/tools/pixel-studio/> |

**Auf Handy oder Tablet testen:** Mit `npm run dev:lan` ist der Server auch im eigenen WLAN erreichbar. Er zeigt beim Start die passenden Adressen an. Nutze diesen Modus nur im Heimnetz, denn dort kann jeder im WLAN Skins speichern.

### Alle Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server mit Spiel und Pixel-Studio (nur lokal) |
| `npm run dev:lan` | wie `dev`, aber im Heimnetz erreichbar |
| `npm run check` | prüft alle Streckenabschnitte auf Fehler |
| `npm run build` | baut die minifizierte Version für den Webspace nach `dist/` |
| `npm run icons` | erzeugt die App-Symbole aus dem Spieler-Sprite |

## Steuerung

| Tastatur | Aktion |
|---|---|
| <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> | laufen |
| <kbd>Leertaste</kbd> / <kbd>W</kbd> / <kbd>↑</kbd> | springen (länger halten = höher). An einer Wand: Wandsprung |
| <kbd>Esc</kbd> / <kbd>P</kbd> | Pause |
| <kbd>F</kbd> | Vollbild |
| <kbd>R</kbd> | Neustart |
| <kbd>M</kbd> | Ton an/aus |

**Handy & Tablet:**
- Buttons zum Laufen, Springen und Pausieren. Sie liegen neben dem Spielbild und verdecken die Figur nicht. In den Einstellungen kannst du sie auf „überlagert“ umstellen, dann wird das Bild größer.
- Auf Android, dem iPad und am Desktop gibt es echtes Vollbild.
- Auf dem **iPhone** geht es über *Teilen → Zum Home-Bildschirm*. Dann startet das Spiel als App ohne Browserleisten.

## Pixel-Studio & Skins

Das Pixel-Studio (`tools/pixel-studio/`) ist ein eigenes kleines Werkzeug für Grafiken. Es funktioniert auch auf dem iPad mit dem Apple Pencil.

1. **Skizzieren:** frei zeichnen oder ein Foto einer Papierzeichnung laden.
2. **Umwandeln:** Die Skizze wird automatisch auf die Sprite-Größe heruntergerechnet und auf die 24-Farben-Spielpalette reduziert, auf Wunsch mit Kontur.
3. **Nachbessern:** einzelne Pixel setzen, Frames und Animationen anlegen, mit Zwiebelhaut und Live-Vorschau.
4. **Speichern** in einen **Skin**.

Die Standardgrafiken in `assets/sprites/` sind **geschützt**. Ein Skin unter `assets/skins/<name>/` enthält nur die Sprites, die er verändert. Im Spiel wählst du den Skin unter *Einstellungen → Skin*, und `STANDARD` stellt jederzeit alles wieder her. Einzelne Sprites setzt du im Studio mit „↺ Standard wiederherstellen“ zurück.

Sprites werden als lesbares JSON gespeichert, eine Pixelreihe pro Zeile mit einem Paletten-Zeichen pro Pixel. So bleiben Änderungen auch in `git diff` gut nachvollziehbar.

## Eigene Streckenabschnitte

Die Welt wird endlos aus **Chunks** in `src/data/chunks.js` zusammengesetzt. Jedes Zeichen ist ein Block mit 16 × 16 Pixeln, und 1 Block entspricht 1 Meter.

```js
{
  name: 'wandsprung', difficulty: 2,
  map: [
    "",
    "             CCCC",
    "        #   #######",
    "        #   #######",
    "            #######",
    "########################",
    "########################",
  ],
},
```

| Zeichen | Bedeutung | Zeichen | Bedeutung |
|---|---|---|---|
| `#` | Boden | `E` | Läufer |
| `=` | Plattform | `J` | Springer |
| `~` | Bröckel-Plattform | `B` | Flieger |
| `^` | Stacheln | `D` | Sturzflieger |
| `*` | Sprungfeder | `M` / `V` | bewegte Plattform (waagerecht/senkrecht) |
| `C` | Münze | `?` | Power-up-Platz |
| `P` | Spieler-Start | `!` | Raketen-Platz (selten, ab Stufe 2) |

**Regeln:** Die Karte wird unten an der Welt ausgerichtet. Die erste und die letzte Spalte brauchen Boden in den untersten zwei Zeilen. `npm run check` prüft das automatisch.

## Veröffentlichen

```bash
npm install     # einmalig: installiert das Build-Werkzeug esbuild
npm run build
```

Danach den **Inhalt** von `dist/` auf einen beliebigen statischen Webspace hochladen. Ein Server-Programm ist nicht nötig.

Der Build
- bündelt und minifiziert JavaScript, CSS und HTML,
- verkleinert alle Sprites, Skins und die Schrift,
- versieht Dateinamen mit einem Inhalts-Hash, damit nach Updates kein alter Cache stört,
- lässt Pixel-Studio, Dev-Server und Dokumentation weg.

> Per Doppelklick auf `index.html` startet das Spiel nicht. Browser laden ES-Module nur über `http(s)://`.

## Technik

- **Vanilla JavaScript (ES-Module) und Canvas 2D.** Kein Framework, keine Laufzeit-Abhängigkeiten.
- **Pixelgenaues Rendering:** Das Spiel rendert intern mit 480 × 270 Pixeln und wird am Desktop ganzzahlig in Gerätepixeln hochskaliert.
- **Fester Zeitschritt** mit 60 Updates pro Sekunde, damit die Physik auf jedem Gerät gleich läuft. Das ist wichtig für faire Highscores.
- **Seed-basierter Generator** (Mulberry32): Die Chunks werden nach Schwierigkeit gewichtet ausgewählt, und ein Seed erzeugt immer dieselbe Strecke.
- **Audio-Synthese** über die Web-Audio-API: Oszillatoren und Rauschen für alle Effekte, dazu ein Chiptune-Sequencer mit Lookahead-Planung, dessen Tempo mitwächst.
- **Sprites als Daten:** Die 24-Farben-Palette mit einem Zeichen pro Farbe macht Biom-Umfärbungen per Paletten-Remap möglich.
- **Leaderboard-Schnittstelle:** `LocalStore` speichert im Browser, ein `ServerStore` lässt sich später ohne Umbau ergänzen.
- **Eigene Werkzeuge ohne Zusatzpakete:** Dev-Server, Chunk-Prüfung und ein PNG-Encoder für die App-Symbole.

## Projektstruktur

```
rump-and-jun/
├── index.html               Einstiegsseite
├── manifest.webmanifest     Web-App-Manifest (Home-Bildschirm, Vollbild)
├── styles/main.css          Seiten- und Touch-Layout
├── src/
│   ├── main.js              Start, Skalierung, Game Loop
│   ├── game.js              Spielzustand, Menüs, Power-ups, Rakete
│   ├── config.js            alle Werte zum Feintunen
│   ├── core/                Seed-Zufall
│   ├── world/               endlose Welt, Schwierigkeitskurve
│   ├── entities/            Spieler, Gegner, Plattformen, Power-ups
│   ├── render/              Renderer, Sprite-Loader, Pixel-Schrift
│   ├── audio/               Synthesizer und Musik-Sequencer
│   ├── ui/                  Menüs, Touch, Vollbild
│   ├── data/                Chunks, Palette, Biome, Songs
│   └── storage/             Rekord, Rangliste, Einstellungen
├── assets/
│   ├── sprites/             Standardgrafiken (geschützt)
│   ├── skins/               eigene Skins aus dem Pixel-Studio
│   ├── fonts/               5 × 7-Pixel-Schrift
│   └── icons/               App-Symbole
├── tools/
│   ├── dev-server.mjs       Dev-Server mit Speicher-API fürs Studio
│   ├── pixel-studio/        Skizze → Pixel-Art → Animation → Skin
│   ├── build.mjs            Build für den Webspace
│   ├── check-chunks.mjs     Prüfung aller Streckenabschnitte
│   └── make-icons.mjs       App-Symbole aus dem Spieler-Sprite
└── docs/
    ├── PLAN.md              Spielplan und Meilensteine
    ├── screenshots/
    └── prototype/           erster Ein-Datei-Prototyp
```

## Lizenz

Veröffentlicht unter der [MIT-Lizenz](LICENSE). © 2026 mpmamaci
