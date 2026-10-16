# Contributing to Rump & Jun

Thanks for wanting to help shape this game! Contributions of every size are welcome: a single new track section, a skin, a bug fix or a whole new mechanic.

## Getting started

```bash
git clone https://github.com/mpmamaci/rump-and-jun.git
cd rump-and-jun
npm run dev          # game:         http://localhost:8765
                     # Pixel Studio: http://localhost:8765/tools/pixel-studio/
```

You only need [Node.js](https://nodejs.org) 18+. Run `npm install` only if you want to test the production build (`npm run build`).

## Ways to contribute

### 🗺️ Track sections (chunks)
The easiest way to start. Add an entry to `src/data/chunks.js` (the character legend is at the top of the file and in the README).

- Pick a `difficulty` from 1 to 5. Higher tiers only appear later in a run.
- The first and last columns need ground in the bottom two rows so chunks connect seamlessly.
- **Make sure it can be beaten** at the auto-scroll speed of its tier: a normal jump is about 3 blocks high and 5 blocks wide, and a spring launches about 9 blocks high.
- Rocket slots (`!`) belong only in hard-to-reach spots, tier 2 or higher.
- Run `npm run check` before opening a PR.

### 🎨 Sprites and skins
Create them in the Pixel Studio and save them into a skin (`assets/skins/<name>/`). The default sprites in `assets/sprites/` are protected on purpose. If you want to propose new default art, mention it in your PR. Sprites that replace a default must keep the same size.

### 👾 Gameplay, enemies, power-ups, biomes
- Tuning values live in `src/config.js`.
- Enemies live in `src/entities/enemy.js`, power-ups in `src/entities/powerup.js` and `src/game.js`, and biomes in `src/data/biomes.js`.
- Keep the game **dependency-free at runtime**: no frameworks, and no assets loaded from the internet.

### 🎵 Music and sound
Songs are data in `src/data/music.js` (four chords plus lead, bass and drum patterns). Sound effects are synthesized in `src/audio/audio.js`.

## Code style

- Vanilla JavaScript with ES modules, 2-space indentation (see `.editorconfig`).
- Match the surrounding code. Short comments explaining *why* are welcome, and existing comments are in German, so either language is fine.
- Keep pull requests focused: one feature or fix per PR.

## Before you open a pull request

- [ ] `npm run check` passes
- [ ] `npm run build` succeeds (after a one-time `npm install`)
- [ ] You played your change in the browser, ideally on desktop and on a phone
- [ ] Screenshots or a short clip for visual changes

## Reporting bugs and ideas

Open an [issue](https://github.com/mpmamaci/rump-and-jun/issues) with what you expected, what happened, and your browser and device. Ideas for new mechanics are just as welcome as bug reports.

By contributing, you agree that your contribution is released under the project's [MIT License](LICENSE).
