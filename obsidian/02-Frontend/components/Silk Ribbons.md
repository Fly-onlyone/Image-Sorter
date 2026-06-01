---
tags: [frontend, components]
---

# Silk Ribbons

> The app's signature canvas background: flowing translucent Bézier ribbon bands that slowly undulate in theme-accent colors, lightly blurred like silk.

## Source

- `frontend/src/components/effects/SilkRibbons.tsx` (`SilkRibbons`) — primary implementation

## How it works

`SilkRibbons` renders a fixed full-viewport `<canvas>` (`zIndex 0`, blurred, pointer-events none) and animates five ribbon bands with `requestAnimationFrame`. Each ribbon has its own amplitude, wavelength, speed, and phase, drawn as a filled sine-wave band with a `lighter` composite and a low-opacity gradient sampled from `theme.app.colors` (primary/secondary/info) — so it adapts to every preset ([[Theme Factory]], [[Theme Context]]).

An `intensity` prop scales gradient alpha and canvas opacity; [[App Shell]] passes `0.12` on image-heavy screens. When [[usePrefersReducedMotion]] returns true the animation loop never requests another frame — it draws one frozen still ([[Reduced-Motion Gating Pattern]]).

## Depends on

- [[usePrefersReducedMotion]] — freezes to a static frame
- [[Theme Context]] — `theme.app.colors`
- [[Reduced-Motion Gating Pattern]]

## Used by

- [[App Shell]] — mounted behind all content with per-view intensity

## See also

- [[_index]]
- [[Theme Factory]]
