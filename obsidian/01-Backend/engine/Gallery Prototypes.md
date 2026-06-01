---
tags: [backend, engine]
---

# Gallery Prototypes

> The CCIP prototype gallery — the extensible character store that lets the system identify characters no tagger has ever seen.

## Source

- `backend/app/engine/gallery.py` — primary implementation

## How it works

`feature_of` extracts a CCIP feature from the **best single-character crop** (`_detect_best_box` → largest person box, falling back to head box, then the whole frame) — the biggest accuracy win on busy splash art. Features are stored as float32 BLOBs.

`get_or_create_character` and `add_prototype` persist into the `characters` / `prototypes` tables; `enroll_from_refs` builds a merged [[Prototype]] from reference images. `match` returns the nearest character (min distance over its prototypes) below the CCIP threshold, or `None`. Identity (CCIP "same character or not") is deliberately separate from naming.

## Depends on

- [[ML Facade]] — `ccip_extract`, `ccip_difference`, `ccip_merge`
- [[SQLite Repository]] — `characters` / `prototypes` tables

## Used by

- [[Identify Phase]] — match + tagger-bootstrap enroll
- [[Cluster Phase]] — enroll a named cluster

## See also

- [[_index]]
- [[CCIP]]
- [[Prototype]]
- [[Identity Resolution Flow]]
