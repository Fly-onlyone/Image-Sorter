---
tags: [frontend, api]
---

# API Client

> Typed HTTP + SSE wrapper over the FastAPI sidecar whose base URL is resolved at runtime from the dynamically-assigned port — never hardcoded.

## Source

- `frontend/src/api/client.ts` — primary implementation

## How it works

`resolveBase()` resolves the sidecar origin in strict order: injected `window.__SIDECAR_URL__` → `invoke('sidecar_url')` (Tauri) → the `/api` Vite proxy (dev) → `127.0.0.1:8770` (fallback). `base()` memoises the first result in `_base`. Calling `api.ready()` at startup awaits and caches the base so the synchronous `thumbUrl()` / `imageUrl()` builders can read `_base` directly.

The exported `api` object wraps every sidecar endpoint (`scan`, `process`, `dedup`, `gate`, `tag`, `identify`, `cluster`, `preview`, `commit`, settings, gallery) through a JSON `req`/`post` helper. `events(run_id, handlers)` is the SSE `EventSource` factory: it opens `/jobs/<id>/events`, parses each unnamed message, and dispatches `data.event` to one `onEvent` handler ([[SSE Progress Flow]]).

## Depends on

- [[Dynamic Port Handshake]] — supplies the runtime port the base URL resolves from
- [[Tauri Shell]] — provides the `sidecar_url` command
- [[FastAPI Server]] — the endpoints every method calls

## Used by

- [[Setup Screen]]
- [[Progress Screen]]
- [[App Shell]]

## See also

- [[02-Frontend/api/_index|api]]
- [[App State Context]]
- [[SSE Progress Flow]]
