---
tags: [backend, engine]
---

# Routing and Commit

> Build each image's destination path from its facets, preview the tree read-only, then copy/move files and trash dedup losers at commit.

## Source

- `backend/app/engine/route.py` — primary implementation

## How it works

`build_dest` is the single config-driven path builder: non-anime → `other/`; `review` → `anime/`; anime with no character → `anime/`; one character → `<char>/`; 2+ → `<A> + <B> + …/` (alphabetical via `combined_folder`, cap 3 + `+N more`). `nude/` is always the innermost leaf. `sanitize` strips Windows-illegal characters and hash-truncates over-long components (`_MAX_COMPONENT = 110`).

`preview_run` is read-only — it aggregates the proposed folder tree and the dedup trash list without touching disk. `commit_run` moves files when in-place (else copies), `send2trash`-es `trashed` losers, moves artist sidecars alongside, de-duplicates colliding names, and writes the `manifest` row that makes future scans idempotent.

## Depends on

- [[Artist Facet]] — `artist_name` for the artist component
- [[Dedup Phase]] — `dup_role='trashed'` drives trashing
- [[SQLite Repository]] — `manifest` writes

## Used by

- [[Pipeline Orchestrator]]
- [[FastAPI Server]] — `/preview`, `/commit`

## Gotchas

- Over-long combined folders are truncated with an 8-char SHA-1 suffix to survive the Windows segment limit.

## See also

- [[_index]]
- [[Routing and Commit Flow]]
- [[Content-Hash Idempotency]]
