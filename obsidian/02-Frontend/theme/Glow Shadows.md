---
tags: [frontend, theme]
---

# Glow Shadows

> `buildGlowShadows` produces a primary-derived glow set so elevation reads as colored glow, re-tinting per theme.

## Source

- `frontend/src/theme/shadows.ts` — primary implementation

## How it works

`buildGlowShadows(primaryHex)` converts the palette primary to an rgb triple via `hexToRgb` ([[Color Utilities]]) and returns a `GlowShadows` object: `cardHover`, `cardActive`, `primary`, and `primaryIntense`. Each blends a soft dark drop shadow with primary-tinted glow halos at varying intensity.

Because every shadow is derived from the active theme's primary, elevation is expressed as colored glow rather than grey shadow and automatically re-tints when the user switches presets. The set is built once inside [[Theme Factory]] and threaded into [[Component Overrides]].

## Depends on

- [[Color Utilities]] — `hexToRgb`

## Used by

- [[Theme Factory]] — builds shadows and stores them on `theme.app.shadows`
- [[Component Overrides]] — applies them to cards, buttons, tabs, inputs

## See also

- [[_index]]
- [[Design Tokens]]
