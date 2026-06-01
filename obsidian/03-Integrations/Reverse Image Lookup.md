---
tags: [integration]
---

# Reverse Image Lookup

> SauceNAO / IQDB / ascii2d reverse-image services used as a residual-only, throttled fallback to identify an artist when no metadata sidecar exists.

## Used for

- [[Artist Facet]] — residual fallback after the deterministic metadata path fails

## Configuration

- API key (SauceNAO) stored in the SQLite `settings` table
- Throttled, opt-in; wired as an optional step in `server.py`

## Wire-up

- `backend/app/engine/artist.py` — metadata-first resolver; lookup is the documented residual fallback

## Auth mode

API key (SauceNAO); IQDB / ascii2d are keyless

## Gotchas

- Not the primary path — artist identity is a metadata problem first: `gallery-dl` `.json` sidecars (Pixiv `user.name`/`user.id`, Patreon creator) keyed on the stable platform uid resolve before any lookup runs.

## See also

- [[_index]]
- [[Artist Facet]]
- [[Identify Phase]]
