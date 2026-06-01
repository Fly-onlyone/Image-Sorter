---
tags: [moc, backend]
---

# Backend `engine/` — Map of Content

> One module per pipeline phase, each exposing a `<phase>_run(db, run_id, …) -> dict`
> that reads/writes SQLite rows keyed by hash and `publish()`es SSE progress. See
> [[Engine-Per-Phase Pattern]].

## Pipeline phases (in order)

- [[Ingest Phase]] — scan + SHA-256 hash + thumbnail (`ingest.py`)
- [[Dedup Phase]] — exact SHA → phash near-dup → optional LPIPS (`dedup.py`)
- [[Media Gate Phase]] — anime vs other vs review classification chain (`gate.py`)
- [[Tagging Phase]] — rating + character-name hints (`tagging.py`)
- [[Identify Phase]] — per-facet identity resolution (`identify.py`)
- [[Cluster Phase]] — OPTICS over residual unidentified images (`cluster.py`)
- [[Routing and Commit]] — dest-path builder + copy/move + trash (`route.py`)

## Supporting modules

- [[ML Facade]] — the only importer of `dghs-imgutils` + heuristic fallback (`models.py`)
- [[Gallery Prototypes]] — CCIP prototype enrollment + best-crop extraction (`gallery.py`)
- [[Artist Facet]] — metadata-sidecar artist ID + reverse-lookup fallback (`artist.py`)
- [[Nude Policy]] — binary nudity rating + censor escalation (`rating.py`)
- [[Thumbnail Cache]] — 256px WEBP cache keyed by hash (`thumbs.py`)

## See also

- [[_HOME]] · [[01-Backend/_index|Backend overview]]
- [[Per-Run Pipeline]] · [[Identity Resolution Flow]]
