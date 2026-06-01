---
tags: [frontend, pages]
---

# Setup Screen

> The "New Run" form where you pick layout, source/output folders, dedup/nude/engine options, then kick off `/scan`.

## Source

- `frontend/src/pages/Setup.tsx` (`SetupScreen`) — primary implementation

## How it works

`SetupScreen` is the first step of the run stepper. It collects local state for the chosen layout (`character` / `artist` / combined `Facet` arrays), input/output dirs, recursion, dedup distance, strict-nude and explicit thresholds, GPU, and an optional SauceNAO key. The inner `FolderField` opens a native folder picker via [[Platform Utilities]]'s `pickDirectory`.

`start()` first persists the threshold/engine choices through `api.patchSettings`, then calls `api.scan` ([[API Client]]). On success it writes the run into [[App State Context]] via `setRun` and flips `view` to `progress`, advancing the stepper. When output equals input the screen flags an in-place MOVE warning ([[Routing and Commit Flow]]).

## Depends on

- [[API Client]] — `scan`, `patchSettings`
- [[App State Context]] — `setRun`, `setView`
- [[Platform Utilities]] — native folder picker
- [[Magnetic Button]] — the "Start run" action
- [[Facet]] — layout is a list of facets

## Used by

- [[App Entry and Router]] — rendered when `view === "setup"`

## Gotchas

- MUI v9 `Stack` dropped `alignItems`/`justifyContent` props — they are passed via `sx`.

## See also

- [[_index]]
- [[Per-Run Pipeline]]
- [[Progress Screen]]
