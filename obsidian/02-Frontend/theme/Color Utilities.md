---
tags: [frontend, theme]
---

# Color Utilities

> Theme-agnostic color helpers — `hexToRgb`, `withAlpha`, `mix`, `gradientAccent`, plus HSL + WCAG math (`hexToHsl`, `hslToHex`, `relativeLuminance`, `contrastRatio`) — that derive design idioms from the active palette.

## Source

- `frontend/src/theme/utils.ts` — primary implementation

## How it works

`hexToRgb(hex)` parses `#rgb`, `#rrggbb`, or `#rrggbbaa` into an `"r, g, b"` string ready to drop into `rgba()`. `withAlpha(hex, alpha)` builds a translucent fill from a role hex. `mix(a, b, t)` blends two role hexes. `gradientAccent(primary, secondary)` returns a 90deg linear gradient used for animated accent borders and dividers.

A second cluster powers [[Color Normalization]]: `hexToHsl(hex)` / `hslToHex({h,s,l})` convert to and from HSL (lightness is the darkness knob), and `relativeLuminance(hex)` / `contrastRatio(a, b)` implement the WCAG sRGB-linearization math used to enforce the text-contrast floor. All reuse `hexToRgb`, so they tolerate 3/6/8-digit hex.

Because these operate on the active palette's role colors rather than literal hex, the glass fills, glow halos, gradient accents, and normalized surfaces/text they feed automatically adapt across all 11 themes.

## Used by

- [[Color Normalization]] — `hexToHsl`/`hslToHex`/`relativeLuminance`/`contrastRatio`
- [[Glow Shadows]] — `hexToRgb` for primary-tinted glows
- [[Component Overrides]] — `withAlpha` glass fills, `gradientAccent` borders
- [[Theme Factory]] — `gradientAccent` on the `theme.app` bag
- [[Silk Ribbons]] — palette-derived gradient colors for the animated background

## See also

- [[_index]]
- [[Palette Builder]]
