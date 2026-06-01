---
tags: [frontend, theme]
---

# Palette Builder

> `buildPalette` maps a preset's 12 color roles onto MUI's semantic palette slots so every theme works with no hardcoded hex.

## Source

- `frontend/src/theme/palette.ts` — primary implementation

## How it works

`buildPalette(c)` returns a dark-mode MUI `PaletteOptions`, wiring each `ColorRoles` field to its MUI slot: `primary`, `secondary`, `info`, `background.default`/`paper` (from `bg`/`surface`), `text.primary`/`secondary`, and `divider` (from `border`).

Crucially, the app's pipeline states reuse the standard MUI status slots: `success` ← identified / auto-filed, `warning` ← review / borderline, `error` ← nude / R-18. Components reference these palette slots rather than literal colors, so all 11 themes "just work." Never hardcode hex in components — derive from the active palette.

## Depends on

- [[Theme Types]] — the `ColorRoles` input

## Used by

- [[Theme Factory]] — feeds the result into `createTheme`

## Gotchas

- The nude→`error`, review→`warning`, identified→`success` mapping is a load-bearing convention; components must read these slots, not raw hex.

## See also

- [[_index]]
- [[Component Overrides]]
