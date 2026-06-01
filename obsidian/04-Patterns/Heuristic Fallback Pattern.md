---
tags: [pattern]
---

# Heuristic Fallback Pattern

> When ML weights are absent, return a deterministic stand-in so the whole pipeline still runs end-to-end.

## When to apply

Inside any [[ML Facade]] function, behind the `has_ml()` guard — whenever a real model would be called but imgutils is not installed.

## The pattern

```python
def ccip_embed(image):
    if not has_ml():
        return _weak_color_embedding(image, size=16)  # deterministic, not learned
    ...
```

Fallbacks: a weak 16×16 colour embedding stands in for [[CCIP]], the media gate assumes "anime illustration", rating assumes SFW. All deterministic, so tests are reproducible.

## Why

Lets the full scan→dedup→gate→identify→preview→commit pipeline and the test suite run with zero ONNX weights downloaded — no large offline model fetch needed for CI or first-run dev.

## Don't

- Don't let a fallback masquerade as a real result — it is deterministic but weak; gate behavior on `has_ml()` where accuracy matters.
- Don't make fallbacks non-deterministic — reproducible tests depend on it.

## See also

- [[_index]]
- [[ML Facade Pattern]]
- [[CCIP]]
- [[dghs-imgutils Integration]]
