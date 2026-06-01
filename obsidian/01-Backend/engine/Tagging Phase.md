---
tags: [backend, engine]
---

# Tagging Phase

> Cache rating + a primary character-name hint for every anime image, feeding identify and the nude decision.

## Source

- `backend/app/engine/tagging.py` — primary implementation

## How it works

`tag_run` runs only on `media_type='anime'` images (skipping cached rows with an existing `rating_json`). For each image it pulls WD14 tags (`models.wd14_tags`) and PixAI-Tagger character tags (`models.pixai_char_tags`). `_best_char_hint` picks the highest-confidence character name from PixAI (falling back to WD14's weak character head) when it clears `char_threshold`.

It then delegates the nude/rating decision to [[Nude Policy]] (`rating.rate_image`) and writes `rating_json`, `nude`, and `char_hint` back to the `images` row. The `char_hint` becomes the tagger-bootstrap seed used by [[Identify Phase]].

## Depends on

- [[ML Facade]] — WD14 + PixAI tags
- [[Nude Policy]] — `rate_image`
- [[Settings Config]] — `char_threshold`

## Used by

- [[Pipeline Orchestrator]]
- [[Identify Phase]] — consumes `char_hint`

## See also

- [[_index]]
- [[Per-Run Pipeline]]
- [[Facet]]
