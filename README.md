# Jump & Run

Ein endloses Pixel-Art-Jump-and-Run im Browser, gebaut mit purem JavaScript und dem HTML5-Canvas.
Die Strecke scrollt automatisch und wird immer schneller und schwerer. Wie weit kommst du?

**Alles ist selbst gemacht:** Grafiken, Schrift, Soundeffekte und Musik entstehen im Projekt selbst und kommen nicht aus dem Netz. Das Spiel hat keine Abhängigkeiten. Nur zum Bauen der Webspace-Version wird das Werkzeug esbuild genutzt.

## Features

- Endlose Strecke aus 30 handgebauten Chunks in 5 Schwierigkeitsstufen
- Auto-Scroll mit steigendem Tempo, der linke Bildrand ist tödlich
- 3 Gegnertypen (Läufer, Springer, Flieger), bewegte und bröckelnde Plattformen
- Power-ups: Doppelsprung, Schild, Zeitlupe
- Punkte aus Metern, Münzen und Gegner-Kombos, dazu eine lokale Top-10-Rangliste
- 4 Biome, die alle 500 m wechseln, jedes mit eigener Musik
- Chiptune-Musik und Effekte live per Web-Audio-API, das Tempo wächst mit
- Läuft am Desktop (Tastatur) und auf dem Handy (Touch-Buttons)
- Pixel-Studio: Skizze zeichnen, daraus Pixel-Art machen und als Sprite speichern

## Starten

Zum Entwickeln brauchst du nur [Node.js](https://nodejs.org), keine weiteren Pakete:

```bash
npm run dev
```

| Was | Adresse |
|---|---|
| Spiel | <http://localhost:8765> |
| Pixel-Studio | <http://localhost:8765/tools/pixel-studio/> |

### Auf Handy oder iPad testen

```bash
npm run dev:lan
```

Der Server zeigt dann die Adressen im Heimnetz an, zum Beispiel `http://192.168.178.23:8765`. Diese öffnest du auf dem Handy oder iPad im **selben WLAN**.

- Beim ersten Start fragt macOS eventuell, ob `node` eingehende Verbindungen annehmen darf. Erlaube das.
- Im Netzwerk-Modus kann jeder im selben WLAN das Spiel öffnen und Skins speichern. Nutze ihn deshalb nur zu Hause und nicht in öffentlichen WLANs.
- Das Pixel-Studio funktioniert auf dem iPad mit Finger und Apple Pencil.

## Veröffentlichen (statischer Webspace)

```bash
npm install      # einmalig: holt das Build-Werkzeug esbuild
npm run build
```

Der Befehl erzeugt den Ordner `dist/` mit einer minifizierten Version des Spiels:

- Das ganze JavaScript liegt gebündelt in einer Datei, dazu kommen minifiziertes CSS und HTML.
- Sprites, Schrift und **alle Skins** sind als kompakte JSON-Dateien dabei.
- Die Dateinamen enthalten einen Inhalts-Hash, damit Browser nach einem Update die neue Version laden.
- Pixel-Studio, Dev-Server und Dokumentation sind nicht enthalten.
- Vorher werden automatisch alle Chunks geprüft.

Danach lädst du den **Inhalt** von `dist/` per FTP oder über das Tool deines Hosters auf den Webspace hoch. Es wird kein Server-Programm gebraucht, jeder normale Webspace reicht.

**Ablauf bei Änderungen:** lokal mit `npm run dev` arbeiten (Code, Chunks, Skins im Pixel-Studio), dann `npm run build` und `dist/` erneut hochladen. Alte `game-…js`- und `style-…css`-Dateien auf dem Webspace kannst du dabei löschen.

Hinweis: Per Doppelklick auf `index.html` läuft das Spiel nicht. Browser laden ohne Webserver keine Module und Dateien.

## Steuerung

| Taste | Aktion |
|---|---|
| ← → / A D | laufen |
| Leertaste / W / ↑ | springen (länger halten = höher) |
| Esc / P | Pause |
| F | Vollbild |
| R | Neustart |
| M | Ton an/aus |

### Handy & Tablet

- **Steuerung:** ‹ › zum Laufen, ⌃ zum Springen und II für die Pause. Menüpunkte lassen sich antippen.
- **Tasten-Anordnung:** Standardmäßig liegen die Buttons **neben** dem Spielbild (im Hochformat darunter) und verdecken nie die Spielfigur. Unter *Einstellungen → Tasten* kannst du auf **überlagert** umstellen. Dann wird das Bild größer und die Buttons liegen halbdurchsichtig darüber.
- **Vollbild:** über den Button ⛶ oder *Einstellungen → Vollbild*, am Desktop mit der Taste **F**. Das funktioniert auf Android, auf dem iPad und am Desktop.
- **iPhone:** Safari erlaubt Webseiten kein Vollbild. Tippe stattdessen auf *Teilen → Zum Home-Bildschirm* und starte das Spiel über das neue Symbol, dann läuft es wie eine App ohne Browserleisten. Das Spiel zeigt diesen Hinweis auch selbst an.

Das App-Symbol wird aus dem Spieler-Sprite erzeugt (`npm run icons` → `assets/icons/`).

## Projektstruktur

```
jump-and-run/
├── index.html             Einstiegsseite
├── styles/main.css        Seiten-Design
├── src/
│   ├── main.js            Start, Skalierung, Game Loop
│   ├── game.js            Spielzustand (Auto-Scroll, Punkte, Tod & Neustart)
│   ├── config.js          alle Werte zum Tunen
│   ├── input.js           Tastatur (+ virtuelle Tasten für Touch)
│   ├── physics.js         Kollision mit Blöcken
│   ├── particles.js       Partikeleffekte
│   ├── core/              Seed-Zufall
│   ├── world/             endlose Welt, Schwierigkeit
│   ├── entities/          Spieler, Gegner, Plattformen
│   ├── render/            Renderer, Sprite-Loader, Pixel-Schrift
│   ├── audio/             Synthesizer für Effekte und Musik
│   ├── ui/                Menüs, Touch-Steuerung
│   ├── data/              Chunks, Palette, Biome, Songs
│   └── storage/           Rekord und Rangliste (LocalStore, später Server)
├── assets/
│   ├── sprites/           Standardgrafiken (geschützt; JSON, eine Zeile pro Pixelreihe)
│   ├── skins/             eigene Skins aus dem Pixel-Studio
│   └── fonts/             unsere 5×7-Pixel-Schrift
├── tools/
│   ├── dev-server.mjs     lokaler Server mit Speicher-Funktion fürs Pixel-Studio
│   ├── pixel-studio/      Skizze → Pixel-Art → Animation → Speichern
│   └── check-chunks.mjs   prüft alle Chunks (npm run check)
└── docs/
    ├── PLAN.md            Spielplan & Meilensteine
    └── prototype/         erster Ein-Datei-Prototyp
```

## Eigene Grafiken (Pixel-Studio & Skins)

Die **Standardgrafiken** in `assets/sprites/` sind geschützt, das Pixel-Studio überschreibt sie nie.
Eigene Grafiken landen in einem **Skin** unter `assets/skins/<skin>/`. Ein Skin enthält nur die Sprites, die er verändert. Für alles andere gilt weiter der Standard.

1. `npm run dev` starten und das Pixel-Studio öffnen.
2. Oben einen **Skin** wählen oder mit „+ Skin“ einen neuen anlegen.
3. Ein Sprite laden, zum Beispiel `player`. Mit ★ markierte Sprites sind in diesem Skin bereits verändert.
4. **Skizze**: frei zeichnen oder ein Foto einer Papierzeichnung laden.
5. **In Pixel umwandeln**: Die Skizze wird auf die Sprite-Größe heruntergerechnet und auf unsere 24-Farben-Palette reduziert, auf Wunsch mit dunkler Kontur.
6. Pixel nachbessern und weitere Frames bzw. Animationen anlegen.
7. **In Skin speichern**. Ersetzt das Sprite eine Standardgrafik, muss die Größe gleich bleiben.

**Zurück zum Original:**
- *Ein Sprite:* im Studio auf „↺ Standard wiederherstellen“ klicken. Die Skin-Version wird gelöscht.
- *Alles:* im Spiel unter **Einstellungen → Skin** auf `STANDARD` stellen. Der Skin bleibt dabei erhalten.

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
