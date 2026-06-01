---
tags: [pattern]
---

# Content-Hash Keying Pattern

> Use an image's SHA-256 content hash as the primary key for every table and cross-phase lookup.

## When to apply

Whenever you store, look up, or correlate per-image data across phases or across runs.

## The pattern

```python
# ingest.py — scan phase
sha = hashlib.sha256(image_bytes).hexdigest()
db.execute("INSERT OR IGNORE INTO images(hash, width, height) VALUES (?,?,?)",
           (sha, w, h))
```

Every downstream phase joins on `hash`, not a path or row id. [[Ingest Phase]] computes it once; [[Database Schema]] keys on it.

## Why

Content hashing makes the pipeline idempotent (rerun = no-op for seen images), cross-run cacheable (CCIP features survive between runs), and in-place safe (scan skips already-manifested hashes). See [[Content-Hash Idempotency]].

## Don't

- Don't key on file path — paths move, hashes don't.
- Don't use a perceptual hash as the primary key — that's for near-dup grouping, not identity.

## See also

- [[_index]]
- [[Content-Hash Idempotency]]
- [[Ingest Phase]]
- [[Database Schema]]
