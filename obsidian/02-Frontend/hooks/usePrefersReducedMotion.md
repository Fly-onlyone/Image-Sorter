---
tags: [frontend, hooks]
---

# usePrefersReducedMotion

> Accessibility gate returning whether animations should be suppressed, combining the system motion preference with a user override.

## How it works

The hook reads two inputs: the system `prefers-reduced-motion: reduce` media query and a localStorage override under the key `"image-sorter.reducedMotion"`. It seeds state from both on mount, then subscribes to the media query's `change` event so the value tracks OS preference changes live (the override always wins when set to `"true"`).

Every animation in the app gates on this boolean — framer-motion transitions, the `SilkRibbons` background, and other polish helpers — so motion can be globally disabled from Settings or the OS ([[Reduced-Motion Gating Pattern]]).

## Source

- `frontend/src/hooks/usePrefersReducedMotion.ts` — primary implementation

## Used by

- [[App Shell]]
- [[Progress Screen]]
- [[Theme Context]] — exposes the spring/animation tokens this gate enables or disables

## See also

- [[02-Frontend/hooks/_index|hooks]]
- [[Reduced-Motion Gating Pattern]]
