"""Tagging + rating cache (``/tag``).

Runs only on ``media_type='anime'`` images. WD14 supplies rating + general tags;
PixAI-Tagger v0.9 supplies the primary character-name hint (falling back to WD14's
weak character head). Results are cached on ``images`` so re-runs hit the cache.
"""

from __future__ import annotations

import json

from ..config import get_settings
from ..db import Database
from ..events import publish
from . import models, rating


def _best_char_hint(
    pixai: dict[str, float], wd14_chars: dict[str, float], floor: float
) -> str | None:
    pool = pixai or wd14_chars
    if not pool:
        return None
    name, conf = max(pool.items(), key=lambda kv: kv[1])
    return name if conf >= floor else None


def tag_run(db: Database, run_id: str) -> dict:
    s = get_settings()
    rows = db.query(
        "SELECT i.hash, i.src_path, i.rating_json FROM images i "
        "JOIN run_images r ON r.hash = i.hash "
        "WHERE r.run_id = ? AND i.media_type = 'anime'",
        (run_id,),
    )
    total = len(rows)
    publish(run_id, "tag_start", total=total)

    tagged = cached = nude = 0
    for idx, r in enumerate(rows):
        if r["rating_json"]:
            cached += 1
            continue
        path = r["src_path"]
        _, _general, wd14_chars = models.wd14_tags(path)
        pixai = models.pixai_char_tags(path)
        char_hint = _best_char_hint(pixai, wd14_chars, s.char_threshold)

        scores, is_nude, _needs_review = rating.rate_image(path, s)
        db.execute(
            "UPDATE images SET rating_json=?, nude=?, char_hint=? WHERE hash=?",
            (json.dumps(scores), int(is_nude), char_hint, r["hash"]),
        )
        tagged += 1
        nude += int(is_nude)
        if idx % 10 == 0 or idx == total - 1:
            publish(run_id, "tag_progress", done=idx + 1, total=total, tagged=tagged, nude=nude)

    stats = {"tagged": tagged, "cached": cached, "nude": nude}
    publish(run_id, "tag_done", **stats)
    return stats
