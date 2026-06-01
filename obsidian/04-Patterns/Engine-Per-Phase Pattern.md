---
tags: [pattern]
---

# Engine-Per-Phase Pattern

> Each pipeline stage is its own `engine/x.py` exposing a single `<phase>_run()` that reads/writes hash-keyed SQLite rows and publishes progress.

## When to apply

Adding or modifying a stage of the per-run pipeline (scan, dedup, gate, identify, cluster, route).

## The pattern

```python
# engine/cluster.py
def cluster_run(db, run_id, ...) -> dict:
    publish(run_id, "phase", name="cluster")
    rows = db.query("SELECT hash, ... FROM images WHERE run_id=?", (run_id,))
    # ... mutate rows keyed by SHA-256 hash ...
    return {"clustered": n}
```

Wire it in [[Pipeline Orchestrator]] (`jobs.py::run_pipeline`); add an optional granular `POST` endpoint in `server.py` (the tests drive those).

## Why

Uniform signature + SQLite-as-truth keeps phases composable and independently testable. The granular endpoints exist so tests exercise one phase at a time without running the whole chain.

## Don't

- Don't bury phase logic in `jobs.py` — keep it in its own module.
- Don't pass state between phases in memory — persist to hash-keyed rows so reruns are idempotent ([[Content-Hash Keying Pattern]]).

## See also

- [[_index]]
- [[Pipeline Orchestrator]]
- [[Per-Run Pipeline]]
- [[SSE Pub-Sub Pattern]]
