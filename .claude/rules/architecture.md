# Architecture

Image Sorter is a two-process desktop app: a **Tauri v2 Rust shell** hosting a React/MUI
WebView, talking over localhost HTTP+SSE to a **Python FastAPI sidecar** that runs the
vision/ML engine. All ML is offline ONNX (`dghs-imgutils`); state is SQLite.

## System Design

```
┌──────────────────────── Tauri v2 (Rust shell, frontend/src-tauri) ─────────────────────┐
│  React 18 + Vite + MUI v9 WebView                                                       │
│     src/api/client.ts ──HTTP + SSE──►  127.0.0.1 : <dynamic free port>                  │
│  lib.rs spawns the sidecar, reads SIDECAR_PORT from stdout, exposes `sidecar_url`,      │
│  kills it on exit.                                                                      │
│  ┌──────────────────── FastAPI sidecar (backend/app, uv) ───────────────────────────┐  │
│  │  server.py (endpoints) → jobs.py (pipeline) → engine/*.py                         │  │
│  │  engine/models.py = single ML facade over dghs-imgutils (+ heuristic fallback)    │  │
│  │  db.py = hand-rolled SQLite repo (one connection + lock)                          │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

The frontend never hardcodes a port (PLAN-era §17F handshake): `__main__.py` binds
`("127.0.0.1", 0)` for an OS-assigned free port and prints `SIDECAR_PORT=<n>`; `lib.rs`
parses it and serves it through the `sidecar_url` command; `api/client.ts` resolves the base
URL as `window.__SIDECAR_URL__` → `invoke('sidecar_url')` → `/api` Vite proxy (dev) →
`127.0.0.1:8770` (fallback).

The sidecar binds loopback only, and CORS (`server.py`) is locked to the Tauri WebView origins
(`tauri://localhost`, `http://tauri.localhost`) plus dev/loopback via `allow_origin_regex` — not
`*` — so an arbitrary local web page can't drive it even if it guesses the port. Browser dev is
unaffected (requests go through the Vite `/api` proxy server-side, not browser CORS).
`tests/test_cors.py` guards the allowlist.

## Data Flow — the per-run pipeline

Everything is keyed by the image's **SHA-256 content hash** (idempotency + cross-run cache).

1. **scan** (`engine/ingest.py`) — walk input, hash, record `width/height`, generate
   thumbnails. Skips reserved output buckets + manifested hashes (in-place safety).
2. **dedup** (`engine/dedup.py`) — SHA exact → `imagehash.phash` near-dup union-find →
   optional LPIPS confirm. Keep max `width*height`; losers flagged `dup_role='trashed'`.
3. **media gate** (`engine/gate.py`) — `aicheck → anime_real → anime_classify` chain sets
   `media_type` ∈ {anime, other, review}.
4. **identify** (`engine/identify.py` + `gallery.py`) — detect-crop → CCIP gallery match →
   tagger-hint auto-enroll → residual. Artist facet via `artist.py` (metadata sidecars).
5. **cluster** (`engine/cluster.py`) — OPTICS over residual; naming a cluster auto-enrolls it.
6. **preview** (`engine/route.py::preview_run`) — read-only proposed tree + dedup/gate routes.
7. **commit** (`engine/route.py::commit_run`) — copy (or move when output==input); losers →
   `send2trash`; writes the `manifest`.

`jobs.py::run_pipeline` chains steps 2–5 on a worker thread; the granular `POST /dedup`,
`/gate`, `/tag`, `/identify`, `/cluster` endpoints run the same functions and are what the
tests drive.

## Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Sidecar lifecycle | spawn/port-handshake/teardown | `frontend/src-tauri/src/lib.rs` |
| Free-port entry | bind port 0, print handshake, run uvicorn | `backend/app/__main__.py`, `run.py` |
| Endpoints | FastAPI routes (PLAN §8) | `backend/app/server.py` |
| Pipeline orchestration | chained phases + SSE phase markers | `backend/app/jobs.py` |
| ML facade | only place that imports imgutils; fallback | `backend/app/engine/models.py` |
| Routing / commit | dest-path builder, copy/move, trash | `backend/app/engine/route.py` |
| SSE bus | thread-safe pub/sub per run | `backend/app/events.py` |
| Persistence | SQLite schema + repo layer | `backend/app/db.py` |
| API client | base-URL resolution + SSE | `frontend/src/api/client.ts` |
| Theme factory | 11 presets → MUI theme + tokens | `frontend/src/theme/` |

## State Management

- **Backend** — SQLite is the source of truth (`db.py`, one `sqlite3` connection guarded by
  an `RLock`, WAL mode). Runtime config = `config.py` defaults (env `IMGSORT_*`) layered with
  the `settings` key/value table (user overrides via `PATCH /settings`). App data lives under
  `%LOCALAPPDATA%/ImageSorter` (DB, thumbnail cache, model cache).
- **Frontend** — React context only (no Redux/Zustand): `store/AppState.tsx` holds the active
  run + current view; `theme/ThemeContext.tsx` holds the active theme (persisted to
  localStorage + mirrored to the backend `settings`). Progress is event-driven via one
  `EventSource` per run.

## External Integrations

| Service | Purpose | Configuration |
|---------|---------|---------------|
| `dghs-imgutils` + onnxruntime | CCIP / tagging / rating / gate / LPIPS (offline ONNX) | optional `uv sync --extra ml`; `HF_HUB_OFFLINE=1` |
| SauceNAO / IQDB / ascii2d | artist reverse-image lookup (residual only) | API key in `settings`, throttled |
| Sentry | sidecar crash reporting | `IMGSORT_SENTRY_DSN` + `settings['sentry_opt_in']` |

## Module Dependencies (backend)

```
server.py ─► jobs.py ─► engine/{dedup,gate,tagging,identify,cluster,route}.py
   │            │            └─► engine/gallery.py ─► engine/models.py  (ML facade)
   │            └─► events.py (SSE)                      └─► dghs-imgutils (lazy, optional)
   └─► db.py (all engine modules read/write here)   config.py (settings, read everywhere)
```

## Testing Strategy

The heuristic fallback in `models.py` lets the full pipeline run with **no ONNX models**, so
the suite exercises scan→dedup→gate→identify→preview→commit end-to-end via FastAPI's
`TestClient`.

| Test Type | Location | Run Command |
|-----------|----------|-------------|
| Pipeline / unit | `tests/test_pipeline.py` | `uv run pytest -q` |
| Single test | — | `uv run pytest tests/test_pipeline.py::test_full_pipeline -q` |

Synthetic test images must have **spatial content** (gradients/patterns), not flat colours —
a flat image has no frequency content so every flat image shares one perceptual hash and dedup
collapses them all.
