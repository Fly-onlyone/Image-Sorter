---
tags: [pattern]
---

# Hand-Rolled SQLite Repo Pattern

> One `Database` class wraps a single locked `sqlite3` connection with raw SQL — no ORM, no second connection.

## When to apply

Any backend read or write to persistent state. Use [[SQLite Repository]]'s `query` / `query_one` / `execute`.

## The pattern

```python
class Database:
    def __init__(self, path):
        self._conn = sqlite3.connect(path, check_same_thread=False)  # WAL mode
        self._lock = RLock()
    def query(self, sql, params=()):
        with self._lock:
            return self._conn.execute(sql, params).fetchall()
```

Schema lives in an idempotent `SCHEMA` string (`CREATE TABLE IF NOT EXISTS`). Feature vectors are stored as raw `float32` byte BLOBs.

## Why

FastAPI runs endpoints in a threadpool; `check_same_thread=False` + an `RLock` lets that one connection be shared safely, while WAL keeps reads concurrent. This is a single-user localhost app — an ORM would be over-altitude.

## Don't

- Don't add an ORM — direct SQL is the intended altitude.
- Don't open a second connection — serialize through the one locked instance.
- Don't store vectors as JSON — use `float32` BLOBs.

## See also

- [[_index]]
- [[SQLite Repository]]
- [[Database Schema]]
- [[Config Layering Pattern]]
