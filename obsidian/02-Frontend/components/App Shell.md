---
tags: [frontend, components]
---

# App Shell

> The persistent chrome: top AppBar (title + run chip + theme picker), left Drawer nav, the run stepper, and the SilkRibbons background frame.

## Source

- `frontend/src/components/AppShell.tsx` (`AppShell`) — primary implementation

## How it works

`AppShell` lays out a fixed `AppBar` (carrying the [[Theme Picker]] and a run-status chip from [[App State Context]]), a permanent left `Drawer` with five nav destinations, and the page `children`. When the active `view` is one of the four flow steps (`setup → progress → review → commit`) it renders a `Stepper` above the content; the nav highlights "New Run" for any flow step.

It mounts [[Silk Ribbons]] behind everything at `zIndex: 0`. The `RIBBON_INTENSITY` map dials the background down to `0.12` on image-heavy screens (Review, Gallery) so it never fights thumbnails — chrome carries the glass + glow while the thumbnail grid stays flat neutral.

The main content area is a **flex column**; the routed screen is wrapped in `<AnimatePresence mode="wait">` + [[Page Transition]] keyed on `view`, giving a cross-fade/slide between views. The [[Silk Ribbons]] canvas stays a *sibling* of the transition (never a child) so it isn't remounted — its `requestAnimationFrame` loop keeps running across navigations. Each screen lays itself out with the shared [[Page Container]] (fluid responsive width + optional vertical `fill`) and `PageHeader`, so no screen hardcodes a `maxWidth`.

## Depends on

- [[App State Context]] — `view`, `setView`, `run`
- [[Silk Ribbons]] — background (intensity-dialled)
- [[Theme Picker]] — AppBar control

## Used by

- [[App Entry and Router]] — wraps the `Router`

## Gotchas

- MUI v9 `Stack`/layout props like `alignItems`/`justifyContent` go via `sx`.

## See also

- [[_index]]
- [[Theme Factory]]
