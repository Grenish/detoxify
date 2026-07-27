# Detoxify

Browser extension that gives you control over YouTube: hide **Shorts**, hide **Playables**, block home-feed cards by **keyword**, and jump into focus **presets**.

Works on **Chrome** (Manifest V3) and **Firefox** (Manifest V3).

## Features

- **Hide Shorts** — shelves, feed cards, search rails, subscriptions, and more
- **Block Shorts player** — optional redirect from `/shorts/*` to Home
- **Hide Shorts in sidebar** — guide entry and Shorts tabs
- **Hide Playables** — Games / Playables shelves and promos
- **Keyword blocklist** — hide home cards when title or channel matches (substring, case-insensitive)
- **Shorten Music label** — “YouTube Music” → “Music” in the guide
- **Presets** — Soft, Balanced, Max focus, plus custom presets you save
- **Privacy-first** — runs entirely in your browser; settings in `storage.sync` only

New installs start with **everything off**. Apply a preset or flip toggles when you’re ready.

## Install (stores)

| Browser | Link |
|---------|------|
| Firefox | [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/detoxify-youtube/) |
| Chrome | [Chrome Web Store](https://chromewebstore.google.com/detail/detoxify/fpkgobnjbinhnnhbbjagohcohhlbghig) |

## Develop / load unpacked

### Prerequisites

- [Bun](https://bun.sh) (recommended)
- Node is not required if you use Bun for install + build

### Build

```bash
bun install
bun run build
```

This writes:

- `dist/chrome/` — load in Chrome / Edge / Chromium
- `dist/firefox/` — load in Firefox

Watch mode:

```bash
bun run build:watch
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `dist/chrome`

### Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on…**
3. Select `dist/firefox/manifest.json`

## Usage

1. Open YouTube.
2. Click the Detoxify icon.
3. Apply a **preset** or enable individual **controls**.
4. Changes apply **live** — no tab reload required.

### Built-in presets

| Preset | What it enables |
|--------|------------------|
| **Soft** | Hide Shorts + sidebar Shorts (no redirect) |
| **Balanced** | Shorts + Playables + sidebar + Shorts redirect |
| **Max focus** | Balanced + keyword filter on + Music label polish |

Custom presets store your current toggles and keywords (up to 10).

## Project layout

```text
src/
  shared/          # settings, presets, selectors, CSS helpers
  content/         # content script + feature modules
  popup/           # extension popup
  background/      # thin MV3 background
browsers/
  chrome/manifest.json
  firefox/manifest.json
assets/            # icons
scripts/build.mjs  # esbuild → dist/
dist/              # build output (gitignored)
```

Chrome and Firefox share one codebase; only manifests differ.

## Permissions

- **storage** — save preferences and presets locally (sync storage when available)
- **Host access** via content scripts — `youtube.com` / `m.youtube.com` only, to modify the page UI

No network requests. No analytics.

## Privacy

See [PRIVACY POLICY.md](./PRIVACY%20POLICY.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

## Support

- Issues: [github.com/Grenish/detoxify/issues](https://github.com/Grenish/detoxify/issues)
- Email: mrcoder2033d@gmail.com
- [Buy Me a Coffee](https://buymeacoffee.com/grenish)
