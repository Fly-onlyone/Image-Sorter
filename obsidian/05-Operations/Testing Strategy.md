---
tags: [operations]
---

# Testing Strategy

> The heuristic fallback lets the entire pipeline run with zero ONNX weights, so the suite exercises scan→commit end-to-end under FastAPI's TestClient.

## Source

- `tests/test_pipeline.py` — pipeline + unit tests driven via `TestClient`
- `backend/app/engine/models.py` — `has_ml()` gate + deterministic fallbacks

## How it works

The [[Heuristic Fallback Pattern]] in the [[ML Facade]] returns deterministic stand-ins when
`dghs-imgutils` is absent (a weak 16×16 colour embedding for [[CCIP]], "anime illustration" at
the gate, SFW rating). This means the full
`scan → dedup → gate → identify → preview → commit` flow runs with **no ONNX models
downloaded**, so the test suite is fast and offline.

```powershell
uv run pytest -q                                              # full suite
uv run pytest tests/test_pipeline.py::test_full_pipeline -q   # one test
```

Gotcha: synthetic test images must have **spatial content** (gradients/patterns), not flat
colours. A flat image has no frequency content, so every flat image shares one perceptual hash
and dedup collapses them all into one.

## Depends on

- [[ML Facade]] — the gateway whose fallback makes weightless testing possible
- [[Heuristic Fallback Pattern]] — the deterministic substitutes
- [[Per-Run Pipeline]] — the chain the tests drive end-to-end

## See also

- [[_index]]
- [[Linting and Formatting]]
- [[Backend Dev Workflow]]
