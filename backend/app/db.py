"""SQLite schema + a small hand-rolled repository layer (no SQLAlchemy).

Holds the per-image results, character/artist galleries, run manifest, and the
media-gate / dedup columns, plus a ``settings`` key/value table for persisted
user overrides.
"""

from __future__ import annotations

import json
import sqlite3
import threading
from pathlib import Path
from typing import Any, Iterable

SCHEMA = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS images (
    hash TEXT PRIMARY KEY,
    src_path TEXT,
    width INTEGER, height INTEGER,
    rating_json TEXT, nude INTEGER DEFAULT 0,
    media_type TEXT,                 -- 'anime' | 'other' | 'review'
    media_scores_json TEXT,
    dup_group TEXT, dup_role TEXT,    -- 'keep' | 'trashed' | 'unique'
    character_id INTEGER, char_conf REAL,
    char_names_json TEXT, -- 2+ resolved characters → combined folder
    ccip_feature BLOB,               -- cached 768-float32 feature (reused by clustering)
    artist_id INTEGER, artist_conf REAL,
    artist_source TEXT,              -- 'metadata'|'lookup'|'style_cluster'|'manual'
    source TEXT,                     -- 'gallery'|'tagger'|'cluster'|'manual'
    char_hint TEXT,
    status TEXT DEFAULT 'pending'    -- 'pending'|'identified'|'review'|'committed'
);

CREATE TABLE IF NOT EXISTS run_images (
    run_id TEXT, hash TEXT,
    PRIMARY KEY (run_id, hash)
);

CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE, series TEXT, alias TEXT
);

CREATE TABLE IF NOT EXISTS prototypes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    feature BLOB,                    -- 768 float32 bytes
    outfit TEXT, src_image TEXT, created_at TEXT,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT, platform_uid TEXT,
    name TEXT, alias TEXT,
    UNIQUE (platform, platform_uid)
);

CREATE TABLE IF NOT EXISTS clusters (
    run_id TEXT, facet TEXT, label INTEGER, hash TEXT,
    PRIMARY KEY (run_id, facet, hash)
);

CREATE TABLE IF NOT EXISTS manifest (
    run_id TEXT, hash TEXT,
    src_path TEXT, dest_path TEXT,
    character TEXT, char_conf REAL,
    artist TEXT, artist_conf REAL,
    rating_json TEXT, nude INTEGER, layout TEXT,
    media_type TEXT, dup_action TEXT,   -- 'copy'|'move'|'trash'|'skip'
    PRIMARY KEY (run_id, hash)
);

CREATE TABLE IF NOT EXISTS runs (
    run_id TEXT PRIMARY KEY,
    input_dir TEXT, output_dir TEXT, in_place INTEGER,
    layout TEXT,
    started_at TEXT, finished_at TEXT,
    stats_json TEXT, status TEXT DEFAULT 'scanning'
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY, value TEXT
);
"""


class Database:
    """Thread-safe SQLite wrapper. One connection, guarded by a lock — fine for a
    single-user localhost sidecar where endpoints run in the threadpool."""

    def __init__(self, path: Path) -> None:
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._lock = threading.RLock()
        self._conn.executescript(SCHEMA)
        self._conn.commit()

    # ── low-level ─────────────────────────────────────────────────────────
    def execute(self, sql: str, params: Iterable[Any] = ()) -> sqlite3.Cursor:
        with self._lock:
            cur = self._conn.execute(sql, tuple(params))
            self._conn.commit()
            return cur

    def executemany(self, sql: str, seq: Iterable[Iterable[Any]]) -> None:
        with self._lock:
            self._conn.executemany(sql, [tuple(s) for s in seq])
            self._conn.commit()

    def query(self, sql: str, params: Iterable[Any] = ()) -> list[sqlite3.Row]:
        with self._lock:
            return self._conn.execute(sql, tuple(params)).fetchall()

    def query_one(self, sql: str, params: Iterable[Any] = ()) -> sqlite3.Row | None:
        rows = self.query(sql, params)
        return rows[0] if rows else None

    def close(self) -> None:
        with self._lock:
            self._conn.close()

    # ── settings helpers ──────────────────────────────────────────────────
    def get_setting(self, key: str, default: Any = None) -> Any:
        row = self.query_one("SELECT value FROM settings WHERE key = ?", (key,))
        return json.loads(row["value"]) if row else default

    def set_setting(self, key: str, value: Any) -> None:
        self.execute(
            "INSERT INTO settings(key, value) VALUES(?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, json.dumps(value)),
        )

    def all_settings(self) -> dict[str, Any]:
        return {
            r["key"]: json.loads(r["value"]) for r in self.query("SELECT key, value FROM settings")
        }


_db: Database | None = None


def get_db() -> Database:
    """Process-wide singleton, created on first use from the active settings."""
    global _db
    if _db is None:
        from .config import get_settings

        _db = Database(get_settings().db_path)
    return _db
