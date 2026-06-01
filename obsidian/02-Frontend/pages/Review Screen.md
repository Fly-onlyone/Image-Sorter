---
tags: [frontend, pages]
---

# Review Screen

> The heart of the app: a four-tab review surface (media, unknown clusters, borderline chars, borderline nude) where naming a cluster auto-enrolls a character.

## Source

- `frontend/src/pages/Review.tsx` (`ReviewScreen`) — primary implementation

## How it works

On load `ReviewScreen` fetches both `api.getReview` and `api.getClusters(runId, "character")` in parallel ([[API Client]]). Four `Tabs` carry `Badge` counts: **Media review** (reassign anime/other via `api.mediaReassign`), **Unknown clusters**, **Borderline chars**, and **Borderline nude**. Thumbnails come from `api.thumbUrl` and render in a flat neutral `ImageList` grid.

The signature action is in tab 1: typing a name and clicking "Name & enroll" calls `api.nameCluster`, which enrolls a [[Prototype]] for that character and removes the cluster from the list ([[Identity Resolution Flow]]). Cluster cards animate in via [[Scroll Reveal]]. "Continue to Commit" advances the stepper through [[App State Context]].

## Depends on

- [[API Client]] — `getReview`, `getClusters`, `mediaReassign`, `nameCluster`, `thumbUrl`
- [[App State Context]] — `run`, `setView`
- [[Scroll Reveal]] — staggered cluster reveal
- [[Identity Resolution Flow]] — naming auto-enrolls

## Used by

- [[App Entry and Router]] — rendered when `view === "review"`

## Gotchas

- The thumbnail grid stays FLAT NEUTRAL (no glass/glow) so images read true; see [[App Shell]]'s dialled-down `RIBBON_INTENSITY`.
- MUI v9 `Stack` needs `alignItems`/`justifyContent` via `sx`.

## See also

- [[_index]]
- [[Commit Screen]]
- [[CCIP]]
