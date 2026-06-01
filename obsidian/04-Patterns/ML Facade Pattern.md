---
tags: [pattern]
---

# ML Facade Pattern

> Route every call into `dghs-imgutils` through one module so the sidecar can boot without weights and the vision API stays swappable.

## When to apply

Any time you need a model inference (CCIP identity, tagging, rating, media gate, LPIPS). Add the call to [[ML Facade]] (`models.py`), never inline elsewhere.

## The pattern

```python
# models.py — the ONLY importer of dghs-imgutils
def ccip_embed(image):
    if not has_ml():
        return _fallback_embedding(image)  # see [[Heuristic Fallback Pattern]]
    from imgutils.metrics import ccip_extract_feature  # lazy import
    return ccip_extract_feature(image, model="ccip-caformer_b36-24")
```

`has_ml()` gates every call; the import is lazy so the process boots weightless.

## Why

The lazy, single-site import is what keeps the sidecar runnable with no ONNX weights downloaded — and what lets the whole test suite run. Centralizing also means imgutils' shifting per-release API has exactly one place to fix.

## Don't

- Don't import `imgutils` outside `models.py` — breaks weightless boot and scatters the API surface.
- Don't assume a stable imgutils signature — REPL-verify each release.
- Don't omit `model='ccip-caformer_b36-24'` on [[CCIP]] calls.

## See also

- [[_index]]
- [[Heuristic Fallback Pattern]]
- [[dghs-imgutils Integration]]
- [[ONNX Runtime]]
