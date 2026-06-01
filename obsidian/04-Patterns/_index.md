---
tags: [moc, patterns]
---

# Patterns — Map of Content

> The non-obvious conventions that keep this single-user localhost app at the right
> altitude — direct functions + SQLite + React context, no DI/ORM/Redux.

## Backend

- [[ML Facade Pattern]] — single gateway over `dghs-imgutils`, never import it elsewhere
- [[Heuristic Fallback Pattern]] — deterministic stand-ins when ML weights are absent
- [[Engine-Per-Phase Pattern]] — one `engine/x.py` with `<phase>_run()` per pipeline stage
- [[Hand-Rolled SQLite Repo Pattern]] — one locked connection, raw SQL, no ORM
- [[SSE Pub-Sub Pattern]] — thread → serving-loop event marshalling on one channel
- [[Config Layering Pattern]] — pydantic env defaults under persisted DB overrides
- [[Content-Hash Keying Pattern]] — SHA-256 as the primary key for everything

## Frontend

- [[Theme Factory Pattern]] — typed preset → MUI theme + token bag; map states to slots
- [[Reduced-Motion Gating Pattern]] — every animation respects the accessibility gate

## See also

- [[_HOME]]
- [[ML Facade]] · [[SQLite Repository]] · [[SSE Event Bus]] · [[Theme Factory]]
