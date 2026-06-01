---
tags: [backend, engine]
---

# ML Facade

> The single gateway over `dghs-imgutils` — the ONLY module that imports it — with a deterministic heuristic fallback so the pipeline runs with no ONNX weights.

## Source

- `backend/app/engine/models.py` — primary implementation

## How it works

`has_ml()` (lru-cached) gates every model call: it lazy-imports imgutils so the sidecar boots without the heavy ONNX stack. When imgutils is absent, each function returns a deterministic fallback — a weak 16×16 colour embedding (768-d) stands in for [[CCIP]], the gate assumes "anime illustration", and rating assumes SFW. This is why the whole pipeline and the test suite run end-to-end with no weights downloaded.

It pins `model='ccip-caformer_b36-24'` on every CCIP call and loads its own threshold (~0.2132). It forces offline (`HF_HUB_OFFLINE=1`) at inference. Covers CCIP extract/merge/cluster/difference, LPIPS, the gate classifiers, WD14/PixAI tagging, and rating/censor detection.

## Depends on

- [[dghs-imgutils Integration]] — the wrapped library
- [[ONNX Runtime]] — inference backend

## Used by

- [[Dedup Phase]], [[Media Gate Phase]], [[Tagging Phase]], [[Identify Phase]], [[Cluster Phase]], [[Gallery Prototypes]], [[Nude Policy]]

## Gotchas

- NEVER import imgutils outside this module — the lazy import here is what keeps the sidecar bootable.
- imgutils signatures shift between releases (esp. `get_pixai_tags`); REPL-verify before relying on them.

## See also

- [[_index]]
- [[ML Facade Pattern]]
- [[Heuristic Fallback Pattern]]
