# Contributing to Detoxify

Thanks for helping make YouTube a little quieter.

## Prerequisites

- [Bun](https://bun.sh)
- A Chromium browser and/or Firefox for testing

## Setup

```bash
git clone https://github.com/Grenish/detoxify.git
cd detoxify
bun install
bun run build
```

Load **`dist/chrome`** or **`dist/firefox`** as an unpacked / temporary extension (see README).

## Project structure

| Path | Role |
|------|------|
| `src/shared/` | Settings, presets, selectors, CSS injection helpers |
| `src/content/` | Content script and feature modules (Shorts, Playables, keywords, …) |
| `src/popup/` | Popup HTML / CSS / JS |
| `src/background/` | Thin MV3 background |
| `browsers/` | Browser-specific `manifest.json` files |
| `scripts/build.mjs` | esbuild packaging into `dist/` |

Prefer fixing YouTube DOM breakage in **`src/shared/selectors.js`** and **`src/shared/css.js`** rather than scattering selectors.

## Workflow

1. Create a branch: `git checkout -b feature/your-change`
2. Make changes under `src/` (or manifests under `browsers/`)
3. Run `bun run build` and reload the extension
4. Test on live YouTube: home, search, subscriptions, a `/shorts/` URL, popup toggles/presets
5. Open a pull request with a clear description

## Ideas that help

- More resilient Shorts / Playables selectors when YouTube redesigns
- Performance improvements to the mutation observer
- Accessibility and popup UX polish
- Automated unit tests for pure helpers (keyword match, preset merge, normalizeSettings)

## Code of Conduct

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
