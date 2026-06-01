---
tags: [backend, app]
---

# Database Schema

> The ~9 SQLite tables (WAL, FKs on) that hold all per-run state — joined on the image's SHA-256 `hash`.

## Source

- `backend/app/db.py` — the `SCHEMA` string

## How it works

`SCHEMA` is an idempotent `CREATE TABLE IF NOT EXISTS` script run on connect. The tables:

- `images` — the core row keyed by `hash` (SHA-256 PK): `src_path`, dims, `rating_json`/`nude`, `media_type`, `dup_group`/`dup_role`, `character_id`/`char_conf`/`char_names_json`, `ccip_feature` BLOB, artist columns, `source`, `char_hint`, `status`.
- `run_images` — `(run_id, hash)` membership of a run.
- `characters` + `prototypes` — the CCIP gallery; prototype `feature` is a 768-float32 BLOB.
- `artists` — reverse-lookup gallery, unique per `(platform, platform_uid)`.
- `clusters` — `(run_id, facet, hash)` → OPTICS `label`.
- `manifest` — committed per-image record (`src_path`→`dest_path`, `dup_action`).
- `runs` — run lifecycle (`status`, `layout`, `stats_json`, timestamps).
- `settings` — key/value JSON store for persisted overrides.

`images.hash` is the universal join key — the basis of [[Content-Hash Idempotency]]. Features are stored as raw float32 bytes.

## Depends on

- [[SQLite Repository]] — owns and applies this schema

## Used by

- every [[01-Backend/engine/_index|engine/ phase]] reads/writes these tables

## See also

- [[01-Backend/app/_index|app/ modules]]
- [[Content-Hash Keying Pattern]]
