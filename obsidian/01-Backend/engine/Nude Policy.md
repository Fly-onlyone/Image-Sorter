---
tags: [backend, engine]
---

# Nude Policy

> The binary nudity decision — explicit-only split, with censor detection escalating only when the explicit score is already borderline.

## Source

- `backend/app/engine/rating.py` — primary implementation

## How it works

`rate_image` reads `anime_dbrating_score` (the authoritative source) via [[ML Facade]]. The `BUCKET` map draws the line at `explicit` only — general/sensitive/questionable all map to `sfw`. `detect_censors` is run *only* when `explicit ≥ censor_review_floor`, avoiding an extra model pass on obviously-clean images, and only ever *escalates* toward nude.

`is_nude` is true when `explicit ≥ explicit_threshold`, or (under `strict_nude`) when censors fired. It also returns `needs_review` when the explicit score sits within 0.1 of the threshold or censors disagree with the rating. Returns `(scores, is_nude, needs_review)`.

## Depends on

- [[ML Facade]] — `db_rating_scores`, `count_censors`
- [[Settings Config]] — `explicit_threshold`, `censor_review_floor`, `strict_nude`

## Used by

- [[Tagging Phase]] — calls `rate_image` and stores `nude`
- [[Routing and Commit]] — `nude/` innermost leaf

## See also

- [[_index]]
- [[Routing and Commit Flow]]
