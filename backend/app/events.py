"""Per-run SSE event bus (``GET /jobs/{run_id}/events``).

A tiny in-process pub/sub: each run gets an ``asyncio.Queue`` per subscriber.
Engine code (which runs in worker threads) publishes via :func:`publish`, which
hops back onto the serving event loop with ``call_soon_threadsafe``.
"""

from __future__ import annotations

import asyncio
import json
from collections import defaultdict
from typing import Any

_subscribers: dict[str, set[asyncio.Queue]] = defaultdict(set)
_loop: asyncio.AbstractEventLoop | None = None


def bind_loop(loop: asyncio.AbstractEventLoop) -> None:
    global _loop
    _loop = loop


def subscribe(run_id: str) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _subscribers[run_id].add(q)
    return q


def unsubscribe(run_id: str, q: asyncio.Queue) -> None:
    _subscribers[run_id].discard(q)
    if not _subscribers[run_id]:
        _subscribers.pop(run_id, None)


def _dispatch(run_id: str, payload: dict[str, Any]) -> None:
    for q in list(_subscribers.get(run_id, ())):
        q.put_nowait(payload)


def publish(run_id: str, event: str, **data: Any) -> None:
    """Thread-safe publish. Safe to call from engine worker threads."""
    payload = {"event": event, **data}
    if _loop is None or _loop.is_closed():
        _dispatch(run_id, payload)
        return
    _loop.call_soon_threadsafe(_dispatch, run_id, payload)


def format_sse(payload: dict[str, Any]) -> str:
    # Emit as the default (unnamed) SSE channel so a single EventSource.onmessage
    # handler receives every event; the type travels in the JSON ``event`` field.
    return f"data: {json.dumps(payload)}\n\n"
