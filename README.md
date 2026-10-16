<div align="center">

<img src="assets/icons/icon-192.png" alt="Rump & Jun icon" width="96" height="96">

# Rump & Jun

**An endless pixel-art platformer for the browser.**
The track scrolls on its own, gets faster and faster, and never ends. How far can you get?

[![License: MIT](https://img.shields.io/badge/license-MIT-e84a5f.svg)](LICENSE)
![Runtime dependencies: 0](https://img.shields.io/badge/dependencies-0-38b764.svg)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-ES2022-ffcd75.svg)
![Platforms](https://img.shields.io/badge/runs%20on-desktop%20%C2%B7%20phone%20%C2%B7%20tablet-41a6f6.svg)
![Built with Claude](https://img.shields.io/badge/built%20with-Claude-d97757.svg)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-38b764.svg)](CONTRIBUTING.md)

<img src="docs/screenshots/title.png" alt="Title screen" width="720">

</div>

---

## Contents

- [About the game](#about-the-game)
- [Screenshots](#screenshots)
- [Quick start](#quick-start)
- [Controls](#controls)
- [Pixel Studio & skins](#pixel-studio--skins)
- [Building your own track sections](#building-your-own-track-sections)
- [Deploying](#deploying)
- [Under the hood](#under-the-hood)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [How it was made](#how-it-was-made)
- [License](#license)

## About the game

Rump & Jun combines a classic platformer with the endless, auto-scrolling idea of *The Impossible Game*. You run, jump and climb through a world that is generated as you play, while the left edge of the screen keeps pushing you forward.

- 🏃 **Endless track** built from 37 handcrafted sections across 5 difficulty tiers. The speed increases with every meter.
- 🧗 **Parkour:** wall jumps, wall slides and spring pads.
- 👾 **4 enemy types** (walkers, jumpers, flyers and diving hawks), plus moving and crumbling platforms.
- ⚡ **Power-ups:** double jump, shield, slow motion and the rare **rocket**, which carries you invincibly 500+ meters ahead.
- 🌄 **4 biomes** that change every 500 m (meadow, crystal cave, castle at sunset, starry night), each with its own music.
- 🏆 **Scoring** from distance, coins and enemy combos, plus a local arcade-style **top-10 leaderboard**.
- 🎚️ **Speed modes:** normal, fast and turbo, each with a score multiplier.
- 📱 **Desktop, phone and tablet:** touch controls, fullscreen, and it can be installed to your home screen as an app.
- 🎨 **Everything is homemade:** the pixel art, pixel font, sound effects and chiptune music are all created in this project. No third-party assets are loaded.

- 🌍 **English and German:** switch under *Settings → Language*. On first launch the game follows your browser's language.

## Screenshots

<table>
  <tr>
    <td><img src="docs/screenshots/cave.png" alt="Crystal cave with combo and shield"></td>
    <td><img src="docs/screenshots/rocket.png" alt="Rocket ride through the starry night"></td>
  </tr>
  <tr>
    <td align="center"><sub>Crystal cave: combo and shield</sub></td>
    <td align="center"><sub>Rocket ride through the starry night</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/castle.png" alt="Castle at sunset"></td>
    <td><img src="docs/screenshots/title.png" alt="Title screen"></td>
  </tr>
  <tr>
    <td align="center"><sub>Castle at sunset with double jump</sub></td>
    <td align="center"><sub>Title screen</sub></td>
  </tr>
</table>

## Quick start

All you need is [Node.js](https://nodejs.org) 18 or newer. Playing and developing require no extra packages.

```bash
git clone https://github.com/mpmamaci/rump-and-jun.git
cd rump-and-jun
npm run dev
```

| What | URL |
|---|---|
| Game | <http://localhost:8765> |
| Pixel Studio | <http://localhost:8765/tools/pixel-studio/> |

**Testing on a phone or tablet:** `npm run dev:lan` also makes the server reachable on your local Wi-Fi and prints the right addresses at startup. Only use this mode on your home network, since anyone on that Wi-Fi could save skins.

### All commands

| Command | Purpose |
|---|---|
| `npm run dev` | dev server with game and Pixel Studio (localhost only) |
| `npm run dev:lan` | same as `dev`, but reachable on your local network |
| `npm run check` | validates all track sections |
| `npm run build` | builds the minified version for static hosting into `dist/` |
| `npm run icons` | generates the app icons from the player sprite |

## Controls

| Keyboard | Action |
|---|---|
| <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> | run |
| <kbd>Space</kbd> / <kbd>W</kbd> / <kbd>↑</kbd> | jump (hold longer to jump higher); against a wall: wall jump |
| <kbd>Esc</kbd> / <kbd>P</kbd> | pause |
| <kbd>F</kbd> | fullscreen |
| <kbd>R</kbd> | restart |
| <kbd>M</kbd> | sound on/off |

**Phone & tablet:**
- On-screen buttons for running, jumping and pausing. They sit next to the game view so they never cover your character. You can switch them to an overlay in the settings for a larger picture.
- Real fullscreen works on Android, iPad and desktop.
- On **iPhone**, use *Share → Add to Home Screen* to run the game as an app without browser bars.

## Pixel Studio & skins

The Pixel Studio (`tools/pixel-studio/`) is a small homemade graphics tool. It also works on an iPad with Apple Pencil.

1. **Sketch:** draw freely, or load a photo of a paper drawing.
2. **Convert:** the sketch is downscaled to the sprite size and reduced to the game's 24-color palette, with an optional outline.
3. **Refine:** edit individual pixels and create frames and animations, with onion skinning and a live preview.
4. **Save** into a **skin**.

The default sprites in `assets/sprites/` are **protected**. A skin in `assets/skins/<name>/` only contains the sprites it changes. Pick a skin in the game under *Settings → Skin*. `DEFAULT` restores the defaults at any time, and the studio's "↺ Standard wiederherstellen" button resets a single sprite.

Sprites are stored as readable JSON, one pixel row per line with one palette character per pixel, so changes stay easy to follow in `git diff`.

## Building your own track sections

The world is stitched together endlessly from **chunks** defined in `src/data/chunks.js`. Each character is one 16 × 16 px block, and one block equals one meter.

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

| Char | Meaning | Char | Meaning |
|---|---|---|---|
| `#` | ground | `E` | walker |
| `=` | platform | `J` | jumper |
| `~` | crumbling platform | `B` | flyer |
| `^` | spikes | `D` | diving hawk |
| `*` | spring pad | `M` / `V` | moving platform (horizontal / vertical) |
| `C` | coin | `?` | power-up slot |
| `P` | player start | `!` | rocket slot (rare, tier 2+) |

**Rules:** maps are aligned to the bottom of the world, and the first and last columns need ground in the bottom two rows. `npm run check` validates this automatically.

## Deploying

```bash
npm install     # once: installs the build tool esbuild
npm run build
```

Then upload the **contents** of `dist/` to any static web host. No server-side code is needed.

The build
- bundles and minifies JavaScript, CSS and HTML,
- compacts all sprites, skins and the font,
- adds content hashes to file names so browsers never serve a stale cache after an update,
- leaves out the Pixel Studio, the dev server and the docs.

> Opening `index.html` directly from disk won't work, because browsers only load ES modules over `http(s)://`.

## Under the hood

- **Vanilla JavaScript (ES modules) and Canvas 2D.** No framework and no runtime dependencies.
- **Pixel-perfect rendering:** the game renders internally at 480 × 270 and is scaled by whole device pixels on desktop.
- **Fixed timestep** at 60 updates per second, so the physics behave the same on every device. That keeps high scores fair.
- **Seeded generator** (Mulberry32): chunks are picked with weights by difficulty, and the same seed always produces the same track.
- **Synthesized audio** via the Web Audio API: oscillators and noise for every effect, plus a lookahead chiptune sequencer whose tempo follows the game speed.
- **Sprites as data:** a 24-color palette with one character per color makes biome recoloring a simple palette remap.
- **Leaderboard interface:** `LocalStore` saves in the browser, and a `ServerStore` can be added later without touching the game.
- **Homemade tooling with no extra packages:** dev server, chunk validator and a PNG encoder for the app icons.

## Project structure

```
rump-and-jun/
├── index.html               entry page
├── manifest.webmanifest     web app manifest (home screen, fullscreen)
├── styles/main.css          page and touch layout
├── src/
│   ├── main.js              startup, scaling, game loop
│   ├── game.js              game state, menus, power-ups, rocket
│   ├── config.js            all tuning values
│   ├── i18n.js              all in-game texts (German / English)
│   ├── core/                seeded randomness
│   ├── world/               endless world, difficulty curve
│   ├── entities/            player, enemies, platforms, power-ups
│   ├── render/              renderer, sprite loader, pixel font
│   ├── audio/               synthesizer and music sequencer
│   ├── ui/                  menus, touch, fullscreen
│   ├── data/                chunks, palette, biomes, songs
│   └── storage/             best score, leaderboard, settings
├── assets/
│   ├── sprites/             default sprites (protected)
│   ├── skins/               custom skins from the Pixel Studio
│   ├── fonts/               5 × 7 pixel font
│   └── icons/               app icons
├── tools/
│   ├── dev-server.mjs       dev server with save API for the studio
│   ├── pixel-studio/        sketch → pixel art → animation → skin
│   ├── build.mjs            build for static hosting
│   ├── check-chunks.mjs     track section validator
│   └── make-icons.mjs       app icons from the player sprite
└── docs/
    ├── PLAN.md              original game plan and milestones (German)
    ├── screenshots/
    └── prototype/           the very first single-file prototype
```

## Contributing

**Let's shape this game together!** Pull requests are very welcome, big or small:

- 🗺️ **New track sections:** a chunk is just a few lines of text, which makes it the easiest way to contribute.
- 🎨 **Sprites and skins** made in the Pixel Studio.
- 👾 **New enemies, power-ups or biomes.**
- 🎵 **Music:** a song is four chords and a few numbers in `src/data/music.js`.
- 🐛 **Bug reports and ideas** via [issues](https://github.com/mpmamaci/rump-and-jun/issues).

See [CONTRIBUTING.md](CONTRIBUTING.md) for the details.

## How it was made

Rump & Jun was built entirely in conversation with **[Claude](https://claude.ai)** by Anthropic, using Claude Code as a programming partner. Everything was worked out together, from the first game idea through the plan and milestones to the code, pixel art, pixel font, sound, music and tooling. Feedback from real play-testing rounds was folded in along the way.

The original plan with all milestones is in [`docs/PLAN.md`](docs/PLAN.md), and the very first prototype is in [`docs/prototype/`](docs/prototype/).

## License

Released under the [MIT License](LICENSE). © 2026 mpmamaci
