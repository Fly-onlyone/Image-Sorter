---
tags: [backend, app]
---

# SSE Event Bus

> A tiny in-process per-run pub/sub that marshals worker-thread events onto the serving loop for SSE delivery.

## Source

- `backend/app/events.py` — primary implementation

## How it works

Each run keys a `set` of `asyncio.Queue` subscribers in `_subscribers`. `subscribe(run_id)`/`unsubscribe(...)` manage queues for the `GET /jobs/{run_id}/events` stream. Engine code running in worker threads calls `publish(run_id, event, **data)`, which builds `{"event": event, **data}` and hops onto the serving loop via `_loop.call_soon_threadsafe(_dispatch, ...)` ([[SSE Pub-Sub Pattern]]). `bind_loop(loop)` captures that loop in the lifespan hook.

`format_sse` emits on the **unnamed** SSE channel (`data: {...}\n\n`), with the event type carried inside the JSON `event` field — so the frontend uses a single `EventSource.onmessage` handler for every event type.

## Depends on

- (none — pure stdlib pub/sub)

## Used by

- [[Pipeline Orchestrator]] — publishes phase markers
- [[FastAPI Server]] — `bind_loop` + the events stream
- [[API Client]] — consumes the stream

## Gotchas

- If `_loop` is unset/closed, `publish` dispatches synchronously — only relevant outside a running server (e.g. tests).

## See also

- [[01-Backend/app/_index|app/ modules]]
- [[SSE Progress Flow]]
