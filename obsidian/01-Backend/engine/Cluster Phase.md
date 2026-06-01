---
tags: [backend, engine]
---

# Cluster Phase

> Group the still-unidentified residual images into unnamed clusters so the user can name a brand-new character once.

## Source

- `backend/app/engine/cluster.py` — primary implementation

## How it works

`cluster_run` selects the [[Residual]] rows (anime, no `character_id`, no multi-char names, `status='review'`), reusing the cached `ccip_feature` from [[Identify Phase]] (or re-extracting via `gallery.feature_of`). It runs OPTICS over those features (`models.ccip_cluster`, `min_samples=5`), discards noise (label `< 0`), and writes the rest into the `clusters` table keyed by `(run_id, facet, label, hash)`.

`name_cluster` is the learning step: it `get_or_create_character`, merges all cluster features into one [[Prototype]] (`models.ccip_merge`), enrolls it via [[Gallery Prototypes]], and flips every member to `status='identified'` with `source='cluster'`. This is how an unseen character is learned.

## Depends on

- [[ML Facade]] — `ccip_cluster`, `ccip_merge`
- [[Gallery Prototypes]] — enroll named cluster
- [[SQLite Repository]] — `clusters` table

## Used by

- [[Pipeline Orchestrator]]
- [[FastAPI Server]] — `/cluster` + name-cluster endpoints

## See also

- [[_index]]
- [[Identity Resolution Flow]]
- [[Prototype]]
