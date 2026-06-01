---
tags: [frontend, components]
---

# Magnetic Button

> A primary-action button wrapper that springs toward the cursor on hover, used for Start run and Confirm & commit.

## Source

- `frontend/src/components/effects/MagneticButton.tsx` (`MagneticButton`) — primary implementation

## How it works

`MagneticButton` wraps a MUI `Button` in a framer-motion `motion.div` to avoid prop-type clashes between framer's drag handlers and `ButtonProps`. On mouse-move it offsets the wrapper by 30% of the cursor's distance from center using `useMotionValue` + `useSpring`, with the spring config pulled from `theme.app.spring.gentle` ([[Theme Context]]). Mouse-leave resets to origin; `whileTap` adds a small scale press.

All motion gates on [[usePrefersReducedMotion]] — when reduced, `onMove` and `whileTap` no-op and the button stays still ([[Reduced-Motion Gating Pattern]]).

## Depends on

- [[usePrefersReducedMotion]] — disables magnetic + tap motion
- [[Theme Context]] — `theme.app.spring.gentle`
- [[Reduced-Motion Gating Pattern]]

## Used by

- [[Setup Screen]] — "Start run"
- [[Commit Screen]] — "Confirm & commit"

## See also

- [[_index]]
- [[Animated Gradient Border]]
