---
tags: [backend, app]
---

# Settings Config

> Runtime configuration — pydantic `Settings` (env prefix `IMGSORT_`) layered with persisted DB overrides.

## Source

- `backend/app/config.py` — primary implementation

## How it works

`Settings` (pydantic-settings, `env_prefix="IMGSORT_"`) declares every runtime knob with sane defaults: networking (`host`, `port=0` → OS picks a free one), storage `data_dir`, dedup thresholds, media-gate cutoffs, [[Nude Policy]] knobs, and identity (`ccip_model='ccip-caformer_b36-24'`, `char_threshold`). Derived paths (`db_path`, `thumbs_dir`, `models_dir`) and `ensure_dirs()` live under the app data dir.

`get_settings()` is `lru_cache`d, so env-derived defaults load once. App data defaults to `%LOCALAPPDATA%/ImageSorter` (falls back to `~/.local/share`). These defaults are the *base* layer — persisted user overrides come from the SQLite `settings` table and are merged on top by the `/settings` endpoints ([[Config Layering Pattern]]).

## Depends on

- (pydantic-settings only)

## Used by

- [[SQLite Repository]] — `db_path`
- [[FastAPI Server]] — `/settings` defaults
- [[Sidecar Entry Point]] — `host`/`port`
- [[ML Facade]] — `ccip_model`, thresholds

## See also

- [[01-Backend/app/_index|app/ modules]]
- [[Config Layering Pattern]]
