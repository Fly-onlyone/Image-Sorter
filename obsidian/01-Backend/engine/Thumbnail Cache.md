---
tags: [backend, engine]
---

# Thumbnail Cache

> A 256px WEBP thumbnail cache keyed by content hash that keeps the review grid fast and avoids re-decoding full images.

## Source

- `backend/app/engine/thumbs.py` — primary implementation

## How it works

`thumb_path` maps a content hash to `<thumbs_dir>/<hash>.webp` under the app data directory. `ensure_thumb` is idempotent: if the file already exists it returns it; otherwise it opens the source, applies EXIF transpose, converts to RGB, downscales to `THUMB_SIZE = (256, 256)`, and saves WEBP at quality 80. Failures return `None` rather than raising, so one bad image never breaks a scan.

Because the cache key is the SHA-256 hash, thumbnails survive across runs and file moves ([[Content-Hash Keying Pattern]]).

## Depends on

- [[Settings Config]] — `thumbs_dir` location

## Used by

- [[Ingest Phase]] — calls `ensure_thumb` per scanned image
- [[FastAPI Server]] — `GET /thumb`

## See also

- [[_index]]
- [[Content-Hash Idempotency]]
