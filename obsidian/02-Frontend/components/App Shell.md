---
tags: [frontend, components]
---

# App Shell

> The persistent chrome: top AppBar (title + run chip + theme picker), left Drawer nav, and the SilkRibbons background frame. (The run stepper now lives in `PageBar` — see [[Page Container]].)

## Source

- `frontend/src/components/AppShell.tsx` (`AppShell`) — primary implementation

## How it works

`AppShell` lays out a fixed `AppBar` (carrying the [[Theme Picker]] and a run-status chip from [[App State Context]]), a permanent left `Drawer` with five nav destinations (icons from `nav.tsx`'s `VIEW_ICONS`), and the page `children`. The nav highlights **exactly one** item via a computed `activeNav`: a view with its own entry highlights itself; flow-only steps without one (`progress`, `commit`) fall back to New Run. (The old `flowIndex >= 0` rule lit New Run **and** Review at once on the Review step — that double-highlight is fixed.) When motion is on, the active highlight is a single shared-layout `motion.div` pill (`layoutId="nav-active-pill"`) that **slides** between items; reduced-motion falls back to MUI's default `selected` fill. The run `Stepper` itself now renders inside [[Page Container]]'s `PageBar` (relocated out of the shell), not here.

It mounts [[Silk Ribbons]] behind everything at `zIndex: 0`, at **full intensity on every screen** so the signature background reads consistently (an earlier per-view `RIBBON_INTENSITY` map dialed Review/Gallery down to `0.12`, which made the effect effectively invisible there — removed). The ribbons are heavily blurred + low-alpha, so they don't fight thumbnails; chrome carries the glass + glow while the thumbnail grid stays flat neutral.

The main content area is a **flex column**; the routed screen is wrapped in `<AnimatePresence mode="wait">` + [[Page Transition]] keyed on `view`, giving an **opacity-only** cross-fade between views (no transform, so the sticky `PageBar` inside isn't trapped by a transformed ancestor). The [[Silk Ribbons]] canvas stays a *sibling* of the transition (never a child) so it isn't remounted — its `requestAnimationFrame` loop keeps running across navigations. Each screen lays itself out with the shared [[Page Container]] (fluid width or a centered numeric cap + optional vertical `fill`) and its `PageBar` title rail, so no screen hardcodes a `maxWidth`.

## Depends on

- [[App State Context]] — `view`, `setView`, `run`
- [[Silk Ribbons]] — background (full intensity on every screen)
- [[Theme Picker]] — AppBar control

## Used by

- [[App Entry and Router]] — wraps the `Router`

## Gotchas

- MUI v9 `Stack`/layout props like `alignItems`/`justifyContent` go via `sx`.

## See also

- [[_index]]
- [[Theme Factory]]
