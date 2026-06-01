---
tags: [frontend, pages]
---

# Progress Screen

> Live pipeline view: a 5-phase stepper, a per-phase progress bar, and SSE-fed stat tiles that auto-advance to Review when the run finishes.

## Source

- `frontend/src/pages/Progress.tsx` (`ProgressScreen`) — primary implementation

## How it works

On mount `ProgressScreen` opens exactly ONE `EventSource` via `api.events` ([[API Client]], [[SSE Progress Flow]]) and immediately calls `api.process` to start the worker pipeline. A `startedRef` guard prevents StrictMode double-start. The single `onEvent` handler routes the unnamed-channel events by their JSON `event` field: `phase` moves the `Stepper`, `*_progress` drives the `LinearProgress`, and the various `*_done` events feed the stat tiles (deduped / anime / other / identified / residual / nude).

The `PHASES` array (`dedup → gate → tag → identify → cluster`) maps event names to step labels. On `pipeline_done` it sets `done`, enabling the "Continue to Review" button; `pipeline_error` surfaces an `Alert`. The `EventSource` is closed on unmount.

## Depends on

- [[API Client]] — `events`, `process`
- [[App State Context]] — reads `run`, calls `setView`
- [[SSE Progress Flow]] — one EventSource, unnamed channel
- [[Per-Run Pipeline]] — the five phases shown

## Used by

- [[App Entry and Router]] — rendered when `view === "progress"`

## See also

- [[_index]]
- [[Review Screen]]
