"""Nude decision policy.

Binary split with the line at ``explicit`` only. ``anime_dbrating_score`` is the
authoritative source; ``detect_censors`` only ever *escalates* toward explicit, and
is run only when the explicit score is already above ``censor_review_floor`` to avoid
an extra model pass on obviously-clean images.
"""

from __future__ import annotations

from ..config import Settings
from . import models

BUCKET = {
    "general": "sfw",
    "sensitive": "sfw",
    "questionable": "sfw",
    "explicit": "nude",
}


def rate_image(path: str, s: Settings) -> tuple[dict[str, float], bool, bool]:
    """Returns ``(rating_scores, is_nude, needs_review)``."""
    scores = models.db_rating_scores(path)
    explicit = scores.get("explicit", 0.0)

    censor_hits = 0
    if explicit >= s.censor_review_floor:
        censor_hits = models.count_censors(path)

    is_nude = explicit >= s.explicit_threshold or (s.strict_nude and censor_hits >= 1)

    # Borderline Nude review band: near the threshold, or censors fired but the
    # rating disagrees.
    near = abs(explicit - s.explicit_threshold) <= 0.1
    disagree = censor_hits >= 1 and explicit < s.explicit_threshold
    needs_review = near or disagree
    return scores, is_nude, needs_review
