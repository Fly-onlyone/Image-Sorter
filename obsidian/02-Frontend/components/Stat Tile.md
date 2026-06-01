---
tags: [frontend, components]
---

# Stat Tile

> The glass metric tile with a spring count-up animation and an optional accent glow for the live phase.

## How it works

`StatTile({ label, value, accent })` renders a `Card` with the value in `h4` over a `caption` label. Numeric values **count up** via framer-motion (`animate` a `useMotionValue`, formatted through `useTransform`); string values render as-is; reduced-motion shows the final number immediately ([[usePrefersReducedMotion]]). `accent` adds a `primary` border + `theme.app.shadows.primary` glow to spotlight the running phase.

## Source

- `frontend/src/components/StatTile.tsx` (`StatTile`) — primary implementation

## Depends on

- [[Theme Factory]] — `theme.app.shadows`
- [[usePrefersReducedMotion]] — skips the count-up

## Used by

- [[Progress Screen]] — live SSE stat grid (active phase tile gets `accent`)
- [[Commit Screen]] — the "Done" summary tiles

## See also

- [[_index]]
- [[Animated Gradient Border]]
