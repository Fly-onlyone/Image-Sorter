---
tags: [frontend, theme]
---

# Theme Factory

> `buildTheme(preset)` turns the active `ThemePreset` into a full MUI theme plus a `theme.app` token bag that components and framer-motion read anywhere.

## Source

- `frontend/src/theme/index.ts` — primary implementation

## How it works

`buildTheme(preset)` derives glow shadows from the preset primary ([[Glow Shadows]]), assembles an `AppTokens` bag (`colors`, `glass`, `spring`, `animations`, `shadows`, `gradientAccent`), then calls MUI `createTheme` with a palette from [[Palette Builder]], shared `typography` ([[Typography]]), `shape.borderRadius` from glass tokens, component overrides from [[Component Overrides]], and the `app` bag attached.

A module augmentation declares `Theme.app: AppTokens`, so any component can read `theme.app.*` type-safely. This single-factory approach is the [[Theme Factory Pattern]]. `index.ts` also re-exports `getPreset`, `PRESETS`, etc. for convenience.

## Depends on

- [[Theme Presets]] — the input preset
- [[Palette Builder]], [[Component Overrides]], [[Glow Shadows]], [[Typography]], [[Color Utilities]] — pieces it assembles

## Used by

- [[Theme Context]] — calls `buildTheme` on every preset change

## See also

- [[_index]]
- [[Theme Factory Pattern]]
