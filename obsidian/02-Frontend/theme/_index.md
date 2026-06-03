---
tags: [moc, frontend]
---

# Frontend `theme/` — Map of Content

> A typed `ThemePreset` (12 color roles + glass/spring/animation tokens) → `buildTheme()`
> → an MUI theme plus a `theme.app` token bag read by components and framer-motion. App
> states map onto MUI palette slots so every preset "just works". See
> [[Theme Factory Pattern]].

## Presets & context

- [[Theme Presets]] — 11 presets, default Dracula (`presets.ts`)
- [[Theme Context]] — `AppThemeProvider` + `useThemeController()`, persisted (`ThemeContext.tsx`)
- [[Theme Types]] — `ColorRoles`, `GlassTokens`, `SpringTokens`, `ThemePreset` (`types.ts`)

## Factory & builders

- [[Theme Factory]] — `buildTheme(preset)` → MUI theme + `theme.app` (`index.ts`)
- [[Color Normalization]] — levels darkness + text contrast per preset (`normalize.ts`, `standards.ts`)
- [[Palette Builder]] — maps color roles onto MUI semantic slots (`palette.ts`)
- [[Component Overrides]] — MUI component overrides; glass on chrome only (`components.ts`)
- [[Glow Shadows]] — primary-derived glow shadow set (`shadows.ts`)

## Tokens & utilities

- [[Design Tokens]] — shared glass/spring/animation defaults (`tokens.ts`)
- [[Typography]] — self-hosted Outfit + Inter (`typography.ts`)
- [[Color Utilities]] — hex/HSL/WCAG color math (`utils.ts`)

## See also

- [[_HOME]] · [[02-Frontend/_index|Frontend overview]]
- [[App Shell]] · [[Silk Ribbons]] · [[Theme Picker]]
