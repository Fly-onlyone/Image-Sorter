---
tags: [frontend, store]
---

# App State Context

> Lightweight React Context holding the active screen and the active run that the Setup → Progress → Review → Commit flow shares.

## Source

- `frontend/src/store/AppState.tsx` — primary implementation

## How it works

`AppStateProvider` keeps two `useState` values — `view` (a `View` union of seven screens: `setup`, `progress`, `review`, `commit`, `gallery`, `history`, `settings`) and `run` (an `ActiveRun | null`). `ActiveRun` carries `runId`, `inputDir`, `outputDir`, `inPlace`, `layout` (a `Facet[]`), and `scanned`. The value is memoised and exposed through `useAppState()`, which throws if used outside the provider.

This is the project's entire client state layer — there is deliberately no Redux or Zustand, matching the single-user, seven-screen desktop scope. `view` drives the stepper and sidebar; `run` carries the scan result forward through the pipeline screens.

## Depends on

- [[API Client]] — supplies the `Facet` type used in `ActiveRun.layout`

## Used by

- [[App Entry and Router]] — wraps the tree and switches on `view`
- [[Setup Screen]] — sets `run` after a scan
- [[Progress Screen]]
- [[App Shell]]

## See also

- [[02-Frontend/store/_index|store]]
- [[Theme Context]]
