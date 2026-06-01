---
tags: [backend, app]
---

# SQLite Repository

> A hand-rolled, thread-safe SQLite wrapper (no ORM) — the single `Database` class that is the backend's source of truth.

## Source

- `backend/app/db.py` — primary implementation

## How it works

`Database` opens **one** `sqlite3` connection with `check_same_thread=False`, sets `row_factory = sqlite3.Row`, and guards every operation with a `threading.RLock` — fine for a single-user localhost sidecar whose endpoints run in FastAPI's threadpool ([[Hand-Rolled SQLite Repo Pattern]]). On construction it runs the idempotent `SCHEMA` script (`CREATE TABLE IF NOT EXISTS`, WAL mode, foreign keys on).

Low-level helpers are `execute`/`executemany`/`query`/`query_one` (all auto-commit under the lock). Settings helpers (`get_setting`/`set_setting`/`all_settings`) store JSON-encoded values in the `settings` table for the [[Config Layering Pattern]]. `get_db()` is a process-wide singleton created lazily from the active [[Settings Config]] `db_path`. Feature vectors are stored as raw float32 BLOBs.

## Depends on

- [[Settings Config]] — supplies `db_path`
- [[Database Schema]] — the tables it creates

## Used by

- [[FastAPI Server]] · [[Pipeline Orchestrator]] · every [[01-Backend/engine/_index|engine/ phase]]

## See also

- [[01-Backend/app/_index|app/ modules]]
- [[Content-Hash Idempotency]]
