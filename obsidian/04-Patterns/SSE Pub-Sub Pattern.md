---
tags: [pattern]
---

# SSE Pub-Sub Pattern

> Worker threads `publish()` events that get marshalled onto the serving loop and emitted on one unnamed SSE channel, with the type inside the JSON.

## When to apply

Any time engine code (running on a worker thread) needs to report progress to the frontend.

## The pattern

```python
# worker thread (engine code)
publish(run_id, "phase_done", phase="dedup", count=42)
```

[[SSE Event Bus]] hops the payload onto the serving loop via `call_soon_threadsafe`, then emits it on the **unnamed** channel with `"type"` embedded in the JSON. The frontend uses a single `EventSource.onmessage` ([[SSE Progress Flow]]).

## Why

`call_soon_threadsafe` is required because the publish happens off the asyncio loop. Keeping every event on the unnamed channel means one handler receives all event types — no per-type listener registration to keep in sync.

## Don't

- Don't register named SSE listeners on the frontend — everything arrives via one `onmessage`.
- Don't emit from a worker thread without `publish()` — direct loop access from another thread is unsafe.

## See also

- [[_index]]
- [[SSE Event Bus]]
- [[SSE Progress Flow]]
- [[Engine-Per-Phase Pattern]]
