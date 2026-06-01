---
tags: [backend, engine]
---

# Ingest Phase

> Scan the input tree, SHA-256 each image, record dimensions, and generate a thumbnail — the entry point of every run.

## Source

- `backend/app/engine/ingest.py` — primary implementation

## How it works

`scan_run` walks the input directory (optionally recursive), computes a streaming `_sha256` digest per file, reads `width`/`height` header-only via `PIL.Image` (no full decode), and upserts an `images` row plus a `run_images` link keyed by hash. For each image it calls `thumbs.ensure_thumb`. It `publish()`es `scan_start`/`scan_progress`/`scan_done` SSE events.

In-place safety drives the skip logic: it never descends into the `output_dir`, skips the reserved bucket names (`other`, `anime`, `nude`, `_unknown_artist`, `_unknown_character`), and skips any hash already committed in a `manifest` row. This makes re-runs idempotent ([[Content-Hash Idempotency]]).

## Depends on

- [[Thumbnail Cache]] — calls `ensure_thumb` per image
- [[SQLite Repository]] — writes `images` / `run_images`
- [[SSE Event Bus]] — progress events

## Used by

- [[Pipeline Orchestrator]] — first phase of the run
- [[FastAPI Server]] — `/scan` endpoint

## Gotchas

- Animated flag is detected here but recorded later by [[Dedup Phase]].

## See also

- [[_index]]
- [[Per-Run Pipeline]]
- [[Content-Hash Keying Pattern]]
