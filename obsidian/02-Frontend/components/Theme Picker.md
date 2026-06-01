---
tags: [frontend, components]
---

# Theme Picker

> AppBar palette button that opens a menu of all 11 theme presets, each with name, hue label, and a four-color swatch row.

## Source

- `frontend/src/components/ThemePicker.tsx` (`ThemePicker`) — primary implementation

## How it works

`ThemePicker` is a palette `IconButton` that anchors a `Menu`. It reads `presets`, `presetId`, and `setPresetId` from `useThemeController` ([[Theme Context]]). Each `MenuItem` lists a preset's name + hue and renders a `Swatches` row built from that preset's `primary`/`secondary`/`success`/`error` colors ([[Theme Presets]]). Selecting one calls `setPresetId`, which rebuilds the MUI theme ([[Theme Factory]]) and persists the choice (localStorage + backend settings mirror).

A footer caption nudges users toward the neutral "Studio" preset for long review sessions. The picker lives in [[App Shell]]'s AppBar, not on the [[Settings Screen]].

## Depends on

- [[Theme Context]] — `useThemeController` (presets, current id, setter)
- [[Theme Presets]] — swatch colors
- [[Theme Factory]] — rebuilds theme on change

## Used by

- [[App Shell]] — mounted in the AppBar

## See also

- [[_index]]
- [[Theme Factory Pattern]]
