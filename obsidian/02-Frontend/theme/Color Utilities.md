---
tags: [frontend, theme]
---

# Color Utilities

> Theme-agnostic color helpers — `hexToRgb`, `withAlpha`, `gradientAccent` — that derive design idioms from the active palette.

## Source

- `frontend/src/theme/utils.ts` — primary implementation

## How it works

`hexToRgb(hex)` parses `#rgb`, `#rrggbb`, or `#rrggbbaa` into an `"r, g, b"` string ready to drop into `rgba()`. `withAlpha(hex, alpha)` builds a translucent fill from a role hex. `gradientAccent(primary, secondary)` returns a 90deg linear gradient used for animated accent borders and dividers.

Because all three operate on the active palette's role colors rather than literal hex, the glass fills, glow halos, and gradient accents they feed automatically adapt across all 11 themes.

## Used by

- [[Glow Shadows]] — `hexToRgb` for primary-tinted glows
- [[Component Overrides]] — `withAlpha` glass fills, `gradientAccent` borders
- [[Theme Factory]] — `gradientAccent` on the `theme.app` bag
- [[Silk Ribbons]] — palette-derived gradient colors for the animated background

## See also

- [[_index]]
- [[Palette Builder]]
