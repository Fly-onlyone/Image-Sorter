---
tags: [frontend, components]
---

# Scroll Reveal

> A wrapper that fades and slides its child up as it scrolls into view, used for long Review/Gallery lists.

## Source

- `frontend/src/components/effects/ScrollReveal.tsx` (`ScrollReveal`) — primary implementation

## How it works

`ScrollReveal` wraps children in a framer-motion `motion.div` that animates from `{ opacity: 0, y: 16 }` to `{ opacity: 1, y: 0 }` via `whileInView`, firing once per element (`viewport.once`) with a custom easing and an optional `delay` for staggering. When [[usePrefersReducedMotion]] returns true it short-circuits and renders the children directly with no animation ([[Reduced-Motion Gating Pattern]]).

## Depends on

- [[usePrefersReducedMotion]] — bypasses the reveal entirely
- [[Reduced-Motion Gating Pattern]]

## Used by

- [[Review Screen]] — staggered reveal of unknown-cluster cards

## See also

- [[_index]]
- [[Silk Ribbons]]
