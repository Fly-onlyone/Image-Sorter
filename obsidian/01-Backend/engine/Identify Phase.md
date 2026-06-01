---
tags: [backend, engine]
---

# Identify Phase

> Resolve per-image identity for each facet: match characters against the gallery, auto-enroll tagger hints, and pair the artist facet.

## Source

- `backend/app/engine/identify.py` — primary implementation

## How it works

`identify_run` runs on `media_type='anime'` images. For the character [[Facet]], `_resolve_characters` extracts a CCIP feature from the best crop, then matches against gallery [[Prototype]]s. When 2+ significant person boxes are detected it matches each crop independently for multi-character naming.

Resolution order per image: detect-crop → [[Gallery Prototypes]] match → tagger-hint auto-bootstrap (when no match but `char_hint` exists, it creates the character and enrolls the crop) → [[Residual]]. Results band into `identified` / `review` (match above `comfortable` distance) / residual. The artist facet delegates to [[Artist Facet]]. Writes `character_id`, `char_conf`, `char_names_json`, `ccip_feature`, `source`, `status`.

## Depends on

- [[Gallery Prototypes]] — `match` / `add_prototype` / `get_or_create_character`
- [[ML Facade]] — CCIP extract, person detection, threshold
- [[Artist Facet]] — `resolve_for_image`

## Used by

- [[Pipeline Orchestrator]]
- [[Cluster Phase]] — clusters the residual it leaves

## See also

- [[_index]]
- [[Identity Resolution Flow]]
- [[CCIP]]
