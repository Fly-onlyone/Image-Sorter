---
tags: [moc, backend]
---

# Backend — Map of Content

> The Python FastAPI **sidecar** (`backend/app/`). The repo root *is* this uv project.
> Endpoints → pipeline orchestration → per-phase engine modules, all over a hand-rolled
> SQLite repo. Runs end-to-end with no ONNX weights thanks to the [[ML Facade]] fallback.

## Module-level (`app/`)
→ [[01-Backend/app/_index|app/ modules]] — server, jobs, events, db, config, schemas, entry point, Sentry, schema

## Pipeline phases (`engine/`)
→ [[01-Backend/engine/_index|engine/ phases]] — ingest, dedup, gate, tag, identify, cluster, gallery, route + the ML facade

## See also

- [[_HOME]]
- [[Per-Run Pipeline]] — the flow these modules implement
- [[02-Frontend/_index|Frontend]] — the WebView that drives these endpoints
