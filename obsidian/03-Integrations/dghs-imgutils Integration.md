---
tags: [integration]
---

# dghs-imgutils Integration

> Offline ONNX vision toolkit that powers every ML call: CCIP identity embeddings, person detect/crop, WD14/PixAI tagging, ratings, the media-gate classifiers, and the LPIPS dedup confirmer.

## Used for

- [[Media Gate Phase]] — `validate` classifiers (ai-created, anime-vs-real, anime-classify)
- [[Identify Phase]] / [[Gallery Prototypes]] — [[CCIP]] embeddings + person detect/crop
- [[Tagging Phase]] — WD14 tags + PixAI char hint + ratings
- [[Nude Policy]] — `anime_dbrating_score` + `detect_censors`
- [[Dedup Phase]] — LPIPS gray-zone confirm

## Configuration

- Extra / dependency: `uv sync --extra ml` → `dghs-imgutils>=0.19.0` + `onnxruntime>=1.19` (large, optional)
- Env: `HF_HUB_OFFLINE=1` (set defensively by `_force_offline()`)
- CCIP model pinned to `ccip-caformer_b36-24`

## Wire-up

- `backend/app/engine/models.py` — the [[ML Facade]], the ONLY importer

## Auth mode

None (offline ONNX weights)

## Gotchas

- `has_ml()` gates every call; absent → deterministic [[Heuristic Fallback Pattern]] (16×16 colour embedding, gate assumes anime illustration, rating assumes SFW).
- imgutils' API shifts between releases — REPL-verify each signature.

## See also

- [[_index]]
- [[ONNX Runtime]]
- [[ML Facade Pattern]]
