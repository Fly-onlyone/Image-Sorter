---
tags: [frontend, pages]
---

# Commit Screen

> Final step: shows a mandatory read-only preview of the proposed folder tree and trash count, and only writes to disk after explicit confirmation.

## Source

- `frontend/src/pages/Commit.tsx` (`CommitScreen`) — primary implementation

## How it works

On mount `CommitScreen` calls `api.preview(runId)` ([[API Client]]) to fetch a `PreviewResult` — the proposed `tree` of destination folders (each with a count and sample thumbnails), the `trash_count` headed to the Recycle Bin, and the `in_place` MOVE-vs-copy flag. Nothing touches disk during preview ([[Routing and Commit Flow]]).

`confirm()` calls `api.commit(runId, "auto")`, which performs the copy/move and trashing, then renders a "Done" summary with per-bucket counts and an "Open output folder" button (via [[Platform Utilities]]'s `openPath`). The primary action uses [[Magnetic Button]]; a "Back to Review" button returns through [[App State Context]].

## Depends on

- [[API Client]] — `preview`, `commit`, `thumbUrl`
- [[App State Context]] — `run`, `setView`
- [[Platform Utilities]] — `openPath`
- [[Magnetic Button]] — confirm action
- [[Routing and Commit Flow]] — preview/commit semantics

## Used by

- [[App Entry and Router]] — rendered when `view === "commit"`

## Gotchas

- MUI v9 `Stack` needs `alignItems`/`justifyContent` via `sx`.

## See also

- [[_index]]
- [[Review Screen]]
