---
tags: [moc, glossary]
---

# Glossary — Map of Content

> Domain terms that recur across the vault. The most-linked ones have their own atomic
> note; quick definitions live inline below.

## Term notes

- [[CCIP]] — Contrastive Character Image Pre-training; the embedding model behind identity match
- [[Facet]] — an identity dimension to sort by: `character` or `artist`
- [[Residual]] — images left unidentified after gallery match, fed to clustering
- [[Prototype]] — a stored CCIP feature vector representing one character outfit

## Quick definitions

- **media_type** — gate verdict ∈ {anime, other, review} that decides the top-level bucket.
- **dup_role** — dedup outcome; losers flagged `trashed`, sent to Recycle Bin at commit.
- **phash** — perceptual hash (`imagehash.phash`) used for near-duplicate grouping.
- **LPIPS** — learned perceptual image similarity, the optional dedup gray-zone confirm.
- **manifest** — the per-run record of final routing decisions written at commit.
- **in-place** — when output dir == input dir, files are *moved* rather than copied.

## See also

- [[_HOME]]
- [[Identity Resolution Flow]] · [[Dedup Phase]] · [[Media Gate Phase]] · [[Gallery Prototypes]]
