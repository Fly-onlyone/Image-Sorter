---
tags: [frontend, theme]
---

# Theme Types

> The typed model for a theme preset: 12 color roles plus glass, spring, and animation token shapes.

## Source

- `frontend/src/theme/types.ts` — primary implementation

## How it works

`ColorRoles` declares the 12 roles every preset must supply: `bg`, `surface`, `elevated`, `border`, `textPrimary`, `textSecondary`, `primary`, `secondary`, `success`, `warning`, `error`, `info`. App semantic states map onto these (see [[Palette Builder]]).

`GlassTokens` carries `borderRadius` and blur/opacity for cards and sidebar; `SpringTokens` holds `snappy`/`bouncy`/`gentle` framer-motion spring configs; `AnimationTokens` holds `fast`/`normal`/`slow` durations plus named easings. `ThemePreset` ties it all together with `id`, `name`, `hue` (picker description), `colors`, `glass`, `spring`, `animations`.

## Used by

- [[Theme Presets]] — every preset conforms to `ThemePreset`
- [[Design Tokens]] — provides the default token instances
- [[Palette Builder]], [[Component Overrides]] — consume `ColorRoles`

## See also

- [[_index]]
- [[Theme Factory Pattern]]
