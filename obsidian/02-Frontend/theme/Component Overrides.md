---
tags: [frontend, theme]
---

# Component Overrides

> `buildComponents` applies glass and glow styling to chrome only — AppBar, Drawer, Card, inputs — while image screens stay flat opaque neutral.

## Source

- `frontend/src/theme/components.ts` — primary implementation

## How it works

`buildComponents(preset, shadows)` returns MUI `Components` overrides derived from the preset's `colors` and `glass` tokens. AppBar and Drawer get translucent `withAlpha(surface)` backgrounds plus `backdropFilter` blur; `MuiCard` gets a blurred glass surface with an animated `gradientAccent` top border and a `shadows.cardHover` glow on hover; buttons, tabs, inputs, dividers, and chips pick up primary-tinted gradients and glow ([[Glow Shadows]]). A `gradientFlow` keyframe animates accent borders.

Glass and glow apply to chrome only. Image-heavy screens (Review, Gallery) deliberately use plain `Box`/`ImageListItem`, not `Card`, so thumbnails render on a flat opaque neutral and stay color-true.

## Depends on

- [[Theme Types]] — `ColorRoles` / `GlassTokens`
- [[Glow Shadows]] — the glow shadow set
- [[Color Utilities]] — `hexToRgb`, `withAlpha`, `gradientAccent`

## Used by

- [[Theme Factory]] — passes the overrides to `createTheme`

## Gotchas

- Wrapping thumbnails in `Card` would re-apply glass/glow and tint the image — keep image grids on plain containers.

## See also

- [[_index]]
- [[Palette Builder]]
