"""Background pipeline orchestration.

Chains the engine phases for a run (dedup → gate → tag → identify → cluster) on a
worker thread, emitting SSE phase markers so the Progress screen can follow along.
The granular endpoints in ``server.py`` remain available for fine-grained control.
"""

from __future__ import annotations

import json
import traceback
from datetime import datetime, timezone

from .db import get_db
from .engine import cluster, dedup, gate, identify, tagging
from .events import publish

PHASES = ("dedup", "gate", "tag", "identify", "cluster")


def run_pipeline(run_id: str, layout: list[str]) -> None:
    db = get_db()
    db.execute(
        "UPDATE runs SET status='processing', layout=? WHERE run_id=?", (json.dumps(layout), run_id)
    )
    stats: dict = {}
    try:
        publish(run_id, "phase", name="dedup")
        stats["dedup"] = dedup.dedup_run(db, run_id)["stats"]

        publish(run_id, "phase", name="gate")
        stats["gate"] = gate.gate_run(db, run_id)

        publish(run_id, "phase", name="tag")
        stats["tag"] = tagging.tag_run(db, run_id)

        publish(run_id, "phase", name="identify")
        stats["identify"] = identify.identify_run(db, run_id, layout)

        if "character" in layout:
            publish(run_id, "phase", name="cluster")
            stats["cluster"] = cluster.cluster_run(db, run_id, "character")

        db.execute(
            "UPDATE runs SET status='review', stats_json=? WHERE run_id=?",
            (json.dumps(stats), run_id),
        )
        publish(run_id, "pipeline_done", stats=stats)
    except Exception as exc:  # pragma: no cover - surfaced to the UI + Sentry
        db.execute("UPDATE runs SET status='error' WHERE run_id=?", (run_id,))
        publish(run_id, "pipeline_error", message=str(exc), trace=traceback.format_exc())
    finally:
        db.execute(
            "UPDATE runs SET finished_at=? WHERE run_id=?",
            (datetime.now(timezone.utc).isoformat(), run_id),
        )
