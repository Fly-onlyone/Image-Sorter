---
tags: [frontend, components]
---

# Silk Ribbons

> The app's signature canvas background: flowing translucent Bézier ribbon bands that slowly undulate in theme-accent colors, lightly blurred like silk.

## Source

- `frontend/src/components/effects/SilkRibbons.tsx` (`SilkRibbons`) — primary implementation

## How it works

`SilkRibbons` renders a fixed full-viewport `<canvas>` (`zIndex 0`, blurred, pointer-events none) and animates **seven** ribbon bands with `requestAnimationFrame`. Each ribbon has its own amplitude, wavelength, speed, and phase, drawn as a filled sine-wave band with a `lighter` composite and a theme-accent gradient sampled from `theme.app.colors` (primary/secondary/info). Each band also **drifts slowly up and down** so the silk feels alive — and it re-tints with every preset ([[Theme Factory]], [[Theme Context]]). The tunables (count, mid-stop alpha, blur, amplitude, drift) are named constants at the top of the file.

The canvas sits over a separate layered backdrop — a diagonal `body` gradient + two soft accent glows painted in [[Component Overrides]] (`MuiCssBaseline`) — so the background reads rich and deep but still dark.

An `intensity` prop scales gradient alpha and canvas opacity (compounding, so low values vanish fast); [[App Shell]] now mounts it at the default **full intensity on every screen** (the old per-view `0.12` dial-down on Review/Gallery made the effect invisible there). When [[usePrefersReducedMotion]] returns true the loop stops rescheduling and the canvas **freezes in place** ([[Reduced-Motion Gating Pattern]]); `reduced` is read via a ref so toggling it doesn't tear down / re-init the canvas (a flicker source), and a small separate effect restarts the loop when motion is re-enabled.

## Depends on

- [[usePrefersReducedMotion]] — freezes to a static frame
- [[Theme Context]] — `theme.app.colors`
- [[Reduced-Motion Gating Pattern]]

## Used by

- [[App Shell]] — mounted behind all content at full intensity on every screen

## See also

- [[_index]]
- [[Theme Factory]]
