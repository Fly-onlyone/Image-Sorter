---
tags: [backend, engine]
---

# Media Gate Phase

> Classify each image as anime art, other drawing/photo, or review — so non-anime images never waste downstream ML.

## Source

- `backend/app/engine/gate.py` — primary implementation

## How it works

`gate_run` runs a short-circuiting classifier chain per image (skipping `trashed` losers), run *after* [[Dedup Phase]] and *before* character classification:

1. `ai_created_score > gate_ai_max` → `other` (AI-generated).
2. `anime_real_score < gate_anime_min` → `other` (real photo).
3. `anime_classify_scores`: `illustration ≥ gate_illustration_min` → `anime`; else a strong `_OTHER_LABELS` score (`comic`/`bangumi`/`3d`/`not_painting`) → `other`; otherwise → `review`.

It sets `images.media_type` ∈ {anime, other, review} plus `media_scores_json`, and caches by hash (already-decided rows are reused). Borderline cases land in `review` for the Media-review tab.

## Depends on

- [[ML Facade]] — all classifier scores
- [[Settings Config]] — gate thresholds

## Used by

- [[Pipeline Orchestrator]]
- [[Tagging Phase]] / [[Identify Phase]] — only run on `media_type='anime'`
- [[Routing and Commit]] — `other`/`review` routing

## Gotchas

- imgutils has no anime-vs-western-cartoon model, so some western cartoons pass as `illustration` and reach `review`.

## See also

- [[_index]]
- [[Per-Run Pipeline]]
