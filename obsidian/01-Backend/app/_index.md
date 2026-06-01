---
tags: [moc, backend]
---

# Backend `app/` — Map of Content

> Module-level backend: the HTTP surface, pipeline orchestration, the SSE bus, the SQLite
> repo, settings, schemas, and the process entry point.

## Server & orchestration

- [[FastAPI Server]] — all HTTP endpoints, CORS, lifespan hooks (`server.py`)
- [[Pipeline Orchestrator]] — chains the phases on a worker thread + SSE markers (`jobs.py`)
- [[SSE Event Bus]] — per-run pub/sub that marshals onto the serving loop (`events.py`)

## State & config

- [[SQLite Repository]] — hand-rolled thread-safe repo, no ORM (`db.py`)
- [[Database Schema]] — the 9 SQLite tables keyed by content hash
- [[Settings Config]] — pydantic defaults + persisted overrides (`config.py`)
- [[API Schemas]] — pydantic request/response models (`schemas.py`)

## Boot & ops

- [[Sidecar Entry Point]] — free-port bind + `SIDECAR_PORT=` handshake (`__main__.py`)
- [[Sentry Setup]] — optional crash reporting (`sentry_setup.py`)

## See also

- [[_HOME]] · [[01-Backend/_index|Backend overview]]
- [[01-Backend/engine/_index|engine/ phases]]
