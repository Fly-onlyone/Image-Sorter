"""Media gate — anime art vs other drawing vs photo.

Short-circuiting chain of ``imgutils.validate`` classifiers run *after* dedup and
*before* character classification, so non-anime images never waste ML. Sets
``images.media_type`` ∈ {anime, other, review}. Low-confidence / borderline cases go
to ``review`` and surface in the Media-review tab; the correction is cached by hash.

Honest limit: imgutils has no dedicated anime-vs-western-cartoon model, so some
western cartoons may pass as ``illustration`` — those land in review.
"""

from __future__ import annotations

import json

from ..config import get_settings
from ..db import Database
from ..events import publish
from . import models

_OTHER_LABELS = ("comic", "bangumi", "3d", "not_painting")


def _classify_one(path: str, s) -> tuple[str, dict]:
    scores: dict[str, float] = {}

    ai = models.ai_created_score(path)
    scores["ai_created"] = ai
    if ai > s.gate_ai_max:
        return "other", {**scores, "reason": "ai_created"}

    anime = models.anime_real_score(path)
    scores["anime_real"] = anime
    if anime < s.gate_anime_min:
        return "other", {**scores, "reason": "real_photo"}

    cls = models.anime_classify_scores(path)
    scores["classify"] = cls
    illustration = cls.get("illustration", 0.0)
    if illustration >= s.gate_illustration_min:
        return "anime", {**scores, "reason": "illustration"}
    if max((cls.get(k, 0.0) for k in _OTHER_LABELS), default=0.0) >= s.gate_other_min:
        worst = max(_OTHER_LABELS, key=lambda k: cls.get(k, 0.0))
        return "other", {**scores, "reason": worst}
    return "review", {**scores, "reason": "low_confidence"}


def gate_run(db: Database, run_id: str) -> dict:
    s = get_settings()
    rows = db.query(
        "SELECT i.hash, i.src_path, i.media_type FROM images i "
        "JOIN run_images r ON r.hash = i.hash "
        "WHERE r.run_id = ? AND (i.dup_role IS NULL OR i.dup_role != 'trashed')",
        (run_id,),
    )
    total = len(rows)
    publish(run_id, "gate_start", total=total)

    counts = {"anime": 0, "other": 0, "review": 0, "cached": 0}
    for idx, r in enumerate(rows):
        if r["media_type"] in ("anime", "other"):
            counts["cached"] += 1
            counts[r["media_type"]] += 1
            continue
        media_type, scores = _classify_one(r["src_path"], s)
        db.execute(
            "UPDATE images SET media_type=?, media_scores_json=? WHERE hash=?",
            (media_type, json.dumps(scores), r["hash"]),
        )
        counts[media_type] += 1
        if idx % 10 == 0 or idx == total - 1:
            publish(run_id, "gate_progress", done=idx + 1, total=total, **counts)

    publish(run_id, "gate_done", **counts)
    return counts
