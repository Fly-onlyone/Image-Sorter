---
tags: [moc, frontend]
---

# Frontend `pages/` — Map of Content

> The 7 top-level screens. The first four form the linear stepper (Setup → Progress →
> Review → Commit); the rest are sidebar-nav destinations. `App.tsx` switches on
> [[App State Context]]'s `view`.

## Stepper flow

- [[Setup Screen]] — pick layout, dirs, thresholds; starts `/scan` (`Setup.tsx`)
- [[Progress Screen]] — 5-phase stepper + live SSE stat tiles (`Progress.tsx`)
- [[Review Screen]] — tabbed media/cluster/borderline review; naming auto-enrolls (`Review.tsx`)
- [[Commit Screen]] — mandatory preview tree, then write to disk (`Commit.tsx`)

## Sidebar destinations

- [[Gallery Screen]] — character/artist list with prototype counts (`Gallery.tsx`)
- [[History Screen]] — DataGrid of past runs (`History.tsx`)
- [[Settings Screen]] — thresholds, GPU, reduced motion, Sentry opt-in (`Settings.tsx`)

## See also

- [[_HOME]] · [[02-Frontend/_index|Frontend overview]]
- [[App Shell]] · [[Per-Run Pipeline]] · [[Routing and Commit Flow]]
