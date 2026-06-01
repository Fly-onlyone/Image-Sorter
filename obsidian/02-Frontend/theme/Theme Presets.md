---
tags: [frontend, theme]
---

# Theme Presets

> The registry of 11 `ThemePreset`s — Studio plus the 10 most popular software color schemes — defaulting to Tokyo Night.

## Source

- `frontend/src/theme/presets.ts` — primary implementation

## How it works

`PRESETS` is an array of 11 presets built by the local `preset()` helper, each combining a 12-role `colors` object ([[Theme Types]]) with the shared `DEFAULT_GLASS` / `DEFAULT_SPRING` / `DEFAULT_ANIM` tokens from [[Design Tokens]]. Only the colors (and derived `gradientAccent`) differ between themes; structure is shared.

`DEFAULT_THEME_ID` is `"tokyo-night"`, the first-launch default. `PRESET_MAP` indexes presets by `id`, and `getPreset(id)` returns the matching preset or falls back to Tokyo Night when `id` is null, undefined, or unknown.

## Depends on

- [[Theme Types]] — supplies the `ColorRoles` / `ThemePreset` shapes
- [[Design Tokens]] — shared glass/spring/animation defaults

## Used by

- [[Theme Factory]] — turns a preset into an MUI theme
- [[Theme Context]] — selects and persists the active preset
- [[Theme Picker]] — lists presets for the user to switch

## See also

- [[_index]]
- [[Theme Factory Pattern]]
