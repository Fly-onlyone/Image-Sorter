---
tags: [frontend, theme]
---

# Theme Context

> `AppThemeProvider` holds the active preset, persists it to localStorage and the backend, and applies the built MUI theme app-wide.

## How it works

`AppThemeProvider` initializes `presetId` from `localStorage["image-sorter.theme"]` (falling back to `DEFAULT_THEME_ID`). `setPresetId` updates state, writes localStorage, and mirrors the choice to the backend via `api.patchSettings({ theme })` ([[API Client]]). On mount it hydrates from `api.getSettings()`, adopting the remote `theme` if it is a known preset.

`getPreset(presetId)` resolves the preset, `buildTheme` ([[Theme Factory]]) memoizes the MUI theme, and the provider wraps children in MUI `ThemeProvider` + `CssBaseline`. `useThemeController()` exposes `presetId`, `preset`, `presets`, and `setPresetId`; it throws if used outside the provider.

## Source

- `frontend/src/theme/ThemeContext.tsx` — primary implementation

## Depends on

- [[Theme Factory]] — builds the MUI theme
- [[Theme Presets]] — `getPreset` / `PRESETS` / `DEFAULT_THEME_ID`
- [[API Client]] — persists/hydrates the choice to backend settings

## Used by

- [[App Entry and Router]] — wraps the app
- [[Theme Picker]], [[Settings Screen]] — call `setPresetId`

## See also

- [[_index]]
