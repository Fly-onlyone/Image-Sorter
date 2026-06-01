---
tags: [backend, app]
---

# FastAPI Server

> The sidecar's HTTP+SSE surface — every endpoint the WebView calls, plus CORS and lifespan wiring.

## Source

- `backend/app/server.py` — primary implementation

## How it works

The `app` `FastAPI` instance registers routes for health/settings, `POST /scan`, the background `POST /process`, the SSE stream `GET /jobs/{run_id}/events`, the granular phases (`POST /dedup`,`/gate`,`/tag`,`/identify`,`/cluster`), review/gallery data, and `GET /preview/{run_id}` + `POST /commit`. CPU-bound engine calls go through `run_in_threadpool`.

The `lifespan` async context manager binds the serving loop into the [[SSE Event Bus]] (`events.bind_loop`), ensures data dirs, opens the [[SQLite Repository]], and calls `init_sentry()`. A permissive `CORSMiddleware` (`allow_origins=["*"]`) is fine because the sidecar is localhost-only and the WebView origin varies. `/scan` inserts a `runs` row; `/process` schedules the [[Pipeline Orchestrator]] via `BackgroundTasks`.

## Depends on

- [[Pipeline Orchestrator]] — `/process` schedules `run_pipeline`
- [[SSE Event Bus]] — `/jobs/{run_id}/events` streams published events
- [[SQLite Repository]] — all reads/writes
- [[API Schemas]] — request/response validation
- [[Settings Config]] — reads defaults for `/settings`
- [[Routing and Commit]] — `/preview` and `/commit`

## Used by

- [[API Client]]
- [[Tauri Shell]]

## See also

- [[01-Backend/app/_index|app/ modules]]
- [[Two-Process Architecture]]
- [[Per-Run Pipeline]]
