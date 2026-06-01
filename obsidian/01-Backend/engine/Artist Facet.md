---
tags: [backend, engine]
---

# Artist Facet

> Resolve artist identity from metadata sidecars — a metadata problem, not a vision one — with reverse-image lookup as a residual fallback.

## Source

- `backend/app/engine/artist.py` — primary implementation

## How it works

`resolve_for_image` is the deterministic primary: `_find_sidecar` locates the `.json` that `gallery-dl` writes next to the image (`image.jpg.json` or `image.json`), and `_parse_sidecar` extracts `(platform, platform_uid, display_name)` — Pixiv `user.id`/`user.name`, Patreon creator, Twitter author, or generic `artist`. It keys on the stable platform uid via `get_or_create_artist`, then writes `artist_id`, `artist_conf=1.0`, `artist_source='metadata'`.

`artist_name` resolves an id to its display name (preferring `alias`). Reverse-image lookup (SauceNAO/IQDB/ascii2d) and style clustering are residual-only fallbacks wired as a throttled optional step in `server.py`.

## Depends on

- [[SQLite Repository]] — `artists` table
- [[Reverse Image Lookup]] — residual fallback (wired in server)

## Used by

- [[Identify Phase]] — artist facet resolution
- [[Routing and Commit]] — artist path component + manifest

## See also

- [[_index]]
- [[Facet]]
- [[Identity Resolution Flow]]
