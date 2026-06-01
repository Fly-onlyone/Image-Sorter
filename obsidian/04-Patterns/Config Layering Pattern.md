---
tags: [pattern]
---

# Config Layering Pattern

> Pydantic env defaults sit at the bottom; persisted DB overrides layer on top; read everything through one cached accessor.

## When to apply

Reading or adding any runtime-configurable value (ports, thresholds, API keys, theme, opt-ins).

## The pattern

```python
# config.py
class Settings(BaseSettings):           # pydantic-settings, env_prefix="IMGSORT_"
    port: int = 8770
    ...

@lru_cache
def get_settings() -> Settings:
    base = Settings()                    # env / defaults
    return _apply_overrides(base, db.query("SELECT key,value FROM settings"))
```

Defaults come from env (`IMGSORT_*`); user changes persist in the SQLite `settings` table via `PATCH /settings`.

## Why

Two clean layers: ops can set env vars without touching the DB, and per-user changes survive restarts in SQLite. The cached [[Settings Config]] accessor keeps reads cheap everywhere.

## Don't

- Don't read env vars directly in engine code — go through `get_settings()`.
- Don't hardcode a port or threshold — make it a `Settings` field with a DB override.

## See also

- [[_index]]
- [[Settings Config]]
- [[Hand-Rolled SQLite Repo Pattern]]
- [[Database Schema]]
