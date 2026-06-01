---
tags: [frontend, components]
---

# Page Transition

> The framer-motion wrapper that fades/slides each screen in and out as the active `view` changes.

## Source

- `frontend/src/components/PageTransition.tsx` (`PageTransition`) — primary implementation

## How it works

[[App Shell]] wraps the routed screen in `<AnimatePresence mode="wait">` with `<PageTransition key={view}>`. `PageTransition` is a `motion.div` that enters `{opacity:0, y:12} → {0,0}` and exits `{opacity:0, y:-8}`, timed by `theme.app.animations.normal` + the `easeOutExpo` curve. Its style is a `flex:1` column so a `fill` [[Page Container]] inside can stretch. When [[usePrefersReducedMotion]] is true it renders children directly (no animation), so AnimatePresence just swaps without an exit tween ([[Reduced-Motion Gating Pattern]]).

The [[Silk Ribbons]] canvas is deliberately a sibling of the transition, not a child, so it never remounts on navigation.

## Depends on

- [[Theme Factory]] — `theme.app.animations`
- [[usePrefersReducedMotion]] — bypasses motion

## Used by

- [[App Shell]] — keyed on `view` from [[App State Context]]

## See also

- [[_index]]
- [[Page Container]]
