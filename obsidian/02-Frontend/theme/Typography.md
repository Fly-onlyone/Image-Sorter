---
tags: [frontend, theme]
---

# Typography

> Shared MUI typography: Outfit for headings and buttons, Inter for body — both self-hosted via @fontsource.

## Source

- `frontend/src/theme/typography.ts` — primary implementation

## How it works

The `typography` object sets the base `fontFamily` to Inter and maps every heading variant (`h1`–`h6`, `subtitle1`) plus `button` onto the Outfit stack at weights 600/700 with tightened letter-spacing; `body1`/`body2` stay on Inter. Both fonts fall back to `system-ui, sans-serif`.

Fonts are self-hosted through `@fontsource` rather than the Google CDN, since this is an offline desktop app and must not depend on a network at runtime. The same `typography` config is passed to `createTheme` by [[Theme Factory]] for all 11 themes.

## Used by

- [[Theme Factory]] — supplies `typography` to `createTheme`

## Gotchas

- The actual font files must be imported (via `@fontsource/outfit` / `@fontsource/inter`) at app entry, or the stacks silently fall back to `system-ui`.

## See also

- [[_index]]
- [[App Entry and Router]]
