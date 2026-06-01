---
tags: [frontend, components]
---

# Page Container

> The shared page wrapper every screen uses instead of a hardcoded `maxWidth` box, plus `PageHeader` — the cinematic gradient-text hero header with an animated underline.

## Source

- `frontend/src/components/PageContainer.tsx` (`PageContainer`, `PageHeader`) — primary implementation

## How it works

`PageContainer` is a `width: 100%` box whose `maxWidth` **grows on wide windows** instead of capping at ~900px: by default it scales to `1200px` at `lg` and `1480px` at `xl`; pass a number for a fixed cap (forms like Settings use `820`) or `"fluid"` for no cap. With `fill`, it becomes a flex column (`flexGrow: 1`) so a `flexGrow` child stretches to the bottom — used by History (DataGrid), Review and Gallery lists. This replaced the per-page `maxWidth` boxes (Setup 920, Settings 720, Progress 920, Commit 960, Gallery 880) that left dead space on wide windows.

`PageHeader` renders an `h3` title filled with `theme.app.gradientAccent` (background-clip text) + animated underline (the global `gradientFlow` keyframes), an optional subtitle, and a right-aligned `actions` slot. The mount reveal and the flowing gradient gate on [[usePrefersReducedMotion]].

## Depends on

- [[Theme Factory]] — `theme.app.gradientAccent`
- [[usePrefersReducedMotion]] — gates the header animation

## Used by

- All 7 screens — [[Setup Screen]], [[Progress Screen]], [[Review Screen]], [[Commit Screen]], [[Gallery Screen]], [[History Screen]], [[Settings Screen]]
- Composed inside [[App Shell]]'s flex-column main, under [[Page Transition]]

## See also

- [[_index]]
- [[App Shell]]
